import { PiConcept, PiElementReference, PiLangExp } from "../../languagedef/metalanguage";
import { ParseLocation } from "../../utils";

export class PiScopeDef {
    location: ParseLocation;
    scoperName: string;
    languageName: string;
    namespaces: PiElementReference<PiConcept>[] = [];
    scopeConceptDefs: ScopeConceptDef[] = [];

    constructor() {
    }
}

export class ScopeConceptDef {
    location: ParseLocation;
    conceptRef: PiElementReference<PiConcept>;
    namespaceAdditions: PiNamespaceAddition;
    alternativeScope: PiAlternativeScope;
}

export class PiNamespaceAddition {
    location: ParseLocation;
    expressions: PiLangExp[];
}

export class PiAlternativeScope {
    location: ParseLocation;
    expression: PiLangExp;
}
