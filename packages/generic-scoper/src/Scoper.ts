import type { NamespaceInfo, ScoperNamedNode, ScoperNode } from "./internal.js"

/**
 * Defines the operations provided by a scoper.
 *
 * A scoper determines which named nodes are visible from a given model node
 * and which namespaces contribute to that visibility.
 *
 * The type parameter T represents the common base type of all nodes
 * participating in scoping.
 */
export interface Scoper<T extends ScoperNode<T>> {
    /**
     * Returns the named nodes visible from the given node.
     *
     * The node may be any node in the model; it does not need to be a namespace.
     * Visibility is calculated relative to the namespace that contains the node.
     *
     * When typeName is provided, only nodes conforming to that language type
     * are returned.
     *
     * @param node Node from whose context visibility is calculated.
     * @param typeName Optional language type used to filter the result.
     */
    getVisibleNodes(node: T, typeName?: string): ScoperNamedNode<T>[]

    /**
     * Returns namespaces that are imported into the namespace represented by
     * the given node.
     *
     * Each returned NamespaceInfo specifies a namespace, or a reference to
     * one, together with whether imports of that namespace should themselves
     * be followed recursively.
     *
     * @param node Node representing the namespace whose imports are requested.
     */
    importedNamespaces(node: T): NamespaceInfo<T>[]

    /**
     * Returns namespaces that replace the normal parent namespace of the
     * namespace represented by the given node.
     *
     * Each returned NamespaceInfo specifies a namespace, or a reference to
     * one, together with whether alternatives of that namespace should
     * themselves be followed recursively.
     *
     * @param node Node representing the namespace whose alternatives are requested.
     */
    alternativeNamespaces(node: T): NamespaceInfo<T>[]
}
