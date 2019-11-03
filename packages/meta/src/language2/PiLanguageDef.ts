/**
 * This file defined the structure of a language definition, as it can be used by ProjectIt.
 * There is no behavior attached,  so it can serve as a JSON interchange format.
 */
export type PiLanguagePrimitiveType = "string" | "boolean" | "number";

export interface PiLanguageDef {
    name: string;
    concepts: PiLanguageConceptDef[];
    enumerations?: PiLanguageEnumerationDef[];
}

export interface PiLanguagePrimitivePropertyDef {
    name: string;
    type: string; //  | PiEnumerationReference;
    isList?: boolean;
    isStatic?: boolean;
    initialValue?: string;
}

export interface PiLanguageEditorPropertyDef {
    name: string;
    type: string; //  | PiEnumerationReference;
    isList?: boolean;
    initialValue?: string;
}

export interface PiLanguageElementPropertyDef {
    name: string;
    type: PiLanguageConceptReferenceDef;
    isList?: boolean
}

export interface PiLanguageConceptReferenceDef {
    concept: string;
}

export interface PiEnumerationReference {
    enum: string;
}

export interface PiLanguageConceptDef {
    name: string;
    isAbstract?: boolean;
    properties: PiLanguagePrimitivePropertyDef[];
    parts: PiLanguageElementPropertyDef[];
    references: PiLanguageElementPropertyDef[];
    editor: PiLanguageEditorPropertyDef[];
    base?: PiLanguageConceptReferenceDef;
    isRoot: boolean;

    // The properties below are only needed when you use the built-in expression editor support in ProjectIt
    isExpression?: boolean;
    isExpressionPlaceHolder?: boolean
    isBinaryExpression?: boolean;
    left?: PiLanguageConceptReferenceDef;
    right?: PiLanguageConceptReferenceDef;
    symbol?: string;
    priority?: string;
}

export interface PiLanguageEnumerationDef {
    name: string;
    literals: string[]
}
