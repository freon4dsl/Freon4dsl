import { PiLangElement, PiClassifier, PiConcept, PiConceptProperty, PiFunction, PiInstance, PiLanguage, PiProperty } from "./internal";
import { Names, ParseLocation } from "../../utils";
// The next import should be separate and the last of the imports.
// Otherwise, the run-time error 'Cannot read property 'create' of undefined' occurs.
// See: https://stackoverflow.com/questions/48123645/error-when-accessing-static-properties-when-services-include-each-other
// and: https://stackoverflow.com/questions/45986547/property-undefined-typescript
import { PiElementReference } from ".";

/** This module contains classes that implement Expressions over the PiLanguage structure.
 *  There are five types of Expressions:
 *  1. Simple expression: a simple value, currently only numbers
 *  2. Instance expression: an expression that refers to a predefined instance of a limited concept, e.g. DemoAttributeType:Integer
 *  3. Functions expression: an expression that refers to one of the functions that may be used in the typer and/or validator, like 'conformsto'
 *  4. Concept expression: an expression that refers to a keyword, currently only 'container'
 *  5. Self expression: an expression that refers to a property of a classifier, like 'self.age'
 */

export abstract class PiLangExp extends PiLangElement {
    sourceName: string;							        // either the 'XXX' in "XXX.yyy" or 'yyy' in "yyy"
    appliedfeature: PiLangAppliedFeatureExp;	        // either the 'yyy' in "XXX.yyy" or 'null' in "yyy"
    __referredElement: PiElementReference<PiLangElement>;  // refers to the element called 'sourceName'
    location: ParseLocation;                            // holds start and end in the parsed file
    language: PiLanguage;                           // the language for which this expression is defined

    // returns the property to which the complete expression refers, i.e. the element to which the 'd' in 'a.b.c.d' refers.
    findRefOfLastAppliedFeature(): PiProperty {
        if (!!this.language) {
            if (this.appliedfeature !== undefined) {
                // console.log(" last of: " + this.appliedfeature.sourceName);
                return this.appliedfeature.findRefOfLastAppliedFeature();
            } else {
                const found: PiLangElement = this.__referredElement?.referred;
                // console.log("found reference: " + found?.name + " of type " + typeof found);
                if (found instanceof PiProperty) {
                    return found;
                }
            }
        } else {
            throw Error("Applied feature cannot be found because language is not set.")
        }
        return null;
    }

    toPiString(): string {
        return "SHOULD BE IMPLEMENTED BY SUBCLASSES OF 'PiLangExpressions.PiLangExp'";
    }
}

export class PiLangSimpleExp extends PiLangExp {
    value: number;

    findRefOfLastAppliedFeature(): PiProperty {
        return null;
    }

    toPiString(): string {
        return this.value?.toString();
    }
}

export class PiLangSelfExp extends PiLangExp {

    static create(referred: PiClassifier): PiLangSelfExp {
        const result = new PiLangSelfExp();
        result.__referredElement = PiElementReference.create<PiClassifier>(referred, "PiClassifier");
        result.__referredElement.owner = result;
        result.sourceName = Names.nameForSelf;
        return result;
    }

    __referredElement: PiElementReference<PiClassifier>; // is not needed, can be determined based on its parent

    toPiString(): string {
        if (!!this.sourceName) {
            return this.sourceName + (this.appliedfeature ? ("." + this.appliedfeature.toPiString()) : "");
        } else { // e.g. in isunique validation rules
            return this.appliedfeature ? this.appliedfeature.toPiString() : "";
        }
    }
}

export class PiInstanceExp extends PiLangExp {
    // sourceName should be name of a limited concept
    instanceName: string;   // should be name of one of the predefined instances of 'sourceName'
    __referredElement: PiElementReference<PiInstance>;

    toPiString(): string {
        return this.sourceName + ":" + this.instanceName;
    }
}

export class PiLangConceptExp extends PiLangExp {
    __referredElement: PiElementReference<PiClassifier>;

    toPiString(): string {
        return this.sourceName + (this.appliedfeature ? ("." + this.appliedfeature.toPiString()) : "");
    }
}

export class PiLangAppliedFeatureExp extends PiLangExp {

    static create(owner: PiLangExp, name: string, referred: PiProperty): PiLangAppliedFeatureExp {
        const result = new PiLangAppliedFeatureExp();
        result.referredElement = referred;
        result.sourceName = name;
        result.sourceExp = owner;
        return result;
    }

    sourceExp: PiLangExp;
    __referredElement: PiElementReference<PiProperty>;

    get referredElement(): PiProperty {
        return this.__referredElement?.referred;
    }

    set referredElement(p: PiProperty) {
        this.__referredElement = PiElementReference.create<PiProperty>(p, "PiProperty");
        this.__referredElement.owner = this;
    }

    get reference(): PiElementReference<PiProperty> {
        return this.__referredElement;
    }

    set reference(p: PiElementReference<PiProperty>) {
        this.__referredElement = p;
        this.__referredElement.owner = this;
    }

    toPiString(): string {
        return this.sourceName + (this.appliedfeature ? ("." + this.appliedfeature.toPiString()) : "");
    }

    findRefOfLastAppliedFeature(): PiProperty {
        if (this.appliedfeature !== undefined) {
            // console.log(" last of: " + this.appliedfeature.sourceName);
            return this.appliedfeature.findRefOfLastAppliedFeature();
        } else {
            // console.log("found reference: " + this.referredElement?.referred?.name);
            return this.__referredElement?.referred;
        }
    }
}

export class PiLangFunctionCallExp extends PiLangExp {
    // sourceName: string; 			// only used in validator for 'conformsTo' and 'equalsType'
    actualparams: PiLangExp[] = [];
    returnValue: boolean;
    __referredElement: PiElementReference<PiFunction>;

    toPiString(): string {
        let actualPars: string = "( ";
        if (!!this.actualparams) {
            for (const actual of this.actualparams) {
                actualPars = actualPars.concat(actual.toPiString());
                if (this.actualparams.indexOf(actual) !== this.actualparams.length - 1) {
                    actualPars = actualPars.concat(", ");
                }
            }
        }
        actualPars = actualPars.concat(` )`);
        return this.sourceName + actualPars + (this.appliedfeature ? ("." + this.appliedfeature.toPiString()) : "");
    }
}
