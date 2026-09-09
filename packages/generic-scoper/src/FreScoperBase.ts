import { notNullOrUndefined } from './SimpleUtils.js';
import type {
    FreCompositeScoper, FreNamespace, FreNamespaceInfo, FreScoper,
    FreScoperNamedNode, FreScoperNode
} from "./internal.js"
import { findEnclosingNamespace, hasCorrectType, PUBLIC_AND_PRIVATE } from "./internal.js"

/**
 * This class is the main implementation of the scoper algorithm. Every generated scoper inherits from this class, thus
 * its methods are used by every generated scoper.
 */

export abstract class FreScoperBase<T extends FreScoperNode<T>> implements FreScoper<T> {
    mainScoper: FreCompositeScoper<T>

    /**
     * @see FreScoper
     * @param node
     * @param metaType
     */
    public getVisibleNodes(node: T, metaType?: string): FreScoperNamedNode<T>[] {
        // console.log('BASE getVisibleNodes for ' + node['name'] + " of type " + node.freLanguageConcept(), ", metaType: " + metaType);
        console.log("BASE getVisibleNodes for " + node["name"] + " owned by " + node.freOwner(), ", metaType: " + metaType)
        if (!this.mainScoper) {
            console.error("getVisibleNodes: no mainScoper available")
            return []
        }
        if (notNullOrUndefined(node)) {
            // Initialize: remember all namespaces that we already included/visited, and add all nodes from the standard library.
            const visitedNamespaces: FreNamespace<T>[] = []
            // TODO get rid of FreLanguage
            let result: FreScoperNamedNode<T>[] = this.mainScoper.scoperLanguage.builtInNodes()
            // Find the namespace that 'node' is in
            const nearestNamespace: FreNamespace<T> | undefined = findEnclosingNamespace(node, this.mainScoper.registry, this.mainScoper.scoperLanguage)
            // Add the visible nodes from the namespace
            if (notNullOrUndefined(nearestNamespace)) {
                // console.log("nearestNamespace is: " + isScoperNamedNode(nearestNamespace.target) ? nearestNamespace.target.name : "unnamed")
                result.push(...nearestNamespace.getVisibleNodes(this.mainScoper, visitedNamespaces, PUBLIC_AND_PRIVATE))
            }
            console.log("before filtering: [" + result.map((r) => r.name).join(", ") + "]")
            // If the 'metaType' parameter is present, filter on metaType
            result = result.filter((elem) => hasCorrectType(this.mainScoper, elem, metaType))
            return result
        } else {
            console.error("getVisibleNodes: node is null")
            return []
        }
    }

    /**
     * Returns namespaces that should be imported into the scope of `node`.
     *
     * The default implementation returns no imported namespaces.
     * Language-specific scopers override this method when their scoping rules
     * introduce additional namespaces.
     */
    public importedNamespaces(_node: T): FreNamespaceInfo<T>[] {
        return []
    }

    /**
     * Returns alternative namespaces that may be used while resolving names
     * from the scope of `node`.
     *
     * The default implementation returns no alternative namespaces.
     */
    public alternativeNamespaces(_node: T): FreNamespaceInfo<T>[] {
        return []
    }
}
