import {
    PiLangPrimitiveProperty,
    PiLangConceptProperty,
    PiLanguageUnit,
    PiLangEnumeration,
    PiLangUnion,
    PiLangEnumProperty,
    PiLangClass,
} from "../metalanguage/PiLanguage";
import { PiLangConceptReference, PiLangEnumerationReference } from "../../languagedef/metalanguage/PiLangReferences";
import { PiParseClass, PiParseLanguageUnit } from "./PiParseLanguage";

// Functions used to create instances of the language classes from the parsed data objects.

export function createLanguage(data: Partial<PiParseLanguageUnit>): PiLanguageUnit {
    // console.log("createLanguage " + data.name);
    const result = new PiLanguageUnit();
    // // console.log("Creating language with concepts: ");
    if( !!data.name) {
        result.name = data.name
    }
    if( !!data.defs) {
        for( let def of data.defs) {
            if (def instanceof PiParseClass) {
                result.classes.push(def)
            } else if (def instanceof PiLangEnumeration) {
                result.enumerations.push(def)
            } else if (def instanceof PiLangUnion) {
                result.unions.push(def)
            }
        }
    }
    return result;
}

// Because we do not yet know whether a concept is a PiLangClass, PiLangClass, or PiLangBinaryExpressionConcept,
// we parse it and create this temporary object, which needs to be changed into the correct one.
// The latter is done in the checker
export function createParseClass(data: Partial<PiParseClass>) : PiParseClass {
    // console.log("createParseConcept " + data.name);
    const result = new PiParseClass();

    result.isRoot = !!data.isRoot;
    result.isAbstract = !!data.isAbstract;
    result.isBinary = !!data.isBinary;
    result.isExpression = !!data.isExpression;
    result._isExpressionPlaceHolder = !!data._isExpressionPlaceHolder; 
    if (!!data.name) {
        result.name = data.name;
    }
    if (!!data.trigger) {
        result.trigger = data.trigger;
    }
    if (!!data.base) {
        result.base = data.base;
    }
    if(!!data.properties) {   
        for(let prop of data.properties) { 
            if (prop instanceof PiLangPrimitiveProperty) {
                result.primProperties.push(prop);
            }
            if (prop instanceof PiLangEnumProperty) {
                result.enumProperties.push(prop);
            }
            if (prop instanceof PiLangConceptProperty) {
                if (prop.isPart) {
                    result.parts.push(prop);
                } else {
                    result.references.push(prop);
                }
            }
        }
    }
    if (!!data.priority) {
        result.priority = data.priority;
    }
    // console.log("created parse class " + result.name);
    return result;
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
    result.isPart = true;
    return result;
}

export function createReference(data: Partial<PiLangConceptProperty>): PiLangConceptProperty {
    // console.log("createReference " + data.name);
    const result = new PiLangConceptProperty();
    if(!!data.type) { result.type = data.type; }
    if(!!data.name) { result.name = data.name; }
    result.isList = !!data.isList;
    result.isPart = false;
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
