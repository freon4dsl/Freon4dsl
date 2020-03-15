import { PiLanguageUnit, PiLangConcept, PiLangEnumeration, PiLangCUI, PiLangInterface, PiLangUnion } from "./PiLanguage";

export class PiLangCUIReference {
    language: PiLanguageUnit;
    name: string;

    constructor() {

    }

    concept(): PiLangCUI {
        if(!!this.language) return this.language.findCUI(this.name);
    }
}

export class PiLangConceptReference extends PiLangCUIReference {
    language: PiLanguageUnit;
    name: string;

    constructor() {
        super();
    }

    concept(): PiLangConcept {
        if(!!this.language) return this.language.findConcept(this.name);
    }
}

export class PiLangInterfaceReference extends PiLangCUIReference {
    language: PiLanguageUnit;
    name: string;

    constructor() {
        super();
    }

    concept(): PiLangInterface {
        if(!!this.language) return this.language.findInterface(this.name);
    }
}
export class PiLangUnionReference extends PiLangCUIReference {
    language: PiLanguageUnit;
    name: string;

    constructor() {
        super();
    }

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

