import { FreMetaClassifier } from "../../languagedef/metalanguage/index.js";
import { FreMetaDefinitionElement } from "../../utils/index.js";
import { MetaElementReference } from "../../languagedef/metalanguage/index.js";
import { FreLangExpNew } from '../../langexpressions/metalanguage/index.js';

export class ScopeDef extends FreMetaDefinitionElement {
    languageName: string = "";
    namespaces: MetaElementReference<FreMetaClassifier>[] = [];
    scopeConceptDefs: ScopeConceptDef[] = [];

    toFreString(): string {
        return `scoper for language ${ this.languageName }
        isNamespace { ${this.namespaces.map(ns => ns.name).join(', ')} }
        ${this.scopeConceptDefs.map(def => def.toFreString()).join("\n")}`;
    }
}

export class ScopeConceptDef extends FreMetaDefinitionElement {
    classifierRef: MetaElementReference<FreMetaClassifier> | undefined;
    namespaceAddition: FreNamespaceAddition | undefined;
    namespaceReplacement: FreReplacementNamespace | undefined;

    toFreString(): string {
        return `${this.classifierRef?.name} {
            ${this.namespaceAddition ? this.namespaceAddition.toFreString() : ``}
            ${this.namespaceReplacement ? this.namespaceReplacement.toFreString() : ``}
        }`;
    }
}

export class FreNamespaceAddition extends FreMetaDefinitionElement {
    expressions: FreNamespaceExpression[] = [];

    toFreString(): string {
        return `imports { ${this.expressions.map(exp => exp.toFreString()).join(' ')} }`;
    }
}

export class FreReplacementNamespace extends FreMetaDefinitionElement {
    expressions: FreNamespaceExpression[] = [];

    toFreString(): string {
        return `alternatives  { ${this.expressions.map(exp => exp.toFreString()).join(' ')} }`;
    }
}

export class FreNamespaceExpression extends FreMetaDefinitionElement {
    expression: FreLangExpNew | undefined;
    recursive: boolean = false;

    toFreString(): string {
        return `${this.recursive ? `recursive ` : ``}${this.expression?.toFreString()};`;
    }
}
