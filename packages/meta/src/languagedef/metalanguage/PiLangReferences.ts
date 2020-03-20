import { PiLanguageUnit, PiLangConcept, PiLangEnumeration, PiLangCUI, PiLangInterface, PiLangUnion, PiLangCI, PiLangProperty } from "./PiLanguage";

export class PiLangCUIReference {
    language: PiLanguageUnit;
    name: string;

    concept(): PiLangCUI {
        if(!!this.language) return this.language.findCUI(this.name);
    }
}

export class PiLangCIReference {
    language: PiLanguageUnit;
    name: string;

    concept(): PiLangCI {
        if(!!this.language) return this.language.findCI(this.name);
    }
}

export class PiLangConceptReference extends PiLangCUIReference {
    language: PiLanguageUnit;
    name: string;

    concept(): PiLangConcept {
        if(!!this.language) return this.language.findConcept(this.name);
    }
}

export class PiLangInterfaceReference extends PiLangCUIReference {
    language: PiLanguageUnit;
    name: string;

    concept(): PiLangInterface {
        if(!!this.language) return this.language.findInterface(this.name);
    }
}
export class PiLangUnionReference extends PiLangCUIReference {
    language: PiLanguageUnit;
    name: string;

    concept(): PiLangUnion {
        if(!!this.language) return this.language.findUnion(this.name);
    }
}


export class PiLangEnumerationReference {
    language: PiLanguageUnit;
    name: string;

    constructor() {
    }

    enumeration(): PiLangEnumeration {
        if(!!this.language) return this.language.findEnumeration(this.name);
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
