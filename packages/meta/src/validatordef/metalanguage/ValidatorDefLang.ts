// Note that the following import cannot be from "@projectit/core", because
// this leads to a load error
// import { FreErrorSeverity } from "@projectit/core"; // todo remove this bug
import { FreErrorSeverity } from "../../utils/generation/FreErrorSeverity";
import { PiDefinitionElement } from "../../utils";
import { PiLangExp, PiConcept } from "../../languagedef/metalanguage";
// The next import should be separate and the last of the imports.
// Otherwise, the run-time error 'Cannot read property 'create' of undefined' occurs.
// See: https://stackoverflow.com/questions/48123645/error-when-accessing-static-properties-when-services-include-each-other
// and: https://stackoverflow.com/questions/45986547/property-undefined-typescript
import { MetaElementReference } from "../../languagedef/metalanguage/MetaElementReference";

export class PiValidatorDef extends PiDefinitionElement {
    validatorName: string;
    languageName: string;
    conceptRules: ConceptRuleSet[];
}

export class ConceptRuleSet extends PiDefinitionElement {
    conceptRef: MetaElementReference<PiConcept>;
    rules: ValidationRule[];
}

export class ValidationSeverity extends PiDefinitionElement {
    // 'value' is the string that the language engineer has provided in the .valid file
    // it will disregarded after checking, instead 'severity' will be used
    value: string;
    severity: FreErrorSeverity; // is set by the checker
}

export class ValidationMessage extends PiDefinitionElement {
    content: ValidationMessagePart[] = [];
    toFreString(): string {
        return this.content.map(p => p.toFreString()).join(" ");
    }
}

export type ValidationMessagePart = ValidationMessageText | ValidationMessageReference;

export class ValidationMessageText extends PiDefinitionElement {
    value: string;
    toFreString(): string {
        return this.value;
    }
}

export class ValidationMessageReference extends PiDefinitionElement {
    expression: PiLangExp;
    toFreString(): string {
        return this.expression.toPiString();
    }
}

export abstract class ValidationRule extends PiDefinitionElement {
    severity: ValidationSeverity;
    message: ValidationMessage;
    toFreString(): string {
        return "SHOULD BE IMPLEMENTED BY SUBCLASSES OF 'ValidatorDefLang.Rule'";
    }
}

export class CheckEqualsTypeRule extends ValidationRule {
    type1: PiLangExp;
    type2: PiLangExp;

    toFreString(): string {
        return `@typecheck equalsType( ${this.type1.toPiString()}, ${this.type2.toPiString()} )`;
    }
}

export class CheckConformsRule extends ValidationRule {
    type1: PiLangExp;
    type2: PiLangExp;

    toFreString(): string {
        return `@typecheck conformsTo( ${this.type1.toPiString()}, ${this.type2.toPiString()} )`;
    }
}

export class ExpressionRule extends ValidationRule {
    exp1: PiLangExp;
    exp2: PiLangExp;
    comparator: PiComparator;

    toFreString(): string {
        return `${this.exp1.toPiString()} ${this.comparator} ${this.exp2.toPiString()}`;
    }
}

export class IsuniqueRule extends ValidationRule {
    list: PiLangExp;
    listproperty: PiLangExp;
    comparator: PiComparator;

    toFreString(): string {
        return `isunique ${this.listproperty.toPiString()} in ${this.list.toPiString()}`;
    }
}

export class NotEmptyRule extends ValidationRule {
    property: PiLangExp;

    toFreString(): string {
        return `@notEmpty ${this.property.toPiString()}`;
    }
}
export class ValidNameRule extends ValidationRule {
    property: PiLangExp;

    toFreString(): string {
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
