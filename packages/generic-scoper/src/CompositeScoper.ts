import type { Scoper } from "./Scoper.js"
import type { NamespaceInfo } from "./NamespaceInfo.js"
import { type DeclaredNodeProvider, NamespaceRegistry, ScoperBase, type ScoperLanguage, type ScoperNamedNode, type ScoperNode } from "./internal.js"

/**
 * A scoper that combines multiple scopers into a single scoping service.
 *
 * The contained scopers are queried in order. For each operation, the first
 * scoper that returns a non-empty result determines the result of the
 * composite operation.
 *
 * This makes it possible to combine different sources of scoping information,
 * for example a generated language-specific scoper and additional manually
 * implemented scopers.
 *
 * The CompositeScoper also owns the infrastructure shared by the scoping
 * algorithms: the namespace registry, language-specific scoping information,
 * and the provider of declarations contained in namespaces.
 *
 * The type parameter T represents the common base type of all nodes
 * participating in scoping.
 */
export class CompositeScoper<T extends ScoperNode<T>> implements Scoper<T> {
    /**
     * Registry containing the namespace representations created during
     * scoping.
     */
    readonly registry: NamespaceRegistry<T>

    /**
     * Provides language-specific information required by the generic
     * scoping algorithms.
     */
    readonly scoperLanguage: ScoperLanguage<T>

    /**
     * Provides the named nodes declared directly in a namespace.
     */
    readonly declaredNodeProvider: DeclaredNodeProvider<T>

    /**
     * Scopers participating in this composite.
     *
     * Their order is significant: the first scoper that produces a non-empty
     * result determines the result of an operation.
     */
    private scopers: Scoper<T>[] = []

    constructor(
        scoperLanguage: ScoperLanguage<T>,
        declaredNodeProvider: DeclaredNodeProvider<T>,
    ) {
        this.scoperLanguage = scoperLanguage
        this.declaredNodeProvider = declaredNodeProvider
        this.registry = new NamespaceRegistry<T>(declaredNodeProvider)
    }

    /**
     * Adds a scoper at the end of the scoper chain.
     *
     * Scopers already present in the composite therefore have precedence
     * over the newly added scoper.
     *
     * @param scoper Scoper to add.
     */
    appendScoper(scoper: Scoper<T>): void {
        if (scoper instanceof ScoperBase) {
            scoper.setMainScoper(this)
        }
        this.scopers.push(scoper)
    }

    /**
     * Adds a scoper at the beginning of the scoper chain.
     *
     * The newly inserted scoper therefore has precedence over all scopers
     * already present in the composite.
     *
     * @param scoper Scoper to add.
     */
    insertScoper(scoper: Scoper<T>): void {
        if (scoper instanceof ScoperBase) {
            scoper.setMainScoper(this)
        }
        this.scopers.unshift(scoper)
    }

    /**
     * Returns the named nodes visible from the given model node.
     *
     * The contained scopers are queried in order. The first non-empty result
     * is returned. If none of the scopers finds visible nodes, an empty array
     * is returned.
     *
     * When typeName is provided, only nodes conforming to the requested
     * language type are returned.
     *
     * @param node Model node from whose context visibility is calculated.
     * @param typeName Optional language type used to filter the result.
     */
    getVisibleNodes(
        node: T,
        typeName?: string,
    ): ScoperNamedNode<T>[] {
        // console.log(
        //     `CompositeScoper.getVisibleNodes: ${node.scoperTypeName()}, requested type: ${typeName}`,
        // )

        for (const scoper of this.scopers) {
            const result = scoper.getVisibleNodes(node, typeName)

            if (result.length > 0) {
                return result
            }
        }

        return []
    }

    /**
     * Returns namespace imports defined for the given node.
     *
     * The contained scopers are queried in order. The first non-empty result
     * is returned. If none of the scopers defines imports, an empty array is
     * returned.
     *
     * @param node Node whose namespace imports are requested.
     */
    importedNamespaces(node: T): NamespaceInfo<T>[] {
        // console.log(
        //     `CompositeScoper.importedNamespaces: ${node.scoperTypeName()}`,
        // )

        for (const scoper of this.scopers) {
            const result = scoper.importedNamespaces(node)

            if (result.length > 0) {
                return result
            }
        }

        return []
    }

    /**
     * Returns alternative namespaces defined for the given node.
     *
     * The contained scopers are queried in order. The first non-empty result
     * is returned. If none of the scopers defines alternatives, an empty
     * array is returned.
     *
     * @param node Node whose alternative namespaces are requested.
     */
    alternativeNamespaces(node: T): NamespaceInfo<T>[] {
        // console.log(
        //     `CompositeScoper.alternativeNamespaces: ${node.scoperTypeName()}`,
        // )

        for (const scoper of this.scopers) {
            const result = scoper.alternativeNamespaces(node)

            if (result.length > 0) {
                return result
            }
        }

        return []
    }
}
