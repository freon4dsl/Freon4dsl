import {
    PiLangPrimitiveProperty,
    PiLangConcept,
    PiLangConceptProperty,
    PiLanguageUnit,
    PiLangEnumeration,
    PiLangUnion,
    PiLangEnumProperty,
    PiLangExpressionConcept,
    PiLangBinaryExpressionConcept,
    PiLangClass
} from "../metalanguage/PiLanguage";
import { PiLangConceptReference, PiLangEnumerationReference } from "../../languagedef/metalanguage/PiLangReferences";

// Functions used to create instances of the language classes from the parsed data objects.

export function createLanguage(data: Partial<PiLanguageUnit>): PiLanguageUnit {
    // console.log("createLanguage " + data.name);
    const result = new PiLanguageUnit();
    // // console.log("Creating language with concepts: ");
    if( !!data.name) {
        result.name = data.name
    }
    if( !!data.classes) {
        result.classes = data.classes
    }
    if( !!data.enumerations) {
        result.enumerations = data.enumerations
    }
    if( !!data.unions) {
        result.unions = data.unions
    }

    // Ensure all references to the language are set.
    result.classes.forEach(concept => {
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

export function createClass(data: Partial<PiLangClass>): PiLangClass {
    // console.log("createClass " + data.name);
    const result = new PiLangClass();
    createCommonClassParts(result, data);
    // // console.log("created  class " + result.name);
    return result;
}

export function createExpressionConcept(data: Partial<PiLangExpressionConcept>): PiLangExpressionConcept {
    // console.log("createExpressionConcept " + data.name);
    const result = new PiLangExpressionConcept();
    result._isExpressionPlaceHolder = !!data._isExpressionPlaceHolder; 
    createCommonClassParts(result, data);
    // // console.log("created  class " + result.name);
    return result;
}

export function createBinaryExpressionConcept(data: Partial<PiLangBinaryExpressionConcept>): PiLangBinaryExpressionConcept {
    // console.log("createBinaryExpressionConcept " + data.name);
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
    createCommonClassParts(result, data);
    // // console.log("created  concept " + result.name);
    return result;
}

function createCommonClassParts(result: PiLangClass, data: Partial<PiLangClass>) {
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
    if (!!data.primProperties) {
        result.primProperties = data.primProperties;
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
    result.primProperties.forEach(prop => prop.owningConcept = result);
    result.enumProperties.forEach(prop => prop.owningConcept = result);
    result.references.forEach(ref => ref.owningConcept = result);
}

export function createEnumerationReference(data: Partial<PiLangEnumerationReference>): PiLangEnumerationReference {
    // console.log("createEnumerationReference " + data.name);
    const result = new PiLangEnumerationReference();
    if(!!data.name) { result.name = data.name; }
    return result;
}

export function createEnumerationProperty(data: Partial<PiLangEnumProperty>): PiLangEnumProperty {
    // console.log("createEnumerationProperty " + data.name);
    const result = new PiLangEnumProperty();
    if(!!data.type) { result.type = data.type; }
    if(!!data.name) { result.name = data.name; }
    result.isList = data.isList;

    // // console.log("created property with name "+ result.name);
    return result;
}

export function createPrimitiveProperty(data: Partial<PiLangPrimitiveProperty>): PiLangPrimitiveProperty {
    // console.log("createPrimitiveProperty " + data.name);
    const result = new PiLangPrimitiveProperty();
    if(!!data.primType) { result.primType = data.primType; }
    if(!!data.type) { result.type = data.type; }
    if(!!data.name) { result.name = data.name; }
    result.isList = data.isList;
    return result;
}

export function createPart(data: Partial<PiLangConceptProperty>): PiLangConceptProperty {
    // console.log("createPart " + data.name);
    const result = new PiLangConceptProperty();
    if(!!data.type) { result.type = data.type; }
    if(!!data.name) { result.name = data.name; }
    result.isList = !!data.isList;
    return result;
}

export function createReference(data: Partial<PiLangConceptProperty>): PiLangConceptProperty {
    // console.log("createReference " + data.name);
    const result = new PiLangConceptProperty();
    if(!!data.type) { result.type = data.type; }
    if(!!data.name) { result.name = data.name; }
    result.isList = !!data.isList;
    return result;
}

export function createConceptReference(data: Partial<PiLangConceptReference>): PiLangConceptReference {
    // console.log("createConceptReference " + data.name);
    const result = new PiLangConceptReference();
    if(!!data.name) { result.name = data.name; }
    return result;
}

export function createEnumeration(data: Partial<PiLangEnumeration>): PiLangEnumeration {
    // console.log("createEnumeration " + data.name);
    const result = new PiLangEnumeration();
    if( !!data.name) { result.name = data.name; }
    if( !!data.literals) { result.literals = data.literals; }
    return result;
}

export function createUnion(data: Partial<PiLangUnion>): PiLangUnion {
    // console.log("createUnion " + data.name);
    const result = new PiLangUnion();
    if( !!data.name) { result.name = data.name; }
    if( !!data.members) { result.members = data.members; }
    return result;
}

export function isEnumerationProperty(p: Object){
    return p instanceof PiLangEnumProperty;
}
