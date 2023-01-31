import { FreLangElement, FreClassifier, FreConcept, FreConceptProperty, FreFunction, FreInstance, FreLanguage, FreProperty } from "./internal";
import { Names, ParseLocation } from "../../utils";
// The next import should be separate and the last of the imports.
// Otherwise, the run-time error 'Cannot read property 'create' of undefined' occurs.
// See: https://stackoverflow.com/questions/48123645/error-when-accessing-static-properties-when-services-include-each-other
// and: https://stackoverflow.com/questions/45986547/property-undefined-typescript
import { MetaElementReference } from ".";

/** This module contains classes that implement Expressions over the FreLanguage structure.
 *  There are five types of Expressions:
 *  1. Simple expression: a simple value, currently only numbers
 *  2. Instance expression: an expression that refers to a predefined instance of a limited concept, e.g. DemoAttributeType:Integer
 *  3. Functions expression: an expression that refers to one of the functions that may be used in the typer and/or validator, like 'conformsto'
 *  4. Concept expression: an expression that refers to a keyword, currently only 'owner'
 *  5. Self expression: an expression that refers to a property of a classifier, like 'self.age'
 */

export abstract class FreLangExp extends FreLangElement {
    sourceName: string;							        // either the 'XXX' in "XXX.yyy" or 'yyy' in "yyy"
    appliedfeature: FreLangAppliedFeatureExp;	        // either the 'yyy' in "XXX.yyy" or 'null' in "yyy"
    __referredElement: MetaElementReference<FreLangElement>;  // refers to the element called 'sourceName'
    language: FreLanguage;                           // the language for which this expression is defined

    // returns the property to which the complete expression refers, i.e. the element to which the 'd' in 'a.b.c.d' refers.
    findRefOfLastAppliedFeature(): FreProperty {
        if (!!this.language) {
            if (this.appliedfeature !== undefined) {
                // console.log(" last of: " + this.appliedfeature.sourceName);
                return this.appliedfeature.findRefOfLastAppliedFeature();
            } else {
                const found: FreLangElement = this.__referredElement?.referred;
                // console.log("found reference: " + found?.name + " of type " + typeof found);
                if (found instanceof FreProperty) {
                    return found;
                }
            }
        } else {
            throw Error("Applied feature cannot be found because language is not set.")
        }
        return null;
    }

    toFreString(): string {
        return "SHOULD BE IMPLEMENTED BY SUBCLASSES OF 'FreLangExpressions.FreLangExp'";
    }
}

export class FreLangSimpleExp extends FreLangExp {
    value: number;

    findRefOfLastAppliedFeature(): FreProperty {
        return null;
    }

    toFreString(): string {
        return this.value?.toString();
    }
}

export class FreLangSelfExp extends FreLangExp {

    static create(referred: FreClassifier): FreLangSelfExp {
        const result = new FreLangSelfExp();
        result.__referredElement = MetaElementReference.create<FreClassifier>(referred, "FreClassifier");
        result.__referredElement.owner = result;
        result.sourceName = Names.nameForSelf;
        return result;
    }

    __referredElement: MetaElementReference<FreClassifier>; // is not needed, can be determined based on its parent

    toFreString(): string {
        if (!!this.sourceName) {
            return this.sourceName + (this.appliedfeature ? ("." + this.appliedfeature.toFreString()) : "");
        } else { // e.g. in isunique validation rules
            return this.appliedfeature ? this.appliedfeature.toFreString() : "";
        }
    }
}

export class FreInstanceExp extends FreLangExp {
    // sourceName should be name of a limited concept
    instanceName: string;   // should be name of one of the predefined instances of 'sourceName'
    __referredElement: MetaElementReference<FreInstance>;

    toFreString(): string {
        return this.sourceName + ":" + this.instanceName;
    }
}

export class FreLangConceptExp extends FreLangExp {
    __referredElement: MetaElementReference<FreClassifier>;

    toFreString(): string {
        return this.sourceName + (this.appliedfeature ? ("." + this.appliedfeature.toFreString()) : "");
    }
}

export class FreLangAppliedFeatureExp extends FreLangExp {

    static create(owner: FreLangExp, name: string, referred: FreProperty): FreLangAppliedFeatureExp {
        const result = new FreLangAppliedFeatureExp();
        result.referredElement = referred;
        result.sourceName = name;
        result.sourceExp = owner;
        return result;
    }

    sourceExp: FreLangExp;
    __referredElement: MetaElementReference<FreProperty>;

    get referredElement(): FreProperty {
        return this.__referredElement?.referred;
    }

    set referredElement(p: FreProperty) {
        this.__referredElement = MetaElementReference.create<FreProperty>(p, "FreProperty");
        this.__referredElement.owner = this;
    }

    get reference(): MetaElementReference<FreProperty> {
        return this.__referredElement;
    }

    set reference(p: MetaElementReference<FreProperty>) {
        this.__referredElement = p;
        this.__referredElement.owner = this;
    }

    toFreString(): string {
        return this.sourceName + (this.appliedfeature ? ("." + this.appliedfeature.toFreString()) : "");
    }

    findRefOfLastAppliedFeature(): FreProperty {
        if (this.appliedfeature !== undefined) {
            // console.log(" last of: " + this.appliedfeature.sourceName);
            return this.appliedfeature.findRefOfLastAppliedFeature();
        } else {
            // console.log("found reference: " + this.referredElement?.referred?.name);
            return this.__referredElement?.referred;
        }
    }
}

export class FreLangFunctionCallExp extends FreLangExp {
    // sourceName: string; 			// only used in validator for 'conformsTo' and 'equalsType'
    actualparams: FreLangExp[] = [];
    returnValue: boolean;
    __referredElement: MetaElementReference<FreFunction>;

    toFreString(): string {
        let actualPars: string = "( ";
        if (!!this.actualparams) {
            for (const actual of this.actualparams) {
                actualPars = actualPars.concat(actual.toFreString());
                if (this.actualparams.indexOf(actual) !== this.actualparams.length - 1) {
                    actualPars = actualPars.concat(", ");
                }
            }
        }
        actualPars = actualPars.concat(` )`);
        return this.sourceName + actualPars + (this.appliedfeature ? ("." + this.appliedfeature.toFreString()) : "");
    }
}
