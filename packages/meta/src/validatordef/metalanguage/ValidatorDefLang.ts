// Note that the following import cannot be from "@freon4dsl/core", because
// this leads to a load error
// import { FreErrorSeverity } from "@freon4dsl/core"; // todo remove this bug
import { FreErrorSeverity } from "../../utils/generation/FreErrorSeverity";
import { FreDefinitionElement } from "../../utils";
import { FreLangExp, FreConcept } from "../../languagedef/metalanguage";
// The next import should be separate and the last of the imports.
// Otherwise, the run-time error 'Cannot read property 'create' of undefined' occurs.
// See: https://stackoverflow.com/questions/48123645/error-when-accessing-static-properties-when-services-include-each-other
// and: https://stackoverflow.com/questions/45986547/property-undefined-typescript
import { MetaElementReference } from "../../languagedef/metalanguage/MetaElementReference";

export class ValidatorDef extends FreDefinitionElement {
    validatorName: string;
    languageName: string;
    conceptRules: ConceptRuleSet[];
}

export class ConceptRuleSet extends FreDefinitionElement {
    conceptRef: MetaElementReference<FreConcept>;
    rules: ValidationRule[];
}

export class ValidationSeverity extends FreDefinitionElement {
    // 'value' is the string that the language engineer has provided in the .valid file
    // it will disregarded after checking, instead 'severity' will be used
    value: string;
    severity: FreErrorSeverity; // is set by the checker
}

export class ValidationMessage extends FreDefinitionElement {
    content: ValidationMessagePart[] = [];
    toFreString(): string {
        return this.content.map(p => p.toFreString()).join(" ");
    }
}

export type ValidationMessagePart = ValidationMessageText | ValidationMessageReference;

export class ValidationMessageText extends FreDefinitionElement {
    value: string;
    toFreString(): string {
        return this.value;
    }
}

export class ValidationMessageReference extends FreDefinitionElement {
    expression: FreLangExp;
    toFreString(): string {
        return this.expression.toFreString();
    }
}

export abstract class ValidationRule extends FreDefinitionElement {
    severity: ValidationSeverity;
    message: ValidationMessage;
    toFreString(): string {
        return "SHOULD BE IMPLEMENTED BY SUBCLASSES OF 'ValidatorDefLang.Rule'";
    }
}

export class CheckEqualsTypeRule extends ValidationRule {
    type1: FreLangExp;
    type2: FreLangExp;

    toFreString(): string {
        return `@typecheck equalsType( ${this.type1.toFreString()}, ${this.type2.toFreString()} )`;
    }
}

export class CheckConformsRule extends ValidationRule {
    type1: FreLangExp;
    type2: FreLangExp;

    toFreString(): string {
        return `@typecheck conformsTo( ${this.type1.toFreString()}, ${this.type2.toFreString()} )`;
    }
}

export class ExpressionRule extends ValidationRule {
    exp1: FreLangExp;
    exp2: FreLangExp;
    comparator: FreComparator;

    toFreString(): string {
        return `${this.exp1.toFreString()} ${this.comparator} ${this.exp2.toFreString()}`;
    }
}

export class IsuniqueRule extends ValidationRule {
    list: FreLangExp;
    listproperty: FreLangExp;
    comparator: FreComparator;

    toFreString(): string {
        return `isunique ${this.listproperty.toFreString()} in ${this.list.toFreString()}`;
    }
}

export class NotEmptyRule extends ValidationRule {
    property: FreLangExp;

    toFreString(): string {
        return `@notEmpty ${this.property.toFreString()}`;
    }
}
export class ValidNameRule extends ValidationRule {
    property: FreLangExp;

    toFreString(): string {
        return `@validName ${this.property.toFreString()}`;
    }
}

export enum FreComparator {
    Equals = "=",
    LargerThen = ">",
    LargerIncluding = ">=",
    SmallerThen = "<",
    SmallerIncluding = "<="
}
