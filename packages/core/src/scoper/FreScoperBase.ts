import { FreNode, FreNodeReference, FreNamedNode } from '../ast/index.js';
import { FreLanguage } from "../language//index.js";
import { FreLogger } from "../logging/index.js";
import { FreCompositeTyper } from "../typer/index.js";
import { FreCompositeScoper } from "./FreCompositeScoper.js";
import { FreNamespace } from "./FreNamespace.js";
import { FreScoper } from "./FreScoper.js";
import { isNullOrUndefined } from '../util/index.js';


const LOGGER = new FreLogger("FreScoperBase");

export abstract class FreScoperBase implements FreScoper {
    mainScoper: FreCompositeScoper;
    myTyper: FreCompositeTyper;
    // Added to avoid loop when searching for additional namespaces
    additionalNamespacesVisited: FreNodeReference<FreNamedNode>[] = [];
    protected beingResolved: FreNodeReference<FreNamedNode>[] = [];

    public resolvePathName(toBeResolved: FreNodeReference<FreNamedNode>): FreNamedNode | undefined {
        const pathname: string[] = toBeResolved.pathname;
        console.log('resolving: ', pathname)
        this.beingResolved.push(toBeResolved); // to avoid loops: do not resolve the one that is being resolved

        // We must be able to resolve every name in the path to a namespace, except the last. The last should
        // be a FreNamedNode of the type indicated by 'toBeResolved.typeName'.
        // Another requirement is that the first name must be visible in the owning namespace of 'toBeResolved'!

        // Loop over the set of names in the pathname.
        let previousNamespace: FreNamespace = this.findEnclosingNamespace(toBeResolved);
        let found: FreNamedNode = undefined;
        for (let index = 0; index < pathname.length; index++) {
            if (index === pathname.length - 1) {
                // Search the last name in the path, the result need not be a namespace, so use 'typeName'.
                found = this.getFromVisibleNodes(previousNamespace._myElem, pathname[index], toBeResolved.typeName);
            } else {
                // Search the next name of pathname in the 'previousNamespace'.
                // Do not use the 'typeName' information, because we are searching for another namespace, not for an element of type 'typeName'.
                found = this.getFromVisibleNodes(previousNamespace._myElem, pathname[index]);
                if ( isNullOrUndefined(found) || !FreLanguage.getInstance().classifier(found.freLanguageConcept()).isNamespace ) {
                    // The pathname is not correct, it does not lead to a namespace that is visible within 'previousNamespace',
                    // so clean up and return.
                    this.beingResolved.splice(this.beingResolved.indexOf(toBeResolved), 1);
                    return undefined;
                }
                // ELSE: found the next namespace in the pathname!
                // But 'found' is a FreNamedNode, so transform it into a namespace.
                previousNamespace = FreNamespace.create(found);
            }
        }
        // clean up and return
        this.beingResolved.splice(this.beingResolved.indexOf(toBeResolved), 1);
        return found;
    }

    /**
     * Find the node with name 'name' within the visible nodes of the namespace that 'node' resides in.
     * Often 'node' itself represents this namespace.
     *
     * If 'metatype' is present, only return the node if its type conforms to 'metatype'.
     *
     * @param node
     * @param name
     * @param metatype
     */
    public getFromVisibleNodes(
      node: FreNode,
      name: string,
      metatype?: string
    ): FreNamedNode {
        const visibleNodes = this.mainScoper.getVisibleNodes(node, metatype);
        if (visibleNodes !== null) {
            for (const element of visibleNodes) {
                const n: string = element.name;
                if (name === n) {
                    return element;
                }
            }
        }
        return null;
    }

    /**
     * Starting point can be any node in the AST!
     * @param node
     * @param metatype
     */
    public getVisibleNodes(node: FreNode, metatype?: string): FreNamedNode[] {
        // console.log('BASE getVisibleNodes for ' + node['name'] + " of type " + node.freLanguageConcept(), ", searching for " + metatype);
        // Initialize, remember all namespaces that we already included/visited, and add all nodes from the standard library.
        const visitedNamespaces: FreNamespace[] = [];
        const result: FreNamedNode[] = [].concat(this.getNodesFromStdlib(metatype));
        // Now do the work, meanwhile remembering which namespaces  have been visited.
        result.push(...this.getVisibleNodesIntern(node, visitedNamespaces, metatype));
        return result;
    }

    private getVisibleNodesIntern(
      node: FreNode,
      visitedNamespaces: FreNamespace[],
      metatype?: string,
    ): FreNamedNode[] {
        if (!isNullOrUndefined(node)) {
            // First find the namespace that 'node' is in.
            let nearestNamespace: FreNamespace = this.findEnclosingNamespace(node);
            if (!isNullOrUndefined(nearestNamespace) &&!visitedNamespaces.includes(nearestNamespace)) {
                // The namespace has not been visited before, so add all its declared nodes.
                let innerResult: Set<FreNamedNode> = nearestNamespace.getDeclaredNodes();
                visitedNamespaces.push(nearestNamespace);

                // Second, determine whether we need to include a replacement or the parent namespace
                const replacement = this.mainScoper.replacementNamespace(nearestNamespace._myElem);
                if (!isNullOrUndefined(replacement) && !visitedNamespaces.includes(replacement)) {
                    replacement.getDeclaredNodes().forEach(node => {
                        innerResult.add(node);
                    });
                    // todo add additional NS-es for replacement
                    visitedNamespaces.push(replacement);
                } else {
                    const parentNamespace: FreNamespace = this.findParentNamespace(nearestNamespace);
                    if (!isNullOrUndefined(parentNamespace) && !visitedNamespaces.includes(parentNamespace)) {
                        this.getVisibleNodesIntern(parentNamespace._myElem, visitedNamespaces, metatype).forEach(x => {
                            innerResult.add(x);
                        });
                        visitedNamespaces.push(parentNamespace);
                    }
                }
                this.mainScoper.additionalNamespaces(nearestNamespace._myElem).forEach(ns => {
                    if (!isNullOrUndefined(ns) && !visitedNamespaces.includes(ns)) {
                        ns.getDeclaredNodes().forEach(node => {
                            innerResult.add(node);
                        })
                        // todo add additional NS-es for additional ???
                        visitedNamespaces.push(ns)
                    }
                });
                return Array.from(innerResult);
            }
        } else {
            LOGGER.error("getVisibleNodes: node is null");
        }
        return [];
    }

    /**
     * Returns the enclosing namespace for 'node'. The result could be 'node' itself, if this is a namespace.
     * @param node
     */
    private findEnclosingNamespace(node: FreNodeReference<FreNamedNode> | FreNode): FreNamespace | undefined {
        if (isNullOrUndefined(node)) {
            return undefined;
        }
        if (node instanceof FreNodeReference) {
            return this.findEnclosingNamespace(node.freOwner());
        } else {
            if (FreLanguage.getInstance().classifier(node.freLanguageConcept()).isNamespace) {
                return FreNamespace.create(node);
            } else {
                return this.findEnclosingNamespace(node.freOwner());
            }
        }
    }

    /**
     * Returns the enclosing of parent namespace of 'child'.
     * @param child
     * @private
     */
    private findParentNamespace(child: FreNamespace): FreNamespace | undefined {
        let owner: FreNode = child._myElem.freOwner();
        while (!isNullOrUndefined(owner) ) {
            if (FreLanguage.getInstance().classifier(owner.freLanguageConcept()).isNamespace) {
                return FreNamespace.create(owner);
            } else {
                owner = owner.freOwner();
            }
        }
        return undefined;
    }

    /**
     * Returns all Nodes that are in the standard library, which types equal 'metatype'.
     * @param metatype
     */
    private getNodesFromStdlib(metatype?: string): FreNamedNode[] {
        if (!!metatype) {
            return FreLanguage.getInstance().stdLib.elements.filter((elem) =>
                FreLanguage.getInstance().metaConformsToType(elem, metatype),
            );
        } else {
            return FreLanguage.getInstance().stdLib.elements;
        }
    }

    // @ts-ignore parameter is present to adhere to interface FreScoper
    additionalNamespaces(node: FreNode): FreNamespace[] {
        return [];
    }

    // @ts-ignore parameter is present to adhere to interface FreScoper
    replacementNamespace(node: FreNode): FreNamespace {
        // console.log('BASE replacementNamespace for ' + node.freLanguageConcept() + " of type " + node.freLanguageConcept());
        return undefined;
    }
}
