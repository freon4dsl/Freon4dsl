import {
    PiLangPrimitiveProperty,
    PiLangConcept,
    PiLangElementProperty,
    PiLanguageUnit,
    PiLangEnumeration,
    PiLangUnion,
    PiLangEnumProperty,
    PiLangExpressionConcept,
    PiLangBinaryExpressionConcept
} from "../metalanguage/PiLanguage";
import { PiLangConceptReference, PiLangEnumerationReference } from "../../languagedef/metalanguage/PiLangReferences";

// Functions used to create instances of the language classes from the parsed data objects.

export function createConceptReference(data: Partial<PiLangConceptReference>): PiLangConceptReference {
    const result = new PiLangConceptReference();
    if(!!data.name) { result.name = data.name; }
    return result;
}

export function createEnumerationReference(data: Partial<PiLangEnumerationReference>): PiLangEnumerationReference {
    const result = new PiLangEnumerationReference();
    if(!!data.name) { result.name = data.name; }
    return result;
}

export function createPrimitiveProperty(data: Partial<PiLangPrimitiveProperty>): PiLangPrimitiveProperty {
    const result = new PiLangPrimitiveProperty();
    if(!!data.type) { result.type = data.type; }
    if(!!data.name) { result.name = data.name; }
    result.isList = data.isList;
    return result;
}

export function createEnumerationProperty(data: Partial<PiLangEnumProperty>): PiLangEnumProperty {
    const result = new PiLangEnumProperty();
    if(!!data.type) { result.type = data.type; }
    if(!!data.name) { result.name = data.name; }
    result.isList = data.isList;

    // console.log("created property with name "+ result.name);
    return result;
}

export function createPart(data: Partial<PiLangElementProperty>): PiLangElementProperty {
    const result = new PiLangElementProperty();
    if(!!data.type) { result.type = data.type; }
    if(!!data.name) { result.name = data.name; }
    result.isList = !!data.isList;
    return result;
}

export function createReference(data: Partial<PiLangElementProperty>): PiLangElementProperty {
    const result = new PiLangElementProperty();
    if(!!data.type) { result.type = data.type; }
    if(!!data.name) { result.name = data.name; }
    result.isList = !!data.isList;
    return result;
}

export function createConcept(data: Partial<PiLangConcept>): PiLangConcept {
    const result = new PiLangConcept();
    createCommonConceptParts(result, data);
    // console.log("created  concept " + result.name);
    return result;
}

export function createExpressionConcept(data: Partial<PiLangExpressionConcept>): PiLangExpressionConcept {
    const result = new PiLangExpressionConcept();
    result._isExpressionPlaceHolder = !!data._isExpressionPlaceHolder; 
    createCommonConceptParts(result, data);
    // console.log("created  concept " + result.name);
    return result;
}

export function createBinaryExpressionConcept(data: Partial<PiLangBinaryExpressionConcept>): PiLangBinaryExpressionConcept {
    const result = new PiLangBinaryExpressionConcept();
    result._isExpressionPlaceHolder = !!data._isExpressionPlaceHolder; 
    if (!!data.priority) {
        result.priority = data.priority;
    }
    if (!!data.symbol) {
        result.symbol = data.symbol;
    }
    if (!!data.priority) {
        result.priority = data.priority;
    }
    createCommonConceptParts(result, data);
    // console.log("created  concept " + result.name);
    return result;
}

function createCommonConceptParts(result: PiLangConcept, data: Partial<PiLangConcept>) {
    result.isRoot = !!data.isRoot;
    result.isAbstract = !!data.isAbstract;
    if (!!data.name) {
        result.name = data.name;
    }
    if (!!data.trigger) {
        result.trigger = data.trigger;
    }
    if (!!data.base) {
        result.base = data.base;
    }
    if (!!data.properties) {
        result.properties = data.properties;
    }
    if (!!data.enumProperties) {
        result.enumProperties = data.enumProperties;
    }
    if (!!data.parts) {
        result.parts = data.parts;
    }
    if (!!data.references) {
        result.references = data.references;
    }
    result.parts.forEach(part => part.owningConcept = result);
    result.properties.forEach(prop => prop.owningConcept = result);
    result.enumProperties.forEach(prop => prop.owningConcept = result);
    result.references.forEach(ref => ref.owningConcept = result);
}

export function createLanguage(data: Partial<PiLanguageUnit>): PiLanguageUnit {
    const result = new PiLanguageUnit();
    // console.log("Creating language with concepts: ");
    if( !!data.name) {
        result.name = data.name
    }
    if( !!data.concepts) {
        result.concepts = data.concepts
    }
    if( !!data.enumerations) {
        result.enumerations = data.enumerations
    }
    if( !!data.unions) {
        result.unions = data.unions
    }

    // Ensure all references to the language are set.
    result.concepts.forEach(concept => {
        concept.language = result;
        concept.references.forEach(ref => ref.type.language = result);
        concept.parts.forEach(part => part.type.language = result);
        concept.enumProperties.forEach(en => en.type.language = result);
        if( !!concept.base ){
            concept.base.language = result;
        }
    } );

    result.enumerations.forEach(enumeration => {
        enumeration.language = result;
    } );

    result.unions.forEach(type => {
        type.language = result;
    } );

    return result;
}

export function createEnumeration(data: Partial<PiLangEnumeration>): PiLangEnumeration {
    const result = new PiLangEnumeration();
    if( !!data.name) { result.name = data.name; }
    if( !!data.literals) { result.literals = data.literals; }
    return result;
}

export function createUnion(data: Partial<PiLangUnion>): PiLangUnion {
    const result = new PiLangUnion();
    if( !!data.name) { result.name = data.name; }
    if( !!data.members) { result.members = data.members; }
    return result;
}

export function isEnumerationProperty(p: Object){
    return p instanceof PiLangEnumProperty;
}
