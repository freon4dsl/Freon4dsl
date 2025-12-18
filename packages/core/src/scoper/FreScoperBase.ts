import type { FreNode, FreNamedNode } from '../ast/index.js';
import { FreLanguage } from "../language/index.js";
import { FreLogger } from "../logging/index.js";
import type { FreCompositeTyper } from "../typer/index.js";
import type { FreCompositeScoper } from "./FreCompositeScoper.js";
import type { FreNamespace} from './FreNamespace.js';
import { PUBLIC_AND_PRIVATE } from './FreNamespace.js';
import type { FreScoper } from "./FreScoper.js";
import { notNullOrUndefined } from '../util/index.js';
import { findEnclosingNamespace, hasCorrectType } from './ScoperUtil.js';
import { FreLanguageEnvironment } from '../environment/index.js';

const LOGGER = new FreLogger("FreScoperBase");

/**
 * This class is the main implementation of the scoper algorithm. Every generated scoper inherits from this class, thus
 * its methods are used by every generated scoper.
 */

export abstract class FreScoperBase implements FreScoper {
    mainScoper: FreCompositeScoper;
    myTyper: FreCompositeTyper; // todo see whether this can be replaced by FreLanguageEnvironment.getInstance().typer

    /**
     * @see FreScoper
     * @param node
     * @param metaType
     */
    public getVisibleNodes(node: FreNode, metaType?: string): FreNamedNode[] {
        // console.log('BASE getVisibleNodes for ' + node['name'] + " of type " + node.freLanguageConcept(), ", metaType: " + metaType);
        this.myTyper = FreLanguageEnvironment.getInstance().typer;
        if (notNullOrUndefined(node)) {
            // Initialize: remember all namespaces that we already included/visited, and add all nodes from the standard library.
            const visitedNamespaces: FreNamespace[] = [];
            let result: FreNamedNode[] = [].concat(FreLanguage.getInstance().stdLib.elements);
            // Find the namespace that 'node' is in
            let nearestNamespace: FreNamespace = findEnclosingNamespace(node);
            // Add the visible nodes from the namespace
            if (notNullOrUndefined(nearestNamespace)) {
                result.push(...nearestNamespace.getVisibleNodes(this.mainScoper, visitedNamespaces, PUBLIC_AND_PRIVATE));
            }
            // If the 'metaType' parameter is present, filter on metaType
            result = result.filter(elem => hasCorrectType(elem, metaType))
            return result;
        } else {
            LOGGER.error("getVisibleNodes: node is null");
            return [];
        }
    }

    /**
     * @see FreScoper
     * @param node
     */
    // @ts-ignore parameter is present to adhere to interface FreScoper
    importedNamespaces(node: FreNode): FreNamespaceInfo[] {
        // This method may be overridden by any subclass of this class.
        return [];
    }

    /**
     * @see FreScoper
     * @param node
     */
    // @ts-ignore parameter is present to adhere to interface FreScoper
    alternativeNamespaces(node: FreNode): FreNamespaceInfo[] {
        // This method may be overridden by any subclass of this class.
        return [];
    }
}
