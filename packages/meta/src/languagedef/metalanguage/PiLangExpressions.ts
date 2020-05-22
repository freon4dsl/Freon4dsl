import { PiConcept, PiConceptProperty, PiFunction, PiInstance, PiLanguageUnit, PiProperty } from ".";
import { Names, ParseLocation } from "../../utils";
import { PiLangElement } from "./PiLanguage";
// The next import should be separate and the last of the imports.
// Otherwise, the run-time error 'Cannot read property 'create' of undefined' occurs.
// See: https://stackoverflow.com/questions/48123645/error-when-accessing-static-properties-when-services-include-each-other
// and: https://stackoverflow.com/questions/45986547/property-undefined-typescript
import { PiElementReference } from "../../languagedef/metalanguage/PiElementReference";

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
    referedElement: PiElementReference<PiLangElement>;  // refers to the element called 'sourceName'
    location: ParseLocation;                            // holds start and end in the parsed file
    language: PiLanguageUnit;                           // the language for which this expression is defined

    // returns the element to which the complete expression refers, i.e. the element to which the 'd' in 'a.b.c.d' refers.
    findRefOfLastAppliedFeature(): PiProperty {
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
    referedElement: PiElementReference<PiConcept>; // is not needed, can be determined based on its parent

    toPiString(): string {
        if (!!this.sourceName) {
            return this.sourceName + (this.appliedfeature ? ("." + this.appliedfeature.toPiString()) : "");
        } else { // e.g. in isunique validation rules
            return this.appliedfeature ? this.appliedfeature.toPiString() : "";
        }
    }

    static create(referred: PiConcept): PiLangSelfExp {
        const result = new PiLangSelfExp();
        result.referedElement = PiElementReference.create<PiConcept>(referred, "PiConcept");
        result.referedElement.owner = result;
        result.sourceName = Names.nameForSelf;
        return result;
    }
}

export class PiInstanceExp extends PiLangExp {
    // sourceName should be name of a limited concept
    instanceName: string;   // should be name of one of the predefined instances of 'sourceName'
    referedElement: PiElementReference<PiInstance>;

    toPiString(): string {
        return this.sourceName + ":" + this.instanceName;
    }
}

export class PiLangConceptExp extends PiLangExp {
    referedElement: PiElementReference<PiConcept>;

    toPiString(): string {
        return this.sourceName + (this.appliedfeature ? ("." + this.appliedfeature.toPiString()) : "");
    }
}

export class PiLangAppliedFeatureExp extends PiLangExp {
    sourceExp: PiLangExp;
    referedElement: PiElementReference<PiProperty>;

    toPiString(): string {
        let isRef: boolean = false;
        if (!!this.referedElement) {
            const ref = this.referedElement.referred;
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
            // console.log("found reference: " + this.referedElement?.referred?.name);
            return this.referedElement?.referred;
        }
    }

    static create(owner: PiLangExp, name: string, referred: PiProperty): PiLangAppliedFeatureExp {
        const result = new PiLangAppliedFeatureExp();
        result.referedElement = PiElementReference.create<PiProperty>(referred, "PiProperty");
        result.referedElement.owner = result;
        result.sourceName = name;
        result.sourceExp = owner;
        return result;
    }
}

export class PiLangFunctionCallExp extends PiLangExp {
    //sourceName: string; 			// in typer: name can only be 'commonSuperType', in validator: only 'conformsTo' and 'equalsType'
    actualparams: PiLangExp[] = [];
    returnValue: boolean;
    referedElement: PiElementReference<PiFunction>;

    toPiString(): string {
        let actualPars: string = '( ';
        if (!!this.actualparams) {
            for (let actual of this.actualparams) {
                actualPars = actualPars.concat(actual.toPiString());
                if (this.actualparams.indexOf(actual) !== this.actualparams.length -1) {
                    actualPars = actualPars.concat(", ");
                }
            }
        }
        actualPars = actualPars.concat(` )`);
        return this.sourceName + actualPars + (this.appliedfeature ? ("." + this.appliedfeature.toPiString()) : "");
    }
}

