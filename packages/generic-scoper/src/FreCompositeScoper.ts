import { notNullOrUndefined } from './SimpleUtils.js';
import { type FreScoper } from "./FreScoper.js";
import { type FreNamespaceInfo } from './FreNamespaceInfo.js';
import { type FreDeclaredNodeProvider, FreNamespaceRegistry, type FreScoperLanguage, type FreScoperNamedNode, type FreScoperNode } from "./internal.js"

export class FreCompositeScoper<T extends FreScoperNode<T>> implements FreScoper<T> {
    readonly registry: FreNamespaceRegistry<T>
    readonly scoperLanguage: FreScoperLanguage<T>
    readonly declaredNodeProvider: FreDeclaredNodeProvider<T>
    mainScoper: FreCompositeScoper<T> | undefined // NB the value is always undefined, here to adhere to FreScoper interface
    private scopers: FreScoper<T>[] = []

    constructor(scoperLanguage: FreScoperLanguage<T>, declaredNodeProvider: FreDeclaredNodeProvider<T>) {
        this.scoperLanguage = scoperLanguage
        this.declaredNodeProvider = declaredNodeProvider
        this.registry = new FreNamespaceRegistry<T>(declaredNodeProvider)
    }

    appendScoper(t: FreScoper<T>) {
        this.scopers.push(t)
        t.mainScoper = this
    }

    insertScoper(t: FreScoper<T>) {
        this.scopers.splice(0, 0, t)
        t.mainScoper = this
    }

    /**
     * Returns all named nodes that are visible within the namespace that 'node' resides in. If
     * 'metatype' is present, only nodes that conform to this 'metatype' are returned.
     * @param node
     * @param metatype
     */
    getVisibleNodes(node: T, metatype?: string): FreScoperNamedNode<T>[] {
        // console.log('COMPOSITE getVisibleNodes for ' + node.freLanguageConcept() + " of type " + node.freLanguageConcept());
        console.log("COMPOSITE getVisibleNodes for node owned by " + node.freOwner())
        if (notNullOrUndefined(node)) {
            for (const scoper of this.scopers) {
                // todo should we concat the results from all scoper parts??
                const result = scoper.getVisibleNodes(node, metatype)
                if (result.length > 0) {
                    return result
                }
            }
        }
        return []
    }

    /**
     * Loops over all known scopers to find the information on namespace imports.
     * Note that currently as soon as a result is found, the remaining scopers are not
     * queried.
     * @param node
     */
    importedNamespaces(node: T): FreNamespaceInfo<T>[] {
        // todo should we check whether node 'is' a namespace?
        if (notNullOrUndefined(node)) {
            for (const scoper of this.scopers) {
                // todo should we concat the results from all scoper parts??
                const result = scoper.importedNamespaces(node)
                if (result.length > 0) {
                    return result
                }
            }
        }
        return []
    }

    /**
     * Loops over all known scopers to find the information on namespace alternatives.
     * Note that currently as soon as a result is found, the remaining scopers are not
     * queried.
     * @param node
     */
    alternativeNamespaces(node: T): FreNamespaceInfo<T>[] {
        // todo should we check whether node 'is' a namespace?
        console.log("COMPOSITE alternativeNamespaces of type " + node.freLanguageConcept())
        if (notNullOrUndefined(node)) {
            for (const scoper of this.scopers) {
                // todo should we concat the results from all scoper parts??
                const result: FreNamespaceInfo<T>[] = scoper.alternativeNamespaces(node)
                if (result.length > 0) {
                    return result
                }
            }
        }
        return []
    }
}
