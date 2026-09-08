import type { FreNamedNode, FreNodeReference } from '../ast/index.js';
import type { FreCompositeScoper } from "./FreCompositeScoper.js";
import type { FreNamespaceInfo } from './FreNamespaceInfo.js';
import type { FreScoperNamedNode, FreScoperNode } from "./internal.js"

// Part of the Freon Framework

export interface FreScoper<T extends FreScoperNode<T>> {
    mainScoper: FreCompositeScoper<T> | undefined // may be undefined only in the CompositeScoper

    /**
     *   Returns all elements that are visible in the namespace containing 'node'. Note that 'node' can
     *   be any node in the AST, not only namespaces!
     *
     *   When parameter 'metaType' is present, it returns all elements that are an instance of 'metaType'.
     *   There is no default setting for this parameter.
     *
     * @param node
     * @param metaType
     */
    getVisibleNodes(node: T | FreNodeReference<FreNamedNode>, metaType?: string): FreScoperNamedNode<T>[]

    /**
     * Returns all nodes and/or node references that represent namespaces which should be added to the namespace
     * represented by 'node'. Combined with every element is a property called 'recursive', which indicates whether
     * to include the imported namespaces from imported namespaces.
     *
     * @param node
     */
    importedNamespaces(node: T): FreNamespaceInfo<T>[]

    /**
     * Returns all nodes and/or node references that represent namespaces which should be used to replace
     * the parent namespace of the namespace represented by 'node'. Combined with every element is a property
     * called 'recursive', which indicates whether to include the imported namespaces from alternative namespaces.
     *
     * @param node
     */
    alternativeNamespaces(node: T): FreNamespaceInfo<T>[]
}
