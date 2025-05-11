import { FreMetaClassifier, FreMetaConcept, FreLangExp } from "../../languagedef/metalanguage/index.js";
import { FreMetaDefinitionElement } from "../../utils/index.js";
// The next import should be separate and the last of the imports.
// Otherwise, the run-time error 'Cannot read property 'create' of undefined' occurs.
// See: https://stackoverflow.com/questions/48123645/error-when-accessing-static-properties-when-services-include-each-other
// and: https://stackoverflow.com/questions/45986547/property-undefined-typescript
import { MetaElementReference } from "../../languagedef/metalanguage/index.js";

export class ScopeDef extends FreMetaDefinitionElement {
    scoperName: string = "";
    languageName: string = "";
    namespaces: MetaElementReference<FreMetaClassifier>[] = [];
    scopeConceptDefs: ScopeConceptDef[] = [];
}

export class ScopeConceptDef extends FreMetaDefinitionElement {
    conceptRef: MetaElementReference<FreMetaConcept> | undefined;
    namespaceAdditions: FreNamespaceAddition | undefined;
    replacementNamespace: FreReplacementNamespace | undefined;
}

export class FreNamespaceAddition extends FreMetaDefinitionElement {
    expressions: FreLangExp[] = [];
}

export class FreReplacementNamespace extends FreMetaDefinitionElement {
    expression: FreLangExp | undefined;
}
