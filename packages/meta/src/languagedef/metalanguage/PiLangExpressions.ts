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
    // TODO appliedfeature could be moved to SelfExp, is not used elsewhere
    appliedfeature: PiLangAppliedFeatureExp;	        // either the 'yyy' in "XXX.yyy" or 'null' in "yyy"
    referredElement: PiElementReference<PiLangElement>;  // refers to the element called 'sourceName'
    location: ParseLocation;                            // holds start and end in the parsed file
    language: PiLanguage;                           // the language for which this expression is defined

    // returns the element to which the complete expression refers, i.e. the element to which the 'd' in 'a.b.c.d' refers.
    findRefOfLastAppliedFeature(): PiProperty {
        // TODO should this method return something else then null, when there is no applied feature???
        return this.appliedfeature?.findRefOfLastAppliedFeature();
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

    static create(referred: PiConcept): PiLangSelfExp {
        const result = new PiLangSelfExp();
        result.referredElement = PiElementReference.create<PiConcept>(referred, "PiConcept");
        result.referredElement.owner = result;
        result.sourceName = Names.nameForSelf;
        return result;
    }

    referredElement: PiElementReference<PiClassifier>; // is not needed, can be determined based on its parent

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
    referredElement: PiElementReference<PiInstance>;

    toPiString(): string {
        return this.sourceName + ":" + this.instanceName;
    }
}

export class PiLangConceptExp extends PiLangExp {
    referredElement: PiElementReference<PiClassifier>;

    toPiString(): string {
        return this.sourceName + (this.appliedfeature ? ("." + this.appliedfeature.toPiString()) : "");
    }
}

export class PiLangAppliedFeatureExp extends PiLangExp {

    static create(owner: PiLangExp, name: string, referred: PiProperty): PiLangAppliedFeatureExp {
        const result = new PiLangAppliedFeatureExp();
        result.referredElement = PiElementReference.create<PiProperty>(referred, "PiProperty");
        result.referredElement.owner = result;
        result.sourceName = name;
        result.sourceExp = owner;
        return result;
    }

    sourceExp: PiLangExp;
    referredElement: PiElementReference<PiProperty>;

    toPiString(): string {
        let isRef: boolean = false;
        if (!!this.referredElement) {
            const ref = this.referredElement.referred;
            isRef = (ref instanceof PiConceptProperty) && ref.owningConcept.references().some(r => r === ref);
        }
        // return this.sourceName + (isRef ? ".referred" : "") + (this.appliedfeature ? ("." + this.appliedfeature.toPiString()) : "");
        return this.sourceName + (this.appliedfeature ? ("." + this.appliedfeature.toPiString()) : "");
    }

    findRefOfLastAppliedFeature(): PiProperty {
        if (this.appliedfeature !== undefined) {
            // console.log(" last of: " + this.appliedfeature.sourceName);
            return this.appliedfeature.findRefOfLastAppliedFeature();
        } else {
            // console.log("found reference: " + this.referredElement?.referred?.name);
            return this.referredElement?.referred;
        }
    }
}

export class PiLangFunctionCallExp extends PiLangExp {
    // sourceName: string; 			// only used in validator for 'conformsTo' and 'equalsType'
    actualparams: PiLangExp[] = [];
    returnValue: boolean;
    referredElement: PiElementReference<PiFunction>;

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
