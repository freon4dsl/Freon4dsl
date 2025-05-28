import { FreNode, FreNodeReference, FreNamedNode } from '../ast/index.js';
import { FreLanguage } from "../language//index.js";
import { FreLogger } from "../logging/index.js";
import { FreCompositeTyper } from "../typer/index.js";
import { FreCompositeScoper } from "./FreCompositeScoper.js";
import { FreNamespace } from "./FreNamespace.js";
import { FreScoper } from "./FreScoper.js";
import { isNullOrUndefined } from '../util/index.js';
import { findEnclosingNamespace } from './ScoperUtil.js';
import { FreLanguageEnvironment } from '../environment/index.js';


const LOGGER = new FreLogger("FreScoperBase");

export abstract class FreScoperBase implements FreScoper {
    mainScoper: FreCompositeScoper;
    myTyper: FreCompositeTyper;
    // Added to avoid loop when searching for additional namespaces
    additionalNamespacesVisited: FreNodeReference<FreNamedNode>[] = [];

    public resolvePathName(toBeResolved: FreNodeReference<FreNamedNode>): FreNamedNode | undefined {
        this.myTyper = FreLanguageEnvironment.getInstance().typer;
        // console.log('resolving: ', pathname)

        // We must be able to resolve every name in the path to a namespace without taking its metaType into account,
        // except the last. The last should be a FreNamedNode of the type indicated by 'toBeResolved.typeName'.
        // Another requirement is that the first name must be visible in the owning namespace of 'toBeResolved'!

        // Loop over the set of names in the pathname.
        const pathname: string[] = toBeResolved.pathname;
        let baseNamespace: FreNamespace = findEnclosingNamespace(toBeResolved);
        let previousNamespace: FreNamespace = baseNamespace;
        let found: FreNamedNode = undefined;
        let publicOnly: boolean;
        if (!isNullOrUndefined(previousNamespace)) {
            for (let index = 0; index < pathname.length; index++) {
                publicOnly = baseNamespace !== previousNamespace; // everything in the namespace that this reference is in, is visible
                // console.log(`searching for: ${pathname[index]}, using publicOnly is ${publicOnly}`);
                if (index !== pathname.length - 1) {
                    // Search the next name of pathname in the 'previousNamespace'.
                    // Do not use the 'typeName' information, because we are searching for another namespace, not for an element of type 'typeName'.
                    found = this.getFromVisibleNodes(previousNamespace, pathname[index], publicOnly);
                    // console.log(`found number ${index} of path, using publicOnly is ${publicOnly}: `, found ? found['name'] : 'undefined')
                    if (isNullOrUndefined(found) || !FreLanguage.getInstance().classifier(found.freLanguageConcept()).isNamespace) {
                        // The pathname is not correct, it does not lead to a namespace that is visible within 'previousNamespace',
                        // so return.
                        return undefined;
                    } else {
                        // found the next namespace in the pathname!
                        // But 'found' is a FreNamedNode, so transform it into a namespace.
                        previousNamespace = FreNamespace.create(found);
                    }
                } else {
                    // Search the last name in the path, the result need not be a namespace, so use 'typeName'.
                    found = this.getFromVisibleNodes(previousNamespace, pathname[index], publicOnly, toBeResolved.typeName);
                }
            }
        } else {
            LOGGER.error('Cannot find enclosing namespace for ' + toBeResolved.pathname);
        }
        // console.log('resolved: ', found?.name);
        return found;
    }

    /**
     * A convenience method that finds the node with name 'name' within the visible nodes of the namespace that 'node' resides in.
     * Often 'node' itself represents this namespace.
     *
     * If 'metaType' is present, only return the node if its type conforms to 'metaType'.
     *
     * @param namespace
     * @param name
     * @param publicOnly
     * @param metaType
     * @private
     */
    private getFromVisibleNodes(
      namespace: FreNamespace,
      name: string,
      publicOnly: boolean,
      metaType?: string
    ): FreNamedNode | undefined {
        // console.log('BASE get**FROM**VisibleNodes for ' + node['name'] + " of type " + node.freLanguageConcept(), ", searching for " + metaType);
        const visibleNodes = namespace.getVisibleNodes(this.mainScoper, [], publicOnly);
        if (visibleNodes !== null) {
            for (const node of visibleNodes) {
                const n: string = node.name;
                if (name === n && this.hasCorrectType(node, metaType)) {
                    return node;
                }
            }
        }
        return undefined;
    }

    public getVisibleNodes(node: FreNode, metaType?: string): FreNamedNode[] {
        console.log('BASE getVisibleNodes for ' + node['name'] + " of type " + node.freLanguageConcept(), ", metaType: " + metaType);
        this.myTyper = FreLanguageEnvironment.getInstance().typer;
        if (!isNullOrUndefined(node)) {
            // Initialize: remember all namespaces that we already included/visited, and add all nodes from the standard library.
            const visitedNamespaces: FreNamespace[] = [];
            let result: FreNamedNode[] = [].concat(FreLanguage.getInstance().stdLib.elements);
            // Find the namespace that 'node' is in
            let nearestNamespace: FreNamespace = findEnclosingNamespace(node);
            // Add the visible nodes from the namespace
            if (!isNullOrUndefined(nearestNamespace)) {
                result.push(...nearestNamespace.getVisibleNodes(this.mainScoper, visitedNamespaces, false));
            }
            // If the 'metaType' parameter is present, filter on metaType
            result = result.filter(elem => this.hasCorrectType(elem, metaType))
            return result;
        } else {
            LOGGER.error("getVisibleNodes: node is null");
            return [];
        }
    }

    /**
     * Checks whether 'freNode' has a type that conforms to 'metaType'.
     *
     * @param freNode
     * @param metaType
     * @private
     */
    private hasCorrectType(freNode: FreNode, metaType: string): boolean {
        if (!!metaType && metaType.length > 0) {
            return FreLanguage.getInstance().metaConformsToType(freNode, metaType);
        } else {
            return true;
        }
    }

    // @ts-ignore parameter is present to adhere to interface FreScoper
    additionalNamespaces(node: FreNode): (FreNode | FreNodeReference<FreNamedNode>)[] {
        return [];
    }

    // @ts-ignore parameter is present to adhere to interface FreScoper
    replacementNamespaces(node: FreNode): (FreNamedNode | FreNodeReference<FreNamedNode>)[] {
        return [];
    }

}
