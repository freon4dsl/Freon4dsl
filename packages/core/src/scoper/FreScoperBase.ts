import { FreLanguage } from "../language/index.js";
import { FreLogger } from "../logging/index.js";
import { notNullOrUndefined } from '../util/index.js';
import type {
    FreCompositeScoper, FreNamespace, FreNamespaceInfo, FreScoper,
    FreScoperNamedNode, FreScoperNode
} from "./internal.js"
import { findEnclosingNamespace, hasCorrectType, transformFreNodes, PUBLIC_AND_PRIVATE } from "./internal.js"

const LOGGER = new FreLogger("FreScoperBase");

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
            LOGGER.error("getVisibleNodes: no mainScoper available")
            return []
        }
        if (notNullOrUndefined(node)) {
            // Initialize: remember all namespaces that we already included/visited, and add all nodes from the standard library.
            const visitedNamespaces: FreNamespace<T>[] = []
            // TODO get rid of FreLanguage
            let result: FreScoperNamedNode<T>[] = transformFreNodes(FreLanguage.getInstance().stdLib.elements)
            // Find the namespace that 'node' is in
            const nearestNamespace: FreNamespace<T> | undefined = findEnclosingNamespace(node, this.mainScoper.registry, this.mainScoper.scoperLanguage)
            // Add the visible nodes from the namespace
            if (notNullOrUndefined(nearestNamespace)) {
                // console.log("nearestNamespace is: " + isScoperNamedNode(nearestNamespace.target) ? nearestNamespace.target.name : "unnamed")
                result.push(...nearestNamespace.getVisibleNodes(this.mainScoper, visitedNamespaces, PUBLIC_AND_PRIVATE))
            }
            console.log("before filtering: [" + result.map(r => r.name).join(", ") + "]")
            // If the 'metaType' parameter is present, filter on metaType
            result = result.filter((elem) => hasCorrectType(elem, metaType))
            return result
        } else {
            LOGGER.error("getVisibleNodes: node is null")
            return []
        }
    }

    /**
     * @see FreScoper
     * @param node
     */
    importedNamespaces(_node: T): FreNamespaceInfo<T>[] {
        // This method may be overridden by any subclass of this class.
        return []
    }

    /**
     * @see FreScoper
     * @param node
     */
    alternativeNamespaces(_node: T): FreNamespaceInfo<T>[] {
        // This method may be overridden by any subclass of this class.
        return []
    }
}
