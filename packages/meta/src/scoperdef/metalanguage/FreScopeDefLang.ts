import { FreClassifier, FreConcept, FreLangExp } from "../../languagedef/metalanguage";
import { FreDefinitionElement } from "../../utils";
// The next import should be separate and the last of the imports.
// Otherwise, the run-time error 'Cannot read property 'create' of undefined' occurs.
// See: https://stackoverflow.com/questions/48123645/error-when-accessing-static-properties-when-services-include-each-other
// and: https://stackoverflow.com/questions/45986547/property-undefined-typescript
import { MetaElementReference } from "../../languagedef/metalanguage";

export class ScopeDef extends FreDefinitionElement {
    scoperName: string;
    languageName: string;
    namespaces: MetaElementReference<FreClassifier>[] = [];
    scopeConceptDefs: ScopeConceptDef[] = [];
}

export class ScopeConceptDef extends FreDefinitionElement {
    conceptRef: MetaElementReference<FreConcept>;
    namespaceAdditions: FreNamespaceAddition;
    alternativeScope: FreAlternativeScope;
}

export class FreNamespaceAddition extends FreDefinitionElement {
    expressions: FreLangExp[];
}

export class FreAlternativeScope extends FreDefinitionElement {
    expression: FreLangExp;
}
