import { PiLangConceptReference } from "../../languagedef/metalanguage/PiLangReferences";
import { PiLangExp } from "../../languagedef/metalanguage";

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

export class ScopeConceptDef {
    conceptRef: PiLangConceptReference;
    namespaceDef: PiNamespaceDef;
}

export class PiNamespaceDef {
    expressions: PiLangExp[];
}
