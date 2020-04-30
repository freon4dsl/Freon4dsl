import { PiConcept, PiLangExp } from "../../languagedef/metalanguage";
import { ParseLocation } from "../../utils";
// The next import should be separate and the last of the imports.
// Otherwise, the run-time error 'Cannot read property 'create' of undefined' occurs.
// See: https://stackoverflow.com/questions/48123645/error-when-accessing-static-properties-when-services-include-each-other
// and: https://stackoverflow.com/questions/45986547/property-undefined-typescript
import { PiElementReference} from "../../languagedef/metalanguage/PiElementReference";

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
