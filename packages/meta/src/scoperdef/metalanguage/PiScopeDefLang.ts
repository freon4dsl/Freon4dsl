import { PiLangConceptReference } from "../../languagedef/metalanguage/PiLangReferences";
import { PiLangExp } from "../../languagedef/metalanguage";
import { ParseLocation } from "../../utils";

export class PiScopeDef {
    location: ParseLocation;
    scoperName: string;
    languageName: string;
    namespaces: PiNamespace[] = [];

    constructor() {
    }
}

export class PiNamespace {
    location: ParseLocation;
    conceptRefs: PiLangConceptReference[];

    constructor() {
    }
}

export class ScopeConceptDef {
    conceptRef: PiLangConceptReference;
    namespaceDef: PiNamespaceDef;
}

export class PiNamespaceDef {
    expressions: PiLangExp[];
}
