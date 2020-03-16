import { PiLangConcept, PiLangEnumeration, PiLangElementProperty, PiLangProperty } from "../../languagedef/metalanguage/PiLanguage";
import { PiLangConceptReference } from "../../languagedef/metalanguage/PiLangReferences";

// These classes combine the parse model (CST) of the validation definition (.valid file) with its AST.
// All AST values have prefix 'ast'. They are set in the ValidatorChecker.

export class PiValidatorDef {
    validatorName: string;
    languageName: string;
    conceptRules: ConceptRule[];

    constructor() { 
    }
}

export class ConceptRule {
    conceptRef: PiLangConceptReference;
    astConcept: PiLangConcept;
    rules: Rule[];
}

export abstract class Rule {   
}

export class EqualsTypeRule extends Rule {
    type1: LangRefExpression;
    type2: LangRefExpression;
    astType1: PiLangConcept;
    astType2: PiLangConcept;
}

export class ConformsTypeRule extends Rule {
    type1: LangRefExpression;
    type2: LangRefExpression;
}

export class NotEmptyRule extends Rule {
    property: LangRefExpression;
    refersTo: PiLangProperty; // is set by the checker
}
export class ValidNameRule extends Rule {
    property: PropertyRefExpression;
    refersTo: PiLangProperty;  // is set by the checker
}

export abstract class LangRefExpression {
    sourceName: string; // either the 'XXX' in "XXX.yyy" or 'yyy' in "yyy"
    appliedFeature?: PropertyRefExpression;   // either the 'yyy' in "XXX.yyy" or 'null' in "yyy"

    makeString() : string {
        let feat : string = this.appliedFeature ? '.' + this.appliedFeature.makeString() : ""; 
        return this.sourceName + feat;  
    }
}
export class ThisExpression extends LangRefExpression {
    myConcept: PiLangConcept; // is set by the checker
}

export class EnumRefExpression extends LangRefExpression {
    // no appliedfeature !!!
    literalName : string;
    myEnumLiteral: PiLangEnumeration; // is set by the checker
}

export class PropertyRefExpression extends LangRefExpression {
    myProperty: PiLangProperty; // is set by the checker

}
