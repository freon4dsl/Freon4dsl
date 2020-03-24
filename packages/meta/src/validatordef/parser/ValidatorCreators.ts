import { PiValidatorDef, ConceptRuleSet, NotEmptyRule, CheckEqualsTypeRule, CheckConformsRule, ValidNameRule } from "../metalanguage/ValidatorDefLang";
import { PiLangConceptReference } from "../../languagedef/metalanguage/PiLangReferences";
import { PiLangThisExp, PiLangEnumExp, PiLangAppliedFeatureExp } from "../../languagedef/metalanguage/PiLangExpressions";

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

export function createTypeEqualsRule(data: Partial<CheckEqualsTypeRule>): CheckEqualsTypeRule {
    const result = new CheckEqualsTypeRule();

    if( !!data.type1) {
        result.type1 = data.type1;
    }
    if( !!data.type2) {
        result.type2 = data.type2;
    }
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
    return result;
}

export function createThisExpression(data: Partial<PiLangThisExp>) {
    const result : PiLangThisExp = new PiLangThisExp();
    if (!!data.sourceName) {
        result.sourceName = data.sourceName;
    }
    if (!!data.appliedfeature) {
        result.appliedfeature = data.appliedfeature;
    }
    return result;
}

export function createPropertyRefExpression(data: Partial<PiLangAppliedFeatureExp>): PiLangAppliedFeatureExp {
    const result = new PiLangAppliedFeatureExp();

    if (!!data.sourceName) {
        result.sourceName = data.sourceName;
    }
    if (!!data.appliedfeature) {
        result.appliedfeature = data.appliedfeature;
    }
    return result;
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

