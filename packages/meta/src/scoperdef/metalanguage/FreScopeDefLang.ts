import { FreMetaClassifier, FreMetaConcept, FreLangExp } from "../../languagedef/metalanguage/index.js";
import { FreMetaDefinitionElement } from "../../utils/index.js";
// The next import should be separate and the last of the imports.
// Otherwise, the run-time error 'Cannot read property 'create' of undefined' occurs.
// See: https://stackoverflow.com/questions/48123645/error-when-accessing-static-properties-when-services-include-each-other
// and: https://stackoverflow.com/questions/45986547/property-undefined-typescript
import { MetaElementReference } from "../../languagedef/metalanguage/index.js";

export class ScopeDef extends FreMetaDefinitionElement {
    languageName: string = "";
    namespaces: MetaElementReference<FreMetaClassifier>[] = [];
    scopeConceptDefs: ScopeConceptDef[] = [];

    toFreString(): string {
        return `scoper for language ${ this.languageName }
        isnamespace { ${this.namespaces.map(ns => ns.name).join(', ')} }
        ${this.scopeConceptDefs.map(def => def.toFreString()).join("\n")}`;
    }
}

export class ScopeConceptDef extends FreMetaDefinitionElement {
    conceptRef: MetaElementReference<FreMetaConcept> | undefined;
    namespaceAddition: FreNamespaceAddition | undefined;
    namespaceReplacement: FreReplacementNamespace | undefined;

    toFreString(): string {
        return `${this.conceptRef?.name} {
            ${this.namespaceAddition ? this.namespaceAddition.toFreString() : ``}
            ${this.namespaceReplacement ? this.namespaceReplacement.toFreString() : ``}
        }`;
    }
}

export class FreNamespaceAddition extends FreMetaDefinitionElement {
    expressions: FreNamespaceExpression[] = [];

    toFreString(): string {
        return `import { ${this.expressions.map(exp => exp.toFreString())} }`;
    }
}

export class FreReplacementNamespace extends FreMetaDefinitionElement {
    expressions: FreNamespaceExpression[] = [];

    toFreString(): string {
        return `alternative  { ${this.expressions.map(exp => exp.toFreString())} }`;
    }
}

export class FreNamespaceExpression extends FreMetaDefinitionElement {
    expression: FreLangExp | undefined;
    recursive: boolean = false;

    toFreString(): string {
        return `${this.expression?.toFreString()} ${this.recursive ? `recursive` : ``};`;
    }
}
