import { PiLangConceptReference } from "../PiLanguage";

export class PiScopeDef {
    scoperName: string;
    languageName: string;
    namespaces: PiNamespace[] = [];

    constructor() {
    }
}

export class PiNamespace {
    conceptRef: PiLangConceptReference;

    constructor() {
    }
}