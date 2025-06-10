import { FreMetaClassifier, MetaElementReference } from '../../languagedef/metalanguage/index.js';
import { FreLangExp } from '../../languagedef/metalanguage/index.js';
// Note that FreErrorSeverity cannot be imported from "@freon4dsl/core", because
// "@freon4dsl/meta" does not have a dependency on "@freon4dsl/core".
import { FreErrorSeverity, FreMetaDefinitionElement } from '../../utils/no-dependencies/index.js';

export class ValidatorDef extends FreMetaDefinitionElement {
    validatorName: string = "";
    languageName: string = "";
    conceptRules: ConceptRuleSet[] = [];
}

export class ConceptRuleSet extends FreMetaDefinitionElement {
    conceptRef: MetaElementReference<FreMetaClassifier> | undefined;
    rules: ValidationRule[] = [];
}

export class ValidationSeverity extends FreMetaDefinitionElement {
    // 'value' is the string that the language engineer has provided in the .valid file
    // it will be disregarded after checking, instead 'severity' will be used
    value: string = "";
    severity: FreErrorSeverity | undefined; // is set by the checker
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
    type1: FreLangExp | undefined;
    type2: FreLangExp | undefined;

    toFreString(): string {
        if (!!this.type1 && !!this.type2) {
            return `@typecheck equalsType( ${this.type1.toFreString()}, ${this.type2.toFreString()} )`;
        } else {
            return "<unknown check equals type rule>";
        }
    }
}

export class CheckConformsRule extends ValidationRule {
    type1: FreLangExp | undefined;
    type2: FreLangExp | undefined;

    toFreString(): string {
        if (!!this.type1 && !!this.type2) {
            return `@typecheck conformsTo( ${this.type1.toFreString()}, ${this.type2.toFreString()} )`;
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
    list: FreLangExp | undefined;
    listproperty: FreLangExp | undefined;
    comparator: FreComparator | undefined;

    toFreString(): string {
        if (!!this.listproperty && !!this.list) {
            return `isunique ${this.listproperty.toFreString()} in ${this.list.toFreString()}`;
        } else {
            return "isunique <unknown property> in <unknown expression>";
        }
    }
}

export class NotEmptyRule extends ValidationRule {
    property: FreLangExp | undefined;

    toFreString(): string {
        if (!!this.property) {
            return `@notEmpty ${this.property.toFreString()}`;
        } else {
            return "@notEmpty <unknown property>";
        }
    }
}
export class ValidNameRule extends ValidationRule {
    property: FreLangExp | undefined;

    toFreString(): string {
        if (!!this.property) {
            return `@validName ${this.property.toFreString()}`;
        } else {
            return "@validName <unknown property>";
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
