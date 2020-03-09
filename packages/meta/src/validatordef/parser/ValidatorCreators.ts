import { PiLangConceptReference, PiLangPropertyReference } from "../../languagedef/metalanguage/PiLanguage";
import { ValidatorDef, ConceptRule, NotEmptyRule, TypeRule, EqualsTypeRule, ConformsTypeRule, TypeReference } from "../metalanguage/ValidatorDefLang";

// Functions used to create instances of the language classes from the parsed data objects.
// TODO change comment

export function createValidatorDef(data: Partial<ValidatorDef>): ValidatorDef {
    const result = new ValidatorDef();

    if( !!data.validatorName) {
        result.validatorName = data.validatorName;
    }
    if( !!data.languageName) {
        result.languageName = data.languageName;
    }
    if( !!data.conceptRules) {
        result.conceptRules = data.conceptRules;
    }

    return result;
}

export function createConceptRule(data: Partial<ConceptRule>): ConceptRule {
    const result = new ConceptRule();

    if( !!data.conceptRef) {
        result.conceptRef = data.conceptRef;
    }
    if( !!data.validNameRule) {
        result.validNameRule = data.validNameRule;
    }
    if( !!data.notEmptyRules) {
        result.notEmptyRules = data.notEmptyRules;
    }
    if( !!data.typeRules) {
        result.typeRules = data.typeRules;
    }

    return result;

}

export function createConceptReference(data: Partial<PiLangConceptReference>): PiLangConceptReference {
    const result = new PiLangConceptReference(); 
    if(!!data.name) { result.name = data.name; }
    return result;
}

export function createPropertyReference(data: Partial<PiLangPropertyReference>): PiLangPropertyReference {
    const result = new PiLangPropertyReference(); 
    if(!!data.name) { result.name = data.name; }
    return result;
}

export function createNotEmpty(data: Partial<NotEmptyRule>): NotEmptyRule {
    const result = new NotEmptyRule();
    if( !!data.property) {
        result.property = data.property;
    }
    return result;
}

export function createTypeEqualsRule(data: Partial<EqualsTypeRule>): EqualsTypeRule {
    const result = new EqualsTypeRule();

    if( !!data.type1) {
        result.type1 = data.type1;
    }
    if( !!data.type2) {
        result.type2 = data.type2;
    }
    return result;
}

export function createTypeReference(data: Partial<TypeReference>): TypeReference {
    const result = new TypeReference();

    if( !!data.sourceName) {
        result.sourceName = data.sourceName;
    }
    if( !!data.partName) {
        result.partName = data.partName;
    }
    return result;
}

export function createTypeConformsRule(data: Partial<ConformsTypeRule>): ConformsTypeRule {
    const result = new ConformsTypeRule();

    if( !!data.type1) {
        result.type1 = data.type1;
    }
    if( !!data.type2) {
        result.type2 = data.type2;
    }
    return result;
}
