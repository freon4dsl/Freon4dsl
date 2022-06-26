// Note that the following import cannot be from "@projectit/core", because
// this leads to a load error
// import { PiErrorSeverity } from "@projectit/core";
import { PiErrorSeverity } from "../../utils/generation/PiErrorSeverity";
import { PiDefinitionElement } from "../../utils";
import { PiLangExp, PiConcept } from "../../languagedef/metalanguage";
// The next import should be separate and the last of the imports.
// Otherwise, the run-time error 'Cannot read property 'create' of undefined' occurs.
// See: https://stackoverflow.com/questions/48123645/error-when-accessing-static-properties-when-services-include-each-other
// and: https://stackoverflow.com/questions/45986547/property-undefined-typescript
import { PiElementReference } from "../../languagedef/metalanguage/PiElementReference";

export class PiValidatorDef extends PiDefinitionElement {
    validatorName: string;
    languageName: string;
    conceptRules: ConceptRuleSet[];
}

export class ConceptRuleSet extends PiDefinitionElement {
    conceptRef: PiElementReference<PiConcept>;
    rules: ValidationRule[];
}

export class ValidationSeverity extends PiDefinitionElement {
    // 'value' is the string that the language engineer has provided in the .valid file
    // it will disregarded after checking, instead 'severity' will be used
    value: string;
    severity: PiErrorSeverity; // is set by the checker
}

export class ValidationMessage extends PiDefinitionElement {
    content: ValidationMessagePart[] = [];
    toPiString(): string {
        return this.content.map(p => p.toPiString()).join(" ");
    }
}

export type ValidationMessagePart = ValidationMessageText | ValidationMessageReference;

export class ValidationMessageText extends PiDefinitionElement {
    value: string;
    toPiString(): string {
        return this.value;
    }
}

export class ValidationMessageReference extends PiDefinitionElement {
    expression: PiLangExp;
    toPiString(): string {
        return this.expression.toPiString();
    }
}

export abstract class ValidationRule extends PiDefinitionElement {
    severity: ValidationSeverity;
    message: ValidationMessage;
    toPiString(): string {
        return "SHOULD BE IMPLEMENTED BY SUBCLASSES OF 'ValidatorDefLang.Rule'";
    }
}

export class CheckEqualsTypeRule extends ValidationRule {
    type1: PiLangExp;
    type2: PiLangExp;

    toPiString(): string {
        return `@typecheck equalsType( ${this.type1.toPiString()}, ${this.type2.toPiString()} )`;
    }
}

export class CheckConformsRule extends ValidationRule {
    type1: PiLangExp;
    type2: PiLangExp;

    toPiString(): string {
        return `@typecheck conformsTo( ${this.type1.toPiString()}, ${this.type2.toPiString()} )`;
    }
}

export class ExpressionRule extends ValidationRule {
    exp1: PiLangExp;
    exp2: PiLangExp;
    comparator: PiComparator;

    toPiString(): string {
        return `${this.exp1.toPiString()} ${this.comparator} ${this.exp2.toPiString()}`;
    }
}

export class IsuniqueRule extends ValidationRule {
    list: PiLangExp;
    listproperty: PiLangExp;
    comparator: PiComparator;

    toPiString(): string {
        return `isunique ${this.listproperty.toPiString()} in ${this.list.toPiString()}`;
    }
}

export class NotEmptyRule extends ValidationRule {
    property: PiLangExp;

    toPiString(): string {
        return `@notEmpty ${this.property.toPiString()}`;
    }
}
export class ValidNameRule extends ValidationRule {
    property: PiLangExp;

    toPiString(): string {
        return `@validName ${this.property.toPiString()}`;
    }
}

export enum PiComparator {
    Equals = "=",
    LargerThen = ">",
    LargerIncluding = ">=",
    SmallerThen = "<",
    SmallerIncluding = "<="
}
