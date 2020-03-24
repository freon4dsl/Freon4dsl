import { PiLangElementReference, PiLangPropertyReference, PiLangConceptReference, PiLangEnumerationReference, PiLangFunctionReference } from "./PiLangReferences"
import { PiLangProperty } from "./PiLanguage";
// Expressions over the PiLanguage structure

export abstract class PiLangExp {
	sourceName: string;							// either the 'XXX' in "XXX.yyy" or 'yyy' in "yyy"
	appliedfeature?: PiLangAppliedFeatureExp;	// either the 'yyy' in "XXX.yyy" or 'null' in "yyy"
	reference: PiLangElementReference;			// refers to 'sourceName'

	// returns the element to which the complete expression refers, i.e. the element to which the 'd' in 'a.b.c.d' refers.
	findRefOfLastAppliedFeature(): PiLangProperty {
		return this.appliedfeature?.findRefOfLastAppliedFeature();
	}

	toPiString() : string {
		return "SHOULD BE IMPLEMENTED BY SUBCLASSES OF 'PiLangExpressions.PiLangExp'";
	}

}

export class PiLangThisExp extends PiLangExp {
	reference: PiLangConceptReference; // is not needed, can be determined based on its parent

	toPiString() : string {
        return this.sourceName + (this.appliedfeature ? ('.' + this.appliedfeature.toPiString()) : "");  
    }
}

export class PiLangEnumExp extends PiLangExp {
	// (optional) appliedfeature is refered literal, i.e. its type is string
	reference: PiLangEnumerationReference;

    toPiString() : string {
        return this.sourceName + (this.appliedfeature ? (":" + this.appliedfeature) : "");  
	}
}

export class PiLangConceptExp extends PiLangExp {
	reference: PiLangConceptReference;

	toPiString() : string {
        return this.sourceName + (this.appliedfeature ? ('.' + this.appliedfeature.toPiString()) : "");  
    }
}


export class PiLangAppliedFeatureExp extends PiLangExp {
	reference: PiLangPropertyReference;

	toPiString() : string {
        return this.sourceName + (this.appliedfeature ? ('.' + this.appliedfeature.toPiString()) : "");  
	}
	
	findRefOfLastAppliedFeature(): PiLangProperty {
		if (this.appliedfeature !== undefined) {
			return this.appliedfeature.findRefOfLastAppliedFeature();
		} else {
			return this.reference.referedElement();
		}
	}
}

export class PiLangFunctionCallExp extends PiLangExp {
	//sourceName: string; 			// in typer: name can only be 'commonSuperType', in validator: only 'conformsTo' and 'equalsType'
	actualparams: PiLangExp[]; 	  	// ElementExp, EnumerationExp, but no other subclasses allowed
	returnValue: boolean; 			// shift to typer and validator ???
	reference: PiLangFunctionReference;

	toPiString() : string {
        return this.sourceName + (this.appliedfeature ? ('.' + this.appliedfeature.toPiString()) : "");  
    }
}

// only used in the typer definition

class AnyTypeExp extends PiLangExp {
	// conceptually => reference: PiLangConceptReference[]; refers to all Concepts in LanguageUnit that are marked as type

	toPiString() : string {
        return "@allTypes" + (this.appliedfeature ? ('.' + this.appliedfeature.toPiString()) : "");  
    }
}
