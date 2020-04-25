import {
    PiConcept,
    PiConceptProperty,
    PiLangElement,
    PiFunction,
    PiProperty, PiElementReference, PiInstance
} from ".";
import { ParseLocation } from "../../utils";

// Expressions over the PiLanguage structure

export abstract class PiLangExp {
    sourceName: string;							        // either the 'XXX' in "XXX.yyy" or 'yyy' in "yyy"
    appliedfeature: PiLangAppliedFeatureExp;	        // either the 'yyy' in "XXX.yyy" or 'null' in "yyy"
    referedElement: PiElementReference<PiLangElement>;  // refers to the element called 'sourceName'
    location: ParseLocation;                            // holds start and end in the parsed file

    // returns the element to which the complete expression refers, i.e. the element to which the 'd' in 'a.b.c.d' refers.
    findRefOfLastAppliedFeature(): PiProperty {
        return this.appliedfeature?.findRefOfLastAppliedFeature();
    }

    toPiString(): string {
        return "SHOULD BE IMPLEMENTED BY SUBCLASSES OF 'PiLangExpressions.PiLangExp'";
    }

}

export class PiLangSelfExp extends PiLangExp {
    referedElement: PiElementReference<PiConcept>; // is not needed, can be determined based on its parent

    toPiString(): string {
        return this.sourceName + (this.appliedfeature ? ("." + this.appliedfeature.toPiString()) : "");
    }
}

export class PiInstanceExp extends PiLangExp {
    referedElement: PiElementReference<PiInstance>;

    toPiString(): string {
        return this.sourceName + (this.appliedfeature?.sourceName ? (":" + this.appliedfeature.sourceName) : "");
    }
}

export class PiLangConceptExp extends PiLangExp {
    referedElement: PiElementReference<PiConcept>;

    toPiString(): string {
        return this.sourceName + (this.appliedfeature ? ("." + this.appliedfeature.toPiString()) : "");
    }
}

export class PiLangAppliedFeatureExp extends PiLangExp {
    referedElement: PiElementReference<PiProperty>;

    toPiString(): string {
        let isRef: boolean = false;
        if (!!this.referedElement) {
            const ref = this.referedElement;
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
            // console.log("found reference: " + this.referedElement?.name);
            return this.referedElement.referred;
        }
    }

    static create(name: string, referred: PiProperty): PiLangAppliedFeatureExp {
        const result = new PiLangAppliedFeatureExp();
        result.referedElement = PiElementReference.create<PiProperty>(referred, "PiProperty");
        result.sourceName = name;
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

export function langExpToTypeScript(exp: PiLangExp): string {
    // if (exp instanceof PiLangEnumExp) {
    //     return `${exp.sourceName}.${exp.appliedfeature}`;
    // } else
    if (exp instanceof PiLangSelfExp) {
        return `modelelement.${langExpToTypeScript(exp.appliedfeature)}`;
    } else if (exp instanceof PiLangFunctionCallExp) {
        return `this.${exp.sourceName} (${exp.actualparams.map(
            param => `${this.makeTypeExp(param)}`
        ).join(", ")})`
    } else if (exp instanceof PiLangAppliedFeatureExp) {
        let isRef: boolean = false;
        if (!!exp.referedElement) {
            const ref = exp.referedElement;
            isRef = (ref instanceof PiConceptProperty) && ref.owningConcept.references().some(r => r === ref);
        }
        return exp.sourceName + (isRef ? ".referred" : "") + (exp.appliedfeature ? ("." + this.langRefToTypeScript(exp.appliedfeature)) : "");
    } else {
        return exp?.toPiString();
    }
}
