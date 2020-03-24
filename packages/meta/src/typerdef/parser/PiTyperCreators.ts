import { ConformsTypeRule, PiTyperDef, AllTypesRef, TypeEqualsRule, IsTypeRule, CommonSuperTypeCalculation, TypeOfCalculation, InferenceRule, PropertyCalculation, IsTypeRef, PiTypeValue } from "../metalanguage/PiTyperDefLang";
import { PiLangConceptReference } from "../../languagedef/metalanguage/PiLangReferences";
import { PiLangThisExp, PiLangExp, PiLangEnumExp } from "../../languagedef/metalanguage/PiLangExpressions";

// Functions used to create instances of the language classes (in TyperDefLang) from the parsed data objects (from TyperGrammar.pegjs). 

export function createTyperDef(data: Partial<PiTyperDef>): PiTyperDef {
    const result = new PiTyperDef();

    if( !!data.name) {
        result.name = data.name;
    }
    if( !!data.languageName) {
        result.languageName = data.languageName; 
    }
    if( !!data.typerRules) {
        result.typerRules = data.typerRules;
    }

    return result;
}

export function createInferenceRule(data: Partial<InferenceRule>): InferenceRule {
    const result = new InferenceRule();

    if( !!data.conceptRef) {
        result.conceptRef = data.conceptRef;
    }
    if( !!data.calculation) {
        result.calculation = data.calculation;
    }
    if( !!data.isAbstract) {
        result.isAbstract = data.isAbstract;
    }
    return result;
}

export function createElementReference(data: Partial<PiLangConceptReference>): PiLangConceptReference {
    const result = new PiLangConceptReference(); 
    if(!!data.name) { result.name = data.name; }
    return result;
}

export function createPropertyCalculation(data: Partial<PropertyCalculation>): PropertyCalculation {
    const result = new PropertyCalculation();
    if( !!data.property) {
        result.property = data.property;
    }
    return result;
}

export function createTypeOfCalculation(data: Partial<TypeOfCalculation>): TypeOfCalculation {
    const result = new TypeOfCalculation();
    if( !!data.type) {
        result.type = data.type;
    }
    return result;
}

export function createSuperTypeCalculation(data: Partial<CommonSuperTypeCalculation>): CommonSuperTypeCalculation {
    const result = new CommonSuperTypeCalculation();
    if( !!data.type1) {
        result.type1 = data.type1;
    }
    if( !!data.type2) {
        result.type2 = data.type2;
    }
    return result;
}

export function createIsTypeRule(data: Partial<IsTypeRule>): IsTypeRule {
    const result = new IsTypeRule();
    if( !!data.types) {
        result.types = data.types;
    }
    return result;
}

export function createConformanceRule(data: Partial<ConformsTypeRule>): ConformsTypeRule {
    const result = new ConformsTypeRule();
    if( !!data.type1) {
        result.type1 = data.type1;
    }
    if( !!data.type2) { 
        result.type2 = data.type2;
    }
    if( !!data.value) {
        result.value = data.value;
    }
    return result;
}

export function createTypeEqualsRule(data: Partial<TypeEqualsRule>): TypeEqualsRule {
    const result = new TypeEqualsRule();

    if( !!data.type1) {
        result.type1 = data.type1;
    }
    if( !!data.type2) {
        result.type2 = data.type2;
    }
    if( !!data.value) {
        result.value = data.value;
    }
    return result;
}

export function createTypeValue(data: Partial<PiTypeValue>): PiTypeValue {
    const result = new PiTypeValue();
    if( !!data.allTypes) {
        result.allTypes = data.allTypes;
    }
    if( !!data.typeProperty) {
        result.typeProperty = data.typeProperty;
    }
    if( !!data.enumRef) {
        result.enumRef = data.enumRef;
    }
    return result;
}

export function createIsTypeRef(data: Partial<IsTypeRef>): IsTypeRef {
    const result = new IsTypeRef();
    if( !!data.appliedFeature) {
        result.appliedFeature = data.appliedFeature;
    }

    return result;
}

export function createPiLangThisExp(data: Partial<PiLangThisExp>) {
    const result : PiLangThisExp = new PiLangThisExp();
    if (!!data.sourceName) {
        result.sourceName = data.sourceName;
    }
    if (!!data.appliedfeature) {
        result.appliedfeature = data.appliedfeature;
    }
    return result;
}

export function createPiLangExp(data: Partial<PiLangExp>): PiLangExp {
    // const result = new PiLangExp();

    // if (!!data.sourceName) {
    //     result.sourceName = data.sourceName;
    // }
    // if (!!data.appliedFeature) {
    //     result.appliedFeature = data.appliedFeature;
    // }
    return null;
}

export function createEnumReference(data: Partial<PiLangEnumExp>) {
    const result : PiLangEnumExp = new PiLangEnumExp();
    if (!!data.sourceName) {
        result.sourceName = data.sourceName;
    }
    if (!!data.appliedfeature) {
        result.appliedfeature = data.appliedfeature;
    }
    return result;
}

