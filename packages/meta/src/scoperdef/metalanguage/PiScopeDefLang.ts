import { PiClassifier, PiConcept, PiLangExp } from "../../languagedef/metalanguage";
import { PiDefinitionElement } from "../../utils";
// The next import should be separate and the last of the imports.
// Otherwise, the run-time error 'Cannot read property 'create' of undefined' occurs.
// See: https://stackoverflow.com/questions/48123645/error-when-accessing-static-properties-when-services-include-each-other
// and: https://stackoverflow.com/questions/45986547/property-undefined-typescript
import { PiElementReference } from "../../languagedef/metalanguage";

export class PiScopeDef extends PiDefinitionElement {
    scoperName: string;
    languageName: string;
    namespaces: PiElementReference<PiClassifier>[] = [];
    scopeConceptDefs: ScopeConceptDef[] = [];
}

export class ScopeConceptDef extends PiDefinitionElement {
    conceptRef: PiElementReference<PiConcept>;
    namespaceAdditions: PiNamespaceAddition;
    alternativeScope: PiAlternativeScope;
}

export class PiNamespaceAddition extends PiDefinitionElement {
    expressions: PiLangExp[];
}

export class PiAlternativeScope extends PiDefinitionElement {
    expression: PiLangExp;
}
