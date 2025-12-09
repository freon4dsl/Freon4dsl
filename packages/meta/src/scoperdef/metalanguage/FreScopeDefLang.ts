import type { FreMetaClassifier} from '../../languagedef/metalanguage/index.js';
import { MetaElementReference } from '../../languagedef/metalanguage/index.js';
import { FreMetaDefinitionElement } from "../../utils/no-dependencies/index.js";
import type { FreLangExp } from '../../langexpressions/metalanguage/index.js';
import { isNullOrUndefined } from '../../utils/file-utils/index.js';

export class ScopeDef extends FreMetaDefinitionElement {
    languageName: string = "";
    namespaceRefs: MetaElementReference<FreMetaClassifier>[] = [];
    scopeConceptDefs: ScopeConceptDef[] = [];

    /**
     * Convenience method only to be used after checking, because in that process
     * each MetaElementReference<FreMetaClassifier> is resolved, if possible.
     */
    get namespaces(): FreMetaClassifier[] {
        const result: FreMetaClassifier[] = [];
        this.namespaceRefs.forEach(namespaceRef => {
            if (!isNullOrUndefined(namespaceRef.referred)) {
                result.push(namespaceRef.referred);
            }
        })
        return result;
    }

    set namespaces(newNS: FreMetaClassifier[]) {
        this.namespaceRefs = [];
        newNS.forEach(namespaceRef => {
            this.namespaceRefs.push(MetaElementReference.create<FreMetaClassifier>(namespaceRef));
        });
    }

    toFreString(): string {
        return `scoper for language ${ this.languageName }
        isNamespace { ${this.namespaces.map(ns => ns.name).join(', ')} }
        ${this.scopeConceptDefs.map(def => def.toFreString()).join("\n")}`;
    }
}

export class ScopeConceptDef extends FreMetaDefinitionElement {
    classifierRef: MetaElementReference<FreMetaClassifier> | undefined;
    namespaceImports: FreNamespaceImport | undefined;
    namespaceAlternatives: FreNamespaceAlternative | undefined;

    /**
     * Convenience method only to be used after checking, because in that process
     * each MetaElementReference<FreMetaClassifier> is resolved, if possible.
     */
    get classifier(): FreMetaClassifier | undefined {
        if (!isNullOrUndefined(this.classifierRef)) {
            return this.classifierRef.referred;
        }
        return undefined;
    }

    toFreString(): string {
        return `${this.classifierRef?.name} {
            ${this.namespaceImports ? this.namespaceImports.toFreString() : ``}
            ${this.namespaceAlternatives ? this.namespaceAlternatives.toFreString() : ``}
        }`;
    }
}

export class FreNamespaceImport extends FreMetaDefinitionElement {
    nsInfoList: FreMetaNamespaceInfo[] = [];

    toFreString(): string {
        return `imports { ${this.nsInfoList.map(exp => exp.toFreString()).join(' ')} }`;
    }
}

export class FreNamespaceAlternative extends FreMetaDefinitionElement {
    nsInfoList: FreMetaNamespaceInfo[] = [];

    toFreString(): string {
        return `alternatives  { ${this.nsInfoList.map(exp => exp.toFreString()).join(' ')} }`;
    }
}

export class FreMetaNamespaceInfo extends FreMetaDefinitionElement {
    expression: FreLangExp | undefined;
    recursive: boolean = false;

    toFreString(): string {
        return `${this.recursive ? `recursive ` : ``}${this.expression?.toFreString()};`;
    }
}
