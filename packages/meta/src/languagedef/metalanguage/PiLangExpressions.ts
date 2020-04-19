import {
    PiLangConcept,
    PiLangConceptProperty,
    PiLangElement,
    PiLangEnumeration,
    PiLangFunction,
    PiLangProperty
} from ".";
import { ParseLocation } from "../../utils";

// Expressions over the PiLanguage structure

export abstract class PiLangExp {
    sourceName: string;							// either the 'XXX' in "XXX.yyy" or 'yyy' in "yyy"
    appliedfeature: PiLangAppliedFeatureExp;	// either the 'yyy' in "XXX.yyy" or 'null' in "yyy"
    referedElement: PiLangElement;			    // refers to the element called 'sourceName'
    location: ParseLocation;                    // holds start and end in the parsed file

    // returns the element to which the complete expression refers, i.e. the element to which the 'd' in 'a.b.c.d' refers.
    findRefOfLastAppliedFeature(): PiLangProperty {
        return this.appliedfeature?.findRefOfLastAppliedFeature();
    }

    toPiString(): string {
        return "SHOULD BE IMPLEMENTED BY SUBCLASSES OF 'PiLangExpressions.PiLangExp'";
    }

}

export class PiLangSelfExp extends PiLangExp {
    referedElement: PiLangConcept; // is not needed, can be determined based on its parent

    toPiString(): string {
        return this.sourceName + (this.appliedfeature ? ("." + this.appliedfeature.toPiString()) : "");
    }
}

export class PiLangEnumExp extends PiLangExp {
    // (optional) appliedfeature is refered literal, i.e. its type is string
    referedElement: PiLangEnumeration;

    toPiString(): string {
        return this.sourceName + (this.appliedfeature?.sourceName ? (":" + this.appliedfeature.sourceName) : "");
    }
}

export class PiLangConceptExp extends PiLangExp {
    referedElement: PiLangConcept;

    toPiString(): string {
        return this.sourceName + (this.appliedfeature ? ("." + this.appliedfeature.toPiString()) : "");
    }
}

export class PiLangAppliedFeatureExp extends PiLangExp {
    referedElement: PiLangProperty;

    toPiString(): string {
        let isRef: boolean = false;
        if (!!this.referedElement) {
            const ref = this.referedElement;
            isRef = (ref instanceof PiLangConceptProperty) && ref.owningConcept.references.some(r => r === ref);
        }
        // return this.sourceName + (isRef ? ".referred" : "") + (this.appliedfeature ? ("." + this.appliedfeature.toPiString()) : "");
        return this.sourceName + (this.appliedfeature ? ("." + this.appliedfeature.toPiString()) : "");
    }

    findRefOfLastAppliedFeature(): PiLangProperty {
        if (this.appliedfeature !== undefined) {
            // console.log(" last of: " + this.appliedfeature.sourceName);
            return this.appliedfeature.findRefOfLastAppliedFeature();
        } else {
            // console.log("found reference: " + this.referedElement?.name);
            return this.referedElement;
        }
    }
}

export class PiLangFunctionCallExp extends PiLangExp {
    //sourceName: string; 			// in typer: name can only be 'commonSuperType', in validator: only 'conformsTo' and 'equalsType'
    actualparams: PiLangExp[]; 	  	// ElementExp, EnumerationExp, but no other subclasses allowed
    returnValue: boolean; 			// shift to typer and validator ???
    referedElement: PiLangFunction;

    toPiString(): string {
        let actualPars: string = '( ';
        for (let actual of this.actualparams) {
            actualPars = actualPars.concat(actual.toPiString());
            if (this.actualparams.indexOf(actual) !== this.actualparams.length -1) {
                actualPars = actualPars.concat(", ");
            }
        }
        actualPars = actualPars.concat(` )`);
        return this.sourceName + actualPars + (this.appliedfeature ? ("." + this.appliedfeature.toPiString()) : "");
    }
}

export function langExpToTypeScript(exp: PiLangExp): string {
    if (exp instanceof PiLangEnumExp) {
        return `${exp.sourceName}.${exp.appliedfeature}`;
    } else if (exp instanceof PiLangSelfExp) {
        return `modelelement.${langExpToTypeScript(exp.appliedfeature)}`;
    } else if (exp instanceof PiLangFunctionCallExp) {
        return `this.${exp.sourceName} (${exp.actualparams.map(
            param => `${this.makeTypeExp(param)}`
        ).join(", ")})`
    } else if (exp instanceof PiLangAppliedFeatureExp) {
        let isRef: boolean = false;
        if (!!exp.referedElement) {
            const ref = exp.referedElement;
            isRef = (ref instanceof PiLangConceptProperty) && ref.owningConcept.references.some(r => r === ref);
        }
        return exp.sourceName + (isRef ? ".referred" : "") + (exp.appliedfeature ? ("." + this.langRefToTypeScript(exp.appliedfeature)) : "");
    } else {
        return exp?.toPiString();
    }
}
