import type { FreMetaClassifier, MetaElementReference } from '../../languagedef/metalanguage/index.js';
// Note that FreErrorSeverity cannot be imported from "@freon4dsl/core", because
// "@freon4dsl/meta" does not have a dependency on "@freon4dsl/core".
import type { FreErrorSeverity } from '../../utils/no-dependencies/index.js';
import { FreMetaDefinitionElement } from '../../utils/no-dependencies/index.js';
import type { FreLangExp, FreVarExp } from '../../langexpressions/metalanguage/index.js';

export class ValidatorDef extends FreMetaDefinitionElement {
    languageName: string = "";
    classifierRules: ClassifierRuleSet[] = [];

    toFreString(): string {
        return `validator for language ${this.languageName}
        
${this.classifierRules.map(rule => rule.toFreString()).join('\n\n')}`;
    }
}

export class ClassifierRuleSet extends FreMetaDefinitionElement {
    classifierRef: MetaElementReference<FreMetaClassifier> | undefined;
    rules: ValidationRule[] = [];

    get classifier(): FreMetaClassifier | undefined{
        return this.classifierRef?.referred;
    }

    toFreString(): string {
        return `${this.classifierRef?.name} {
    ${this.rules.map(rule => `${rule.toFreString()};`).join('\n\t')}
}`;
    }
}

export class ValidationSeverity extends FreMetaDefinitionElement {
    // 'value' is the string that the language engineer has provided in the .valid file
    // it will be disregarded after checking, instead 'severity' will be used
    value: string = "";
    severity: FreErrorSeverity | undefined; // is set by the checker

    toFreString(): string {
        return ``;
    }
}

export class ValidationMessage extends FreMetaDefinitionElement {
    content: ValidationMessagePart[] = [];

    toFreString(): string {
        return this.content.map((p) => p.toFreString()).join(" ");
    }
}

export type ValidationMessagePart = ValidationMessageText | ValidationMessageReference;

export class ValidationMessageText extends FreMetaDefinitionElement {
    value: string = "";

    toFreString(): string {
        return this.value;
    }
}

export class ValidationMessageReference extends FreMetaDefinitionElement {
    expression: FreLangExp | undefined;

    toFreString(): string {
        if (!!this.expression) {
            return this.expression.toFreString();
        } else {
            return "<unknown expression in ValidationMessageReference>";
        }
    }
}

export abstract class ValidationRule extends FreMetaDefinitionElement {
    // @ts-ignore this.severity is set during checking
    severity: ValidationSeverity;
    message: ValidationMessage | undefined;

    constructor() {
        super();
    }

    toFreString(): string {
        return "SHOULD BE IMPLEMENTED BY SUBCLASSES OF 'ValidatorDefLang.Rule'";
    }
}

export class CheckEqualsTypeRule extends ValidationRule {
    type1Exp: FreLangExp | undefined;
    type2Exp: FreLangExp | undefined;

    toFreString(): string {
        if (!!this.type1Exp && !!this.type2Exp) {
            return `typecheck equalsType( ${this.type1Exp.toFreString()}, ${this.type2Exp.toFreString()} )`;
        } else {
            return "<unknown check equals type rule>";
        }
    }
}

export class CheckConformsRule extends ValidationRule {
    type1Exp: FreLangExp | undefined;
    type2Exp: FreLangExp | undefined;

    toFreString(): string {
        if (!!this.type1Exp && !!this.type2Exp) {
            return `typecheck conformsTo( ${this.type1Exp.toFreString()}, ${this.type2Exp.toFreString()} )`;
        } else {
            return "<unknown check conforms rule>";
        }
    }
}

export class ExpressionRule extends ValidationRule {
    exp1: FreLangExp | undefined;
    exp2: FreLangExp | undefined;
    comparator: FreComparator | undefined;

    toFreString(): string {
        if (!!this.exp1 && !!this.exp2) {
            return `${this.exp1.toFreString()} ${this.comparator} ${this.exp2.toFreString()}`;
        } else {
            return "<unknown expression rule>";
        }
    }
}

export class IsUniqueRule extends ValidationRule {
    // the list in which the value of a property needs to be unique
    listExp: FreVarExp | undefined;
    // the property of each element in the list that should be tested for uniqueness
    listpropertyExp: FreVarExp | undefined;

    toFreString(): string {
        if (!!this.listpropertyExp && !!this.listExp) {
            return `isunique ${this.listpropertyExp.toFreString()} in ${this.listExp.toFreString()}`;
        } else {
            return "isunique <unknown property> in <unknown expression>";
        }
    }
}

export class NotEmptyRule extends ValidationRule {
    property: FreVarExp | undefined;

    toFreString(): string {
        if (!!this.property) {
            return `notEmpty ${this.property.toFreString()}`;
        } else {
            return "notEmpty <unknown property>";
        }
    }
}
export class ValidNameRule extends ValidationRule {
    property: FreLangExp | undefined;

    toFreString(): string {
        if (!!this.property) {
            return `validIdentifier ${this.property.toFreString()}`;
        } else {
            return "validIdentifier <unknown property>";
        }
    }
}

export enum FreComparator {
    Equals = "=",
    LargerThen = ">",
    LargerIncluding = ">=",
    SmallerThen = "<",
    SmallerIncluding = "<=",
}
