import { PiLanguageUnit, PiLangPrimitiveProperty, PiLangEnumProperty, PiLangConceptProperty, PiLangClassInterface } from "../../languagedef/metalanguage/PiLanguage";
import { PiLangClassReference, PiLangConceptReference } from "../../languagedef/metalanguage/PiLangReferences";

// Because during parsing we do not yet know whether a concept is a PiLangClass, PiLangClass, 
// or PiLangBinaryExpressionConcept, we parse it and create a temporary object of this class.
// The temp object needs to be changed into the correct one, which is done in the checker.
// PiParseConcept combine all features of PiLangConcept, PiLangClass, PiLangClass, 
// and PiLangBinaryExpressionConcept

export class PiParseClass implements PiLangClassInterface {
    isRoot:boolean;
    isAbstract: boolean;
    isBinary: boolean;
    isExpression: boolean;
    _isExpressionPlaceHolder: boolean;
    name: string;
    base: PiLangClassReference;
    primProperties: PiLangPrimitiveProperty[] = [];
    enumProperties: PiLangEnumProperty[] = [];
    parts: PiLangConceptProperty[] = [];
    references: PiLangConceptProperty[] = [];
    trigger: string;
    symbol: string;
    priority: number;
}