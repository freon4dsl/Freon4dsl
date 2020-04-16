import { PiLangAppliedFeatureExp, PiLangConceptReference, PiLangEnumExp, PiLangThisExp } from "../../languagedef/metalanguage";
import { CheckConformsRule, CheckEqualsTypeRule, ConceptRuleSet, NotEmptyRule, PiValidatorDef, ValidNameRule } from "../metalanguage/ValidatorDefLang";

// Functions used to create instances of the language classes (in ValidatorDefLang) from the parsed data objects (from ValidatorGrammar.pegjs). 

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
    if (!!data.location) { result.location = data.location; }
    return result;
}

export function createConceptRule(data: Partial<ConceptRuleSet>): ConceptRuleSet {
    const result = new ConceptRuleSet();

    if( !!data.conceptRef) {
        result.conceptRef = data.conceptRef;
    }
    if( !!data.rules) {
        result.rules = data.rules;
    }
    if (!!data.location) { result.location = data.location; }
    return result;
}

export function createValidNameRule(data: Partial<ValidNameRule>): ValidNameRule {
    const result = new ValidNameRule();
    if( !!data.property) {
        result.property = data.property;
    }
    if (!!data.location) { result.location = data.location; }
    return result;
}

export function createNotEmptyRule(data: Partial<NotEmptyRule>): NotEmptyRule {
    const result = new NotEmptyRule();
    if( !!data.property) {
        result.property = data.property;
    }
    if (!!data.location) { result.location = data.location; }
    return result;
}

export function createTypeEqualsRule(data: Partial<CheckEqualsTypeRule>): CheckEqualsTypeRule {
    const result = new CheckEqualsTypeRule();

    if( !!data.type1) {
        result.type1 = data.type1;
    }
    if( !!data.type2) {
        result.type2 = data.type2;
    }
    if (!!data.location) { result.location = data.location; }
    return result;
}

export function createTypeConformsRule(data: Partial<CheckConformsRule>): CheckConformsRule {
    const result = new CheckConformsRule();

    if( !!data.type1) {
        result.type1 = data.type1;
    }
    if( !!data.type2) {
        result.type2 = data.type2;
    }
    if (!!data.location) { result.location = data.location; }
    return result;
}


