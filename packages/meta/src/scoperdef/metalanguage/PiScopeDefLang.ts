import { PiLangConceptReference } from "../../languagedef/metalanguage/PiLangReferences";
import { PiLangExp } from "../../languagedef/metalanguage";
import { ParseLocation } from "../../utils";

export class PiScopeDef {
    location: ParseLocation;
    scoperName: string;
    languageName: string;
    namespaces: PiLangConceptReference[] = [];
    scopeConceptDefs: ScopeConceptDef[] = [];

    constructor() {
    }
}

export class ScopeConceptDef {
    location: ParseLocation;
    conceptRef: PiLangConceptReference;
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
