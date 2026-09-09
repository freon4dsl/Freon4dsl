import type {
    CompositeScoper,
    Namespace,
    NamespaceInfo,
    Scoper,
    ScoperNamedNode,
    ScoperNode,
} from "./internal.js"
import {
    findEnclosingNamespace,
    hasCorrectType,
    PUBLIC_AND_PRIVATE,
} from "./internal.js"

/**
 * Base implementation of a scoper.
 *
 * ScoperBase implements the standard algorithm for determining the named
 * nodes that are visible from a given model node. Language-specific scopers
 * normally extend this class and only override the operations that define
 * imported or alternative namespaces.
 *
 * A ScoperBase is used as part of a CompositeScoper. The composite scoper is
 * responsible for coordinating all participating scopers and provides the
 * namespace registry and language-specific scoping information required by
 * the visibility algorithm.
 *
 * The type parameter T represents the common base type of all nodes
 * participating in scoping.
 */
export abstract class ScoperBase<T extends ScoperNode<T>> implements Scoper<T> {
    /**
     * The composite scoper that coordinates this scoper.
     *
     * This property is assigned when the scoper is added to a CompositeScoper.
     * It gives the base implementation access to shared scoping infrastructure,
     * such as the namespace registry and the language-specific scoper
     * information.
     *
     * It is intentionally not part of the Scoper interface: it is an
     * implementation detail of scopers that use this base class.
     */
    protected mainScoper: CompositeScoper<T>

    public setMainScoper(mainScoper: CompositeScoper<T>): void {
        this.mainScoper = mainScoper
    }

    /**
     * Returns all named nodes that are visible from the given model node.
     *
     * The node itself does not need to represent a namespace. The algorithm
     * first finds its nearest enclosing namespace and calculates visibility
     * from there.
     *
     * Built-in nodes are always included. The enclosing namespace then
     * contributes its visible declarations, imports and alternatives.
     *
     * When typeName is provided, the result is filtered so that only nodes
     * conforming to the requested language type are returned.
     *
     * @param node Model node from whose context visibility is calculated.
     * @param typeName Optional language type used to filter the result.
     */
    public getVisibleNodes(node: T, typeName?: string): ScoperNamedNode<T>[] {
        // console.log(
        //     `ScoperBase.getVisibleNodes: ${node.scoperTypeName()}, requested type: ${typeName}`,
        // )
        /*
         * Keep track of namespaces already visited while calculating
         * visibility. This prevents cycles caused by namespace imports
         * or alternatives.
         */
        const visitedNamespaces: Namespace<T>[] = []
        /*
         * Built-in nodes are visible independently of the namespace
         * containing the node.
         */
        let result: ScoperNamedNode<T>[] = this.mainScoper.scoperLanguage.builtInNodes()
        /*
         * Find the nearest namespace containing the node.
         */
        const nearestNamespace: Namespace<T> | undefined = findEnclosingNamespace(node, this.mainScoper.registry, this.mainScoper.scoperLanguage)
        /*
         * Add everything visible from the enclosing namespace.
         *
         * Because this is the namespace containing the original node,
         * both public and private declarations are visible.
         */
        if (nearestNamespace !== undefined) {
            result.push(...nearestNamespace.getVisibleNodes(this.mainScoper, visitedNamespaces, PUBLIC_AND_PRIVATE))
        }
        // console.log(
        //     `  visible before type filtering: [${result.map((node) => node.name).join(", ")}]`,
        // )
        /*
         * If a type was requested, retain only nodes that conform to it.
         */
        result = result.filter((element) => hasCorrectType(this.mainScoper, element, typeName))
        return result
    }

    /**
     * Returns namespaces that should be imported into the scope of the
     * given node.
     *
     * The default implementation returns no imported namespaces.
     * Language-specific scopers override this method when their scoping rules
     * introduce imports.
     *
     * @param _node Node whose namespace imports are requested.
     */
    public importedNamespaces(_node: T): NamespaceInfo<T>[] {
        return []
    }

    /**
     * Returns namespaces that replace or supplement the normal enclosing
     * namespace while calculating visibility from the given node.
     *
     * The default implementation returns no alternative namespaces.
     * Language-specific scopers override this method when their scoping rules
     * define alternatives.
     *
     * @param _node Node whose alternative namespaces are requested.
     */
    public alternativeNamespaces(_node: T): NamespaceInfo<T>[] {
        return []
    }
}
