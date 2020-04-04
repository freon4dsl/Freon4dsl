import {
    PiLangConcept,
    PiLangConceptProperty,
    PiLangElement,
    PiLangEnumeration,
    PiLangFunction,
    PiLangProperty
} from ".";

// Expressions over the PiLanguage structure

export abstract class PiLangExp {
    sourceName: string;							// either the 'XXX' in "XXX.yyy" or 'yyy' in "yyy"
    appliedfeature: PiLangAppliedFeatureExp;	// either the 'yyy' in "XXX.yyy" or 'null' in "yyy"
    referedElement: PiLangElement;			    // refers to the element called 'sourceName'

    // returns the element to which the complete expression refers, i.e. the element to which the 'd' in 'a.b.c.d' refers.
    findRefOfLastAppliedFeature(): PiLangProperty {
        return this.appliedfeature?.findRefOfLastAppliedFeature();
    }

    toPiString(): string {
        return "SHOULD BE IMPLEMENTED BY SUBCLASSES OF 'PiLangExpressions.PiLangExp'";
    }

}

export class PiLangThisExp extends PiLangExp {
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
        return this.sourceName + (isRef ? ".referred" : "") + (this.appliedfeature ? ("." + this.appliedfeature.toPiString()) : "");
    }

    findRefOfLastAppliedFeature(): PiLangProperty {
        if (this.appliedfeature !== undefined) {
            console.log(" last of: " + this.appliedfeature.sourceName);
            return this.appliedfeature.findRefOfLastAppliedFeature();
        } else {
            console.log("found reference: " + this.referedElement?.name);
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
        return this.sourceName + (this.appliedfeature ? ("." + this.appliedfeature.toPiString()) : "");
    }
}
