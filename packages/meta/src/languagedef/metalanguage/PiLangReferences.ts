import { PiLanguageUnit, PiLangConcept, PiLangEnumeration } from "./PiLanguage";

export class PiLangConceptReference {
    language: PiLanguageUnit;
    name: string;

    constructor() {
    }

    concept(): PiLangConcept {
        if(!!this.language) return this.language.findConcept(this.name);
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