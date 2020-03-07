import { PiLangConceptReference } from "../PiLanguage";

export class PiScopeDef {
    scoperName: string;
    languageName: string;
    namespaces: PiNamespace[] = [];

    constructor() {
    }
}

export class PiNamespace {
    conceptRefs: PiLangConceptReference[];

    constructor() {
    }
}