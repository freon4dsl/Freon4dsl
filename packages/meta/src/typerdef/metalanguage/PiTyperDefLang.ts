import { PiLangConceptReference, LangRefExpression } from "../../languagedef/metalanguage/PiLangReferences";

export class PiTyperDef {
    name: string;
    languageName: string;
    conceptRules: PiConceptTypeRuleSet[];

    constructor() { 
    }
}

export class PiConceptTypeRuleSet {
    conceptRef: PiLangConceptReference;
    rules: PiTypeRule[];
}

export abstract class PiTypeRule {   
    toPiString() : string {
        return "SHOULD BE IMPLEMENTED BY SUBCLASSES OF 'PiTyperDefLang.PiTypeRule'";
    }
}

export class EqualsTypeRule extends PiTypeRule {
    type1: LangRefExpression;
    type2: LangRefExpression;

    toPiString(): string {
        return `@typecheck equalsType( ${this.type1.toPiString()}, ${this.type2.toPiString()} )`;
    }
}

export class ConformsTypeRule extends PiTypeRule {
    type1: LangRefExpression;
    type2: LangRefExpression;

    toPiString(): string {
        return `@typecheck conformsTo( ${this.type1.toPiString()}, ${this.type2.toPiString()} )`;
    }
}

export class NotEmptyRule extends PiTypeRule {
    property: LangRefExpression;

    toPiString(): string {
        return `@notEmpty ${this.property.toPiString()}`; 
    }
}
export class ValidNameRule extends PiTypeRule {
    property: LangRefExpression;

    toPiString(): string {
        return `@validName ${this.property.toPiString()}`; 
    }
}
