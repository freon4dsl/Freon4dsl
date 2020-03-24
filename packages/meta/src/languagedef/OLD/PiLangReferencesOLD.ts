// import { PiLanguageUnit, PiLangConcept, PiLangEnumeration, PiLangCUI, PiLangInterface, PiLangUnion, PiLangCI, PiLangProperty, PiLangElement } from "./PiLanguage";
// // The root of all reference classes
// export abstract class PiLangReference {
//     language: PiLanguageUnit; // should be a path to the language unit, not a direct link
//     name: string;

//     referedElement(): PiLangElement {
//         // [LanguageName]Environment.getInstance().scoper.resolve(languagePath, name);
//         // for now
//         if(!!this.language) return this.language.findElement(this.name);        
//     }
// }

// export class PiLangElementReference extends PiLangReference {
//     language: PiLanguageUnit;
//     name: string;

//     referedElement(): PiLangElement {
//         if(!!this.language) return this.language.findElement(this.name);
//     }
// }
// export class PiLangEnumerationReference extends PiLangReference {
//     language: PiLanguageUnit;
//     name: string;

//     referedElement(): PiLangEnumeration {
//         if(!!this.language) return this.language.findEnumeration(this.name);
//     }
// }

// // OLD stuff below, should be changed into the new classes 
// export class PiLangCUIReference {
//     language: PiLanguageUnit;
//     name: string;

//     concept(): PiLangCUI {
//         if(!!this.language) return this.language.findCUI(this.name);
//     }
// }

// export class PiLangCIReference {
//     language: PiLanguageUnit;
//     name: string;

//     concept(): PiLangCI {
//         if(!!this.language) return this.language.findCI(this.name);
//     }
// }

// // export class PiLangConceptReference extends PiLangCUIReference {
// //     language: PiLanguageUnit;
// //     name: string;

// //     concept(): PiLangConcept {
// //         if(!!this.language) return this.language.findConcept(this.name);
// //     }
// // }

// export class PiLangInterfaceReference extends PiLangCUIReference {
//     language: PiLanguageUnit;
//     name: string;

//     concept(): PiLangInterface {
//         if(!!this.language) return this.language.findInterface(this.name);
//     }
// }
// export class PiLangUnionReference extends PiLangCUIReference {
//     language: PiLanguageUnit;
//     name: string;

//     concept(): PiLangUnion {
//         if(!!this.language) return this.language.findUnion(this.name);
//     }
// }



// // The following classes combine the parse model (CST) of the validation definition (.valid file) with its AST.
// // All AST values have prefix 'ast'. They are set in the ValidatorChecker.

// export abstract class LangRefExpression {
//     sourceName: string;                         // either the 'XXX' in "XXX.yyy" or 'yyy' in "yyy"
//     appliedFeature?: PropertyRefExpression;     // either the 'yyy' in "XXX.yyy" or 'null' in "yyy"
    
//     // returns the element to which the complete expression refers, i.e. the element to which the 'd' in 'a.b.c.d' refers.
//     findAstOfLastAppliedFeature(): PiLangProperty {
//         if (this.appliedFeature !== undefined) return this.appliedFeature.findAstOfLastAppliedFeature();
//     }

//     toPiString() : string {
//         return "SHOULD BE IMPLEMENTED BY SUBCLASSES OF 'ValidatorDefLang.LangRefExpression'";
//     }
// }
// export class ThisExpression extends LangRefExpression {
//     astConcept: PiLangCUI; // is set by the checker

//     toPiString() : string {
//         let feat : string = this.appliedFeature ? '.' + this.appliedFeature.toPiString() : ""; 
//         return this.sourceName + feat;  
//     }
// }

// export class EnumRefExpression extends LangRefExpression {
//     // no appliedfeature !!!
//     literalName : string;
//     astEnumType: PiLangEnumeration; // is set by the checker

//     toPiString() : string {
//         return this.sourceName + ":" + this.literalName;  
//     }
// }

// export class PropertyRefExpression extends LangRefExpression {
//     astProperty: PiLangProperty; // is set by the checker

//     // returns the element to which the complete expression refers, i.e. the element to which the 'd' in 'a.b.c.d' refers.
//     findAstOfLastAppliedFeature(): PiLangProperty {
//         if (this.appliedFeature !== undefined) {
//             return this.appliedFeature.findAstOfLastAppliedFeature();
//         } else {
//             return this.astProperty;
//         }
//     }

//     toPiString() : string {
//         let feat : string = this.appliedFeature ? '.' + this.appliedFeature.toPiString() : ""; 
//         return this.sourceName + feat;  
//     }
// }
