import {
    CheckConformsRule,
    CheckEqualsTypeRule,
    ConceptRuleSet, ExpressionRule, IsuniqueRule,
    NotEmptyRule,
    PiValidatorDef,
    ValidNameRule
} from "../metalanguage/ValidatorDefLang";
import { PiLangAppliedFeatureExp, PiLangSelfExp } from "../../languagedef/metalanguage";

// Functions used to create instances of the language classes (in ValidatorDefLang) from the parsed data objects (from ValidatorGrammar.pegjs).

export function createValidatorDef(data: Partial<PiValidatorDef>): PiValidatorDef {
    const result = new PiValidatorDef();

    if (!!data.validatorName) {
        result.validatorName = data.validatorName;
    }
    if (!!data.languageName) {
        result.languageName = data.languageName;
    }
    if (!!data.conceptRules) {
        result.conceptRules = data.conceptRules;
    }
    if (!!data.location) {
        result.location = data.location;
    }
    return result;
}

export function createConceptRule(data: Partial<ConceptRuleSet>): ConceptRuleSet {
    const result = new ConceptRuleSet();

    if (!!data.conceptRef) {
        result.conceptRef = data.conceptRef;
    }
    if (!!data.rules) {
        result.rules = data.rules;
    }
    if (!!data.location) {
        result.location = data.location;
    }
    return result;
}

export function createValidNameRule(data: Partial<ValidNameRule>): ValidNameRule {
    const result = new ValidNameRule();
    if (!!data.property) {
        result.property = data.property;
    }
    if (!!data.location) {
        result.location = data.location;
    }
    return result;
}

export function createNotEmptyRule(data: Partial<NotEmptyRule>): NotEmptyRule {
    const result = new NotEmptyRule();
    if (!!data.property) {
        result.property = data.property;
    }
    if (!!data.location) {
        result.location = data.location;
    }
    return result;
}

export function createTypeEqualsRule(data: Partial<CheckEqualsTypeRule>): CheckEqualsTypeRule {
    const result = new CheckEqualsTypeRule();

    if (!!data.type1) {
        result.type1 = data.type1;
    }
    if (!!data.type2) {
        result.type2 = data.type2;
    }
    if (!!data.location) {
        result.location = data.location;
    }
    return result;
}

export function createTypeConformsRule(data: Partial<CheckConformsRule>): CheckConformsRule {
    const result = new CheckConformsRule();

    if (!!data.type1) {
        result.type1 = data.type1;
    }
    if (!!data.type2) {
        result.type2 = data.type2;
    }
    if (!!data.location) {
        result.location = data.location;
    }
    return result;
}

export function createExpressionRule(data: Partial<ExpressionRule>): ExpressionRule {
    const result = new ExpressionRule();

    if (!!data.exp1) {
        result.exp1 = data.exp1;
    }
    if (!!data.exp2) {
        result.exp2 = data.exp2;
    }
    if (!!data.comparator) {
        result.comparator = data.comparator;
    }
    if (!!data.location) {
        result.location = data.location;
    }
    return result;
}

export function createIsuniqueRule(data: Partial<IsuniqueRule>): IsuniqueRule {
    const result = new IsuniqueRule();

    if (!!data.list) {
        result.list = data.list;
    }
    if (!!data.listproperty) {
        // the expression parser/creator returns a PiLangConceptExp
        // but we need a PiLangSelfExp where 'self' refers to an element of result.list
        // therefore we change the received 'listproperty'.
        result.listproperty = new PiLangSelfExp();
        // result.listproperty.sourceName = "list";
        result.listproperty.location = data.listproperty.location;
        result.listproperty.appliedfeature = new PiLangAppliedFeatureExp();
        result.listproperty.appliedfeature.sourceName = data.listproperty.sourceName;
        result.listproperty.appliedfeature.location = data.listproperty.location;
        result.listproperty.appliedfeature.appliedfeature = data.listproperty.appliedfeature;
        result.listproperty.appliedfeature.sourceExp = result.listproperty;
    }
    if (!!data.location) {
        result.location = data.location;
    }
    return result;
}
