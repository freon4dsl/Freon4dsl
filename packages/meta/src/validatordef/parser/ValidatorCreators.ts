import {
    CheckConformsRule,
    CheckEqualsTypeRule,
    ClassifierRuleSet,
    ExpressionRule,
    IsUniqueRule,
    NotEmptyRule,
    ValidatorDef,
    ValidationMessage,
    ValidationMessageReference,
    ValidationMessageText,
    ValidationRule,
    ValidationSeverity,
    ValidNameRule,
} from "../metalanguage/index.js";
import { FreMetaDefinitionElement } from '../../utils/no-dependencies/index.js';
import { ParseLocationUtil } from '../../utils/basic-dependencies/index.js';

// Functions used to create instances of the language classes (in ValidatorDefLang)
// from the parsed data objects (from ValidatorGrammar.pegjs).

let currentFileName: string = "SOME_FILENAME";
export function setCurrentFileName(newName: string) {
    currentFileName = newName;
}

export function createValidatorDef(data: Partial<ValidatorDef>): ValidatorDef {
    const result = new ValidatorDef();
    if (!!data.languageName) {
        result.languageName = data.languageName;
    }
    if (!!data.classifierRules) {
        result.classifierRules = data.classifierRules;
    }
    if (!!data.location) {
        setLocationAndFileName(result, data);
    }
    return result;
}

export function createConceptRule(data: Partial<ClassifierRuleSet>): ClassifierRuleSet {
    const result = new ClassifierRuleSet();

    if (!!data.classifierRef) {
        result.classifierRef = data.classifierRef;
    }
    if (!!data.rules) {
        result.rules = data.rules;
    }
    if (!!data.location) {
        setLocationAndFileName(result, data);
    }
    return result;
}

function createRuleCommonParts(data: Partial<ValidNameRule>, result: ValidationRule) {
    if (!!data.severity) {
        result.severity = data.severity;
    }
    if (!!data.message) {
        result.message = data.message;
    }
}

export function createValidNameRule(data: Partial<ValidNameRule>): ValidNameRule {
    const result = new ValidNameRule();
    if (!!data.property) {
        result.property = data.property;
    }
    createRuleCommonParts(data, result);
    if (!!data.location) {
        setLocationAndFileName(result, data);
    }
    return result;
}

export function createNotEmptyRule(data: Partial<NotEmptyRule>): NotEmptyRule {
    const result = new NotEmptyRule();
    if (!!data.property) {
        result.property = data.property;
    }
    createRuleCommonParts(data, result);
    if (!!data.location) {
        setLocationAndFileName(result, data);
    }
    return result;
}

export function createTypeEqualsRule(data: Partial<CheckEqualsTypeRule>): CheckEqualsTypeRule {
    const result = new CheckEqualsTypeRule();

    createRuleCommonParts(data, result);
    if (!!data.type1Exp) {
        result.type1Exp = data.type1Exp;
    }
    if (!!data.type2Exp) {
        result.type2Exp = data.type2Exp;
    }
    if (!!data.location) {
        setLocationAndFileName(result, data);
    }
    return result;
}

export function createTypeConformsRule(data: Partial<CheckConformsRule>): CheckConformsRule {
    const result = new CheckConformsRule();

    createRuleCommonParts(data, result);
    if (!!data.type1Exp) {
        result.type1Exp = data.type1Exp;
    }
    if (!!data.type2Exp) {
        result.type2Exp = data.type2Exp;
    }
    if (!!data.location) {
        setLocationAndFileName(result, data);
    }
    return result;
}

export function createExpressionRule(data: Partial<ExpressionRule>): ExpressionRule {
    const result = new ExpressionRule();

    createRuleCommonParts(data, result);
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
        setLocationAndFileName(result, data);
    }
    return result;
}

export function createIsUniqueRule(data: Partial<IsUniqueRule>): IsUniqueRule {
    const result = new IsUniqueRule();

    createRuleCommonParts(data, result);
    if (!!data.listExp) {
        result.listExp = data.listExp;
    }
    if (!!data.listpropertyExp) {
        result.listpropertyExp = data.listpropertyExp;
    }
    if (!!data.location) {
        setLocationAndFileName(result, data);
    }
    return result;
}

export function createSeverity(data: Partial<ValidationSeverity>): ValidationSeverity {
    const result = new ValidationSeverity();
    if (!!data.value) {
        result.value = data.value;
    }
    if (!!data.location) {
        setLocationAndFileName(result, data);
    }
    return result;
}

export function createErrorMessage(data: Partial<ValidationMessage>): ValidationMessage {
    const result = new ValidationMessage();
    if (!!data.content) {
        result.content = data.content;
    }
    if (!!data.location) {
        setLocationAndFileName(result, data);
    }
    return result;
}

export function createValidationMessageReference(
    data: Partial<ValidationMessageReference>,
): ValidationMessageReference {
    const result = new ValidationMessageReference();
    if (!!data.expression) {
        result.expression = data.expression;
    }
    if (!!data.location) {
        setLocationAndFileName(result, data);
    }
    return result;
}

export function createValidationMessageText(data: Partial<ValidationMessageText>): ValidationMessageText {
    const result = new ValidationMessageText();
    if (!!data.value) {
        result.value = data.value;
    }
    if (!!data.location) {
        setLocationAndFileName(result, data);
    }
    return result;
}

function setLocationAndFileName(result: FreMetaDefinitionElement, data: Partial<ValidationMessageText>) {
    // if data, or data.location is undefined, then used the defaultParseLocation
    result.location = data.location ?? ParseLocationUtil.defaultParseLocation;
    result.location.filename = currentFileName;
}
