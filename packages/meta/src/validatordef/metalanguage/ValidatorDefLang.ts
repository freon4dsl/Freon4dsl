import { PiLangConcept, PiLangEnumeration, PiLangProperty, PiLangCUI } from "../../languagedef/metalanguage/PiLanguage";
import { PiLangConceptReference } from "../../languagedef/metalanguage/PiLangReferences";

export class PiValidatorDef {
    validatorName: string;
    languageName: string;
    conceptRules: ConceptRuleSet[];

    constructor() { 
    }
}

export class ConceptRuleSet {
    conceptRef: PiLangConceptReference;
    rules: ValidationRule[];
}

export abstract class ValidationRule {   
    toPiString() : string {
        return "SHOULD BE IMPLEMENTED BY SUBCLASSES OF 'ValidatorDefLang.Rule'";
    }
}

export class EqualsTypeRule extends ValidationRule {
    type1: LangRefExpression;
    type2: LangRefExpression;

    toPiString(): string {
        return `@typecheck equalsType( ${this.type1.toPiString()}, ${this.type2.toPiString()} )`;
    }
}

export class ConformsTypeRule extends ValidationRule {
    type1: LangRefExpression;
    type2: LangRefExpression;

    toPiString(): string {
        return `@typecheck conformsTo( ${this.type1.toPiString()}, ${this.type2.toPiString()} )`;
    }
}

export class NotEmptyRule extends ValidationRule {
    property: LangRefExpression;

    toPiString(): string {
        return `@notEmpty ${this.property.toPiString()}`; 
    }
}
export class ValidNameRule extends ValidationRule {
    property: LangRefExpression;

    toPiString(): string {
        return `@validName ${this.property.toPiString()}`; 
    }
}

// The following classes combine the parse model (CST) of the validation definition (.valid file) with its AST.
// All AST values have prefix 'ast'. They are set in the ValidatorChecker.

export abstract class LangRefExpression {
    sourceName: string; // either the 'XXX' in "XXX.yyy" or 'yyy' in "yyy"
    appliedFeature?: PropertyRefExpression;   // either the 'yyy' in "XXX.yyy" or 'null' in "yyy"

    toPiString() : string {
        return "SHOULD BE IMPLEMENTED BY SUBCLASSES OF 'ValidatorDefLang.LangRefExpression'";
    }
}
export class ThisExpression extends LangRefExpression {
    astConcept: PiLangCUI; // is set by the checker

    toPiString() : string {
        let feat : string = this.appliedFeature ? '.' + this.appliedFeature.toPiString() : ""; 
        return this.sourceName + feat;  
    }
}

export class EnumRefExpression extends LangRefExpression {
    // no appliedfeature !!!
    literalName : string;
    astEnumType: PiLangEnumeration; // is set by the checker

    toPiString() : string {
        return this.sourceName + ":" + this.literalName;  
    }
}

export class PropertyRefExpression extends LangRefExpression {
    astProperty: PiLangProperty; // is set by the checker

    toPiString() : string {
        let feat : string = this.appliedFeature ? '.' + this.appliedFeature.toPiString() : ""; 
        return this.sourceName + feat;  
    }
}
