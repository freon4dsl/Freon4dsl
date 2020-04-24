// import { PiLangElement, PiLanguageUnit, PiConcept, PiInterface,
// 	PiExpressionConcept, PiBinaryExpressionConcept, PiProperty, PiPrimitiveProperty,
// 	PiConceptProperty, PiFunction } from "./PiLanguage";
// import { ParseLocation } from "../../utils";
//
// // Language references
//
// // class PiLangReference<T> {
// // 	name: string;
// // 	referedElement() T {
// // 		[LanguageName]Environment. getInstance().scoper.resolve(this.getParent(), name);
// // 	}
// // }
//
// // the references classes
// // the hierarchy mirrors the hierarchy of the language structure
// // root of the references
// export class PiLangElementReference {
// 	location: ParseLocation;
// 	language: PiLanguageUnit;
// 	name: string; // maybe later this should be path
//
// 	referedElement() : PiLangElement {
// 		// return this.language?.findElement(this.name);
// 		return null; // Should be implemented by subclasses
// 	}
// }
//
// export class PiLangClassifierReference extends PiLangElementReference {
// 	referedElement() : PiLangClass {
// 		return this.language?.findClass(this.name);
// 	}
//
// 	static create(name: string, language: PiLanguageUnit): PiLangClassifierReference {
// 		const result = new PiLangClassifierReference();
// 		result.name = name;
// 		result.language = language;
// 		return result;
// 	}
// }
//
// export class PiLangConceptReference extends PiLangClassifierReference {
// 	referedElement() : PiConcept {
// 		return this.language?.findConcept(this.name);
// 	}
// }
//
//
// export class PiLangInterfaceReference extends PiLangConceptReference {
// 	referedElement() : PiInterface {
// 		return this.language?.findInterface(this.name);
// 	}
// }
//
// export class PiLangEnumerationReference extends PiLangConceptReference {
// 	referedElement() : PiLangEnumeration {
// 		return this.language?.findEnumeration(this.name);
// 	}
// }
//
// export class PiLangUnionReference extends PiLangConceptReference {
// 	referedElement() : PiLangUnion {
// 		return this.language?.findUnion(this.name);
// 	}
// }
//
// export class PiLangExpressionConceptReference extends PiLangClassReference {
// 	referedElement() : PiExpressionConcept {
// 		return this.language?.findExpressionConcept(this.name);
// 	}
// }
//
// export class PiLangBinaryExpConceptReference extends PiLangExpressionConceptReference {
// 	referedElement() : PiBinaryExpressionConcept {
// 		return this.language?.findBinaryExpConcept(this.name);
// 	}
// }
//
// export class PiLangPropertyReference extends PiLangElementReference {
// 	owningConcept: PiLangConceptReference;
//
// 	referedElement() : PiProperty {
// 		return this.owningConcept.referedElement().findProperty(this.name);
// 	}
// }
//
// export class PiLangPrimitivePropertyReference extends PiLangPropertyReference {
// 	referedElement() : PiPrimitiveProperty {
// 		return this.owningConcept.referedElement().findPrimitiveProperty(this.name);
// 	}
// }
//
// export class PiLangEnumPropertyReference extends PiLangPropertyReference {
// 	referedElement() : PiLangEnumProperty {
// 		return this.owningConcept.referedElement().findEnumProperty(this.name);
// 	}
// }
//
// export class PiLangConceptPropertyReference extends PiLangPropertyReference {
// 	referedElement() : PiConceptProperty {
// 		return this.owningConcept.referedElement().findConceptProperty(this.name);
// 	}
// }
//
// export class PiLangFunctionReference extends PiLangElementReference {
// 	owningConcept: PiLangConceptReference;
// 	formalparams: PiLangConceptReference[];
//
// 	referedElement() : PiFunction {
// 		return this.owningConcept.referedElement().findFunction(name, this.formalparams);
// 	}
// }
