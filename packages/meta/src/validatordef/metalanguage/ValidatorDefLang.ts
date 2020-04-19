import { PiLangConceptReference } from "../../languagedef/metalanguage/PiLangReferences";
import { PiLangExp } from "../../languagedef/metalanguage/PiLangExpressions";
import { ParseLocation } from "../../utils";

export class PiValidatorDef {
    location: ParseLocation;
    validatorName: string;
    languageName: string;
    conceptRules: ConceptRuleSet[];

    constructor() {}
}

export class ConceptRuleSet {
    location: ParseLocation;
    conceptRef: PiLangConceptReference;
    rules: ValidationRule[];
}

export abstract class ValidationRule {
    location: ParseLocation;
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
