import { PiLangPrimitiveProperty, PiLangConcept, PiLangElementProperty, PiLangConceptReference, PiLanguage, PiLangEnumeration, PiLangType } from "../../metalanguage/PiLanguage";

// Functions used to create instances of the language classes from the parsed data objects.

export function createConceptReference(data: Partial<PiLangConceptReference>): PiLangConceptReference {
    const result = new PiLangConceptReference();
    if(!!data.name) { result.name = data.name; }
    return result;
}

export function createPrimitiveProperty(data: Partial<PiLangPrimitiveProperty>): PiLangPrimitiveProperty {
    const result = new PiLangPrimitiveProperty();
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
    // console.log("creating concept " + data.name);
    const result = new PiLangConcept();

    result.isRoot = !!data.isRoot;
    result.isAbstract = !!data.isAbstract;
    result.isExpression = !!data.isExpression; 
    result.isBinaryExpression = !!data.isBinaryExpression;
    result.isExpressionPlaceHolder = !!data.isExpressionPlaceHolder; 

    if(!!data.name) { result.name = data.name; }
    if(!!data.priority) { result.priority = data.priority; }
    if(!!data.base) { result.base = data.base; }

    if(!!data.properties) { 
        result.properties = data.properties;
        result.properties.forEach(p => p.owningConcept = result );
    }
    if(!!data.parts) { 
        result.parts = data.parts;
        result.parts.forEach(p => p.owningConcept = result );
    }
    if(!!data.references) { 
        result.references = data.references;
        result.references.forEach(p => p.owningConcept = result );
    }
    if( !!data.trigger ){ result.trigger = data.trigger; }
    if( !!data.symbol ){ result.symbol = data.symbol; }
    if( !!data.priority ){ result.priority = data.priority; }

    result.parts.forEach(part => part.owningConcept = result);
    result.properties.forEach(prop => prop.owningConcept = result);
    result.references.forEach(ref => ref.owningConcept = result);
    // console.log("created  concept " + result.name);
    return result;
}

export function createLanguage(data: Partial<PiLanguage>): PiLanguage {
    const result = new PiLanguage();
    // console.log("Creating language with concepts: ");
    // data.concepts.forEach(c => console.log("    concept "+ c.name));
    if( !!data.name) {
        result.name = data.name
    }
    if( !!data.concepts) {
        result.concepts = data.concepts
    }
    if( !!data.enumerations) {
        result.enumerations = data.enumerations
    }
    if( !!data.types) {
        console.log("NEW adding type to language");
        result.types = data.types
    }

    // Ensure all references to the language are set.
    result.concepts.forEach(concept => {
        concept.language = result;
        concept.references.forEach(ref => ref.type.language = result);
        concept.parts.forEach(part => part.type.language = result);
        if( !!concept.base ){
            concept.base.language = result;
        }
    } );

    result.enumerations.forEach(enumeration => {
        enumeration.language = result;
    } );

    result.types.forEach(type => {
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

export function createType(data: Partial<PiLangType>): PiLangType {
    console.log("NEW creating type");
    const result = new PiLangType();
    if( !!data.name) { result.name = data.name; }
    if( !!data.literals) { result.literals = data.literals; }
    return result;
}
