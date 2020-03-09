import { PiLangConceptReference, PiLangPropertyReference } from "../../languagedef/metalanguage/PiLanguage";

export class ValidatorDef {
    validatorName: string;
    languageName: string;
    conceptRules: ConceptRule[];

    constructor() { 
    }
}

export class ConceptRule {
    conceptRef: PiLangConceptReference;
    validNameRule: boolean; 
    typeRules: TypeRule[];
    notEmptyRules: NotEmptyRule[];
}

export abstract class TypeRule {   
}

export class EqualsTypeRule extends TypeRule {
    type1: TypeReference;
    type2: TypeReference;
}

export class ConformsTypeRule extends TypeRule {
    type1: TypeReference;
    type2: TypeReference;
}

export class NotEmptyRule {
    property: PiLangPropertyReference
}

export class TypeReference {
    sourceName: PiLangConceptReference; // either the 'XXX' in "XXX.yyy" or 'yyy' in "yyy"
    partName: PiLangPropertyReference;   // either the 'yyy' in "XXX.yyy" or 'null' in "yyy"
}
