import { PiLangElement, PiLanguageUnit, PiLangClass, PiLangConcept, PiLangInterface, 
	PiLangEnumeration, PiLangUnion, PiLangExpressionConcept, PiLangBinaryExpressionConcept, PiLangProperty, PiLangPrimitiveProperty, PiLangEnumProperty, PiLangConceptProperty, PiLangFunction } from "./PiLanguage";
import { ParseLocation } from "../../utils";

// Language references

// this should be the implementation of the references
// but we do not want to use the generic types
// therefore we have decided to make a reference class inheritance hierarchy
// class PiLangReference<T> {
// 	name: string;
	
// 	referedElement() T {
// 		[LanguageName]Environment. getInstance().scoper.resolve(this.getParent(), name);
// 	}	
// }

// the references classes
// the hierarchy mirrors the hierarchy of the language structure

// root of the references 
export class PiLangElementReference {
	location: ParseLocation;
	language: PiLanguageUnit;
	name: string; // maybe later this should be path
	
	referedElement() : PiLangElement {
		// return this.language?.findElement(this.name);
		return null; // Should be implemented by subclasses
	}
}

export class PiLangConceptReference extends PiLangElementReference {
	referedElement() : PiLangConcept {
		return this.language?.findConcept(this.name);
	}
}

export class PiLangClassReference extends PiLangConceptReference {
	referedElement() : PiLangClass {
		return this.language?.findClass(this.name);
	}
}

export class PiLangInterfaceReference extends PiLangConceptReference {
	referedElement() : PiLangInterface {
		return this.language?.findInterface(this.name);
	}
}

export class PiLangEnumerationReference extends PiLangConceptReference {
	referedElement() : PiLangEnumeration {
		console.log("PiLangEnumerationReference.referedElement()");
		return this.language?.findEnumeration(this.name);
	}
}

export class PiLangUnionReference extends PiLangConceptReference {
	referedElement() : PiLangUnion {
		return this.language?.findUnion(this.name);
	}
}

export class PiLangExpressionConceptReference extends PiLangClassReference {
	referedElement() : PiLangExpressionConcept {
		return this.language?.findExpressionConcept(this.name);
	}
}

export class PiLangBinaryExpConceptReference extends PiLangExpressionConceptReference {
	referedElement() : PiLangBinaryExpressionConcept {
		return this.language?.findBinaryExpConcept(this.name);
	}
}

export class PiLangPropertyReference extends PiLangElementReference {
	owningConcept: PiLangConceptReference;

	referedElement() : PiLangProperty {
		return this.owningConcept.referedElement().findProperty(this.name);
	}
}

export class PiLangPrimitivePropertyReference extends PiLangPropertyReference {
	referedElement() : PiLangPrimitiveProperty {
		return this.owningConcept.referedElement().findPrimitiveProperty(this.name);
	}
}

export class PiLangEnumPropertyReference extends PiLangPropertyReference {
	referedElement() : PiLangEnumProperty {
		return this.owningConcept.referedElement().findEnumProperty(this.name);
	}
}

export class PiLangConceptPropertyReference extends PiLangPropertyReference {
	referedElement() : PiLangConceptProperty {
		return this.owningConcept.referedElement().findConceptProperty(this.name);
	}
}

export class PiLangFunctionReference extends PiLangElementReference {
	owningConcept: PiLangConceptReference;
	formalparams: PiLangConceptReference[];

	referedElement() : PiLangFunction {
		return this.owningConcept.referedElement().findFunction(name, this.formalparams);
	}
}
