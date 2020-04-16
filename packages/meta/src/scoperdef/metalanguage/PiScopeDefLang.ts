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
    namespaceDef: PiNamespaceDef;
}

export class PiNamespaceDef {
    location: ParseLocation;
    expressions: PiLangExp[];
}
