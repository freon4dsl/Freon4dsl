import { PiValidatorDef, ConceptRule, NotEmptyRule, EqualsTypeRule, ConformsTypeRule, LangRefExpression, ThisExpression, EnumRefExpression, PropertyRefExpression, ValidNameRule } from "../metalanguage/ValidatorDefLang";
import { PiLangConceptReference } from "../../languagedef/metalanguage/PiLangReferences";

// Functions used to create instances of the language classes from the parsed data objects.
// TODO change comment

export function createValidatorDef(data: Partial<PiValidatorDef>): PiValidatorDef {
    const result = new PiValidatorDef();

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
    if( !!data.rules) {
        result.rules = data.rules;
    }
    return result;
}

export function createConceptReference(data: Partial<PiLangConceptReference>): PiLangConceptReference {
    const result = new PiLangConceptReference(); 
    if(!!data.name) { result.name = data.name; }
    return result;
}

export function createValidNameRule(data: Partial<ValidNameRule>): ValidNameRule {
    const result = new ValidNameRule();
    if( !!data.property) {
        result.property = data.property;
    }
    return result;
}

export function createNotEmptyRule(data: Partial<NotEmptyRule>): NotEmptyRule {
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

export function createThisExpression(data: Partial<ThisExpression>) {
    const result : ThisExpression = new ThisExpression();
    if (!!data.sourceName) {
        result.sourceName = data.sourceName;
    }
    if (!!data.appliedFeature) {
        result.appliedFeature = data.appliedFeature;
    }
    return result;
}

export function createPropertyRefExpression(data: Partial<PropertyRefExpression>): PropertyRefExpression {
    const result = new PropertyRefExpression();

    if (!!data.sourceName) {
        result.sourceName = data.sourceName;
    }
    if (!!data.appliedFeature) {
        result.appliedFeature = data.appliedFeature;
    }
    return result;
}

export function createEnumReference(data: Partial<EnumRefExpression>) {
    const result : EnumRefExpression = new EnumRefExpression();
    if (!!data.sourceName) {
        result.sourceName = data.sourceName;
    }
    if (!!data.appliedFeature) {
        result.appliedFeature = data.appliedFeature;
    }
    if (!!data.literalName) {
        result.literalName = data.literalName;
    }
    return result;
}

