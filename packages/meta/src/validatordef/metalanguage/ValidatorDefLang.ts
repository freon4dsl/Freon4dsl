import { PiLangExp } from "../../languagedef/metalanguage/PiLangExpressions";
import { ParseLocation } from "../../utils";
import { PiConcept } from "../../languagedef/metalanguage";
// The next import should be separate and the last of the imports.
// Otherwise, the run-time error 'Cannot read property 'create' of undefined' occurs.
// See: https://stackoverflow.com/questions/48123645/error-when-accessing-static-properties-when-services-include-each-other
// and: https://stackoverflow.com/questions/45986547/property-undefined-typescript
import { PiElementReference} from "../../languagedef/metalanguage/PiElementReference";

export class PiValidatorDef {
    location: ParseLocation;
    validatorName: string;
    languageName: string;
    conceptRules: ConceptRuleSet[];

    constructor() {}
}

export class ConceptRuleSet {
    location: ParseLocation;
    conceptRef: PiElementReference<PiConcept>;
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
