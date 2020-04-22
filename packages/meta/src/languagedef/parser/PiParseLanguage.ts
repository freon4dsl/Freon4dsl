import { PiLangPrimitiveProperty, PiLangEnumProperty, PiLangConceptProperty, PiLangConcept, PiLangClass, PiLangProperty } from "../metalanguage/PiLanguage";
import { PiLangClassReference, PiLangConceptReference, PiLangInterfaceReference } from "../metalanguage/PiLangReferences";
import { ParseLocation } from "../../utils";

// Becasue we want to be able to mix definitions of classes, enums, etc in the .lang file
// we parse them as PiLangConcepts and then create a PiLanguageUnit in the LanguageCreators.
export class PiParseLanguageUnit {
    location: ParseLocation;
    name: string;
    defs: PiLangConcept[] = [];
}

// Because during parsing we do not yet know whether a concept is a PiLangClass, PiLangClass,
// or PiLangBinaryExpressionConcept, we parse it and create a temporary object of this class.
// The temp object needs to be changed into the correct one, which is done in the checker.
// PiParseConcept combine all features of PiLangConcept, PiLangClass, PiLangClass,
// and PiLangBinaryExpressionConcept
export class PiParseClass extends PiLangClass {
    isRoot: boolean;
    isAbstract: boolean;
    isBinary: boolean;
    isExpression: boolean;
    _isExpressionPlaceHolder: boolean;
    name: string;
    base: PiLangClassReference;
    interfaces: PiLangInterfaceReference[] = [];
    properties: PiLangProperty[] = [];
    primProperties: PiLangPrimitiveProperty[] = [];
    enumProperties: PiLangEnumProperty[] = [];
    parts: PiLangConceptProperty[] = [];
    references: PiLangConceptProperty[] = [];
    priority: number;
}
