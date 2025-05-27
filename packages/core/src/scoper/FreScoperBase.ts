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
        // console.log('resolving: ', pathname)
        this.beingResolved.push(toBeResolved); // to avoid loops: do not resolve the one that is being resolved

        // We must be able to resolve every name in the path to a namespace, except the last. The last should
        // be a FreNamedNode of the type indicated by 'toBeResolved.typeName'.
        // Another requirement is that the first name must be visible in the owning namespace of 'toBeResolved'!

        // Loop over the set of names in the pathname.
        let previousNamespace: FreNamespace = this.findEnclosingNamespace(toBeResolved);
        let found: FreNamedNode = undefined;
        for (let index = 0; index < pathname.length; index++) {
            // console.log('searching for: ', pathname[index]);
            if (index === pathname.length - 1) {
                // Search the last name in the path, the result need not be a namespace, so use 'typeName'.
                found = this.getFromVisibleNodes(previousNamespace._myElem, pathname[index], toBeResolved.typeName);
            } else {
                // Search the next name of pathname in the 'previousNamespace'.
                // Do not use the 'typeName' information, because we are searching for another namespace, not for an element of type 'typeName'.
                found = this.getFromVisibleNodes(previousNamespace._myElem, pathname[index]);
                // console.log(`found number ${index} of path: `, found ? found['name'] : 'undefined')
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
        // console.log('resolved: ', found?.name);
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
    ): FreNamedNode | undefined {
        // console.log('BASE get**FROM**VisibleNodes for ' + node['name'] + " of type " + node.freLanguageConcept(), ", searching for " + metatype);
        const visibleNodes = this.mainScoper.getVisibleNodes(node, metatype);
        if (visibleNodes !== null) {
            for (const element of visibleNodes) {
                const n: string = element.name;
                if (name === n) {
                    return element;
                }
            }
        }
        return undefined;
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
        let result: FreNamedNode[] = [].concat(this.getNodesFromStdlib(metatype));
        // Now do the work, meanwhile remembering which namespaces  have been visited.
        result.push(...this.getVisibleNodesIntern(node, visitedNamespaces));
        // now filter on metatype
        result = result.filter(elem => this.hasCorrectType(elem, metatype))
        return result;
    }

    private getVisibleNodesIntern(
      node: FreNode,
      visitedNamespaces: FreNamespace[]
    ): FreNamedNode[] {
        // console.log('INTERNAL getVisibleNodes for ' + node['name'] + " of type " + node.freLanguageConcept(), ", searching for " + metatype);
        if (!isNullOrUndefined(node)) {
            // First find the namespace that 'node' is in, and add the declared nodes from this namespace.
            let nearestNamespace: FreNamespace = this.findEnclosingNamespace(node);
            if (!isNullOrUndefined(nearestNamespace) &&!visitedNamespaces.includes(nearestNamespace)) {
                // The namespace has not been visited before, so add all its declared nodes.
                let innerResult: Set<FreNamedNode> = nearestNamespace.getDeclaredNodes();
                // console.log('NEAREST: namespace ' + nearestNamespace._myElem['name'] + ' is done.');
                visitedNamespaces.push(nearestNamespace);

                // Second, determine whether we need to include a replacement or the parent namespace
                const parentNamespace: FreNamespace = this.findParentNamespace(nearestNamespace);
                const replacementNodes = this.mainScoper.replacementNamespaces(nearestNamespace._myElem);
                if (!isNullOrUndefined(replacementNodes) && replacementNodes.length > 0) {
                    // console.log('doing replacement nodes', replacementNodes.map(n => n?.name).join(', '));
                    // if any of the replacement namespaces is a reference, this reference should be resolved within the parent namespace!!!
                    replacementNodes.forEach((replacementNode) => {
                        let replacementNamespace: FreNamespace = undefined;
                        if (replacementNode instanceof FreNodeReference) {
                            // todo extend this to the visible nodes in parent namespace
                            const node = replacementNode.referred;
                            // const node: FreNamedNode = Array.from(parentNamespace.getDeclaredNodes()).find(node => node.name === replacementNode.name);
                            if (!isNullOrUndefined(node)) {
                                replacementNamespace = FreNamespace.create(node);
                                // console.log('found replacement: ' + replacementNode.pathname);
                            }
                        } else {
                            replacementNamespace = FreNamespace.create(replacementNode);
                        }
                        // console.log('replacement: ' + replacementNamespace?._myElem['name']);
                        if (!isNullOrUndefined(replacementNamespace) && !visitedNamespaces.includes(replacementNamespace)) {
                            replacementNamespace.getDeclaredNodes().forEach(node => {
                                innerResult.add(node);
                            });
                            // todo add additional NS-es for replacement
                            // console.log('REPLACEMENT: namespace ' + replacement._myElem['name'] + ' is done.');
                            visitedNamespaces.push(replacementNamespace);
                        }
                    })
                } else {
                    if (!isNullOrUndefined(parentNamespace) && !visitedNamespaces.includes(parentNamespace)) {
                        this.getVisibleNodesIntern(parentNamespace._myElem, visitedNamespaces).forEach(x => {
                            innerResult.add(x);
                        });
                        // no need to add 'parentNamespace' to 'visitedNamespaces', this is already done by 'getVisibleNodesIntern'
                    }
                }
                // Third, add nodes from additional namespaces
                this.addAdditionalNamespaces(nearestNamespace, innerResult, visitedNamespaces);
                // Fourth, return the result
                return Array.from(innerResult);
            }
        } else {
            LOGGER.error("getVisibleNodes: node is null");
        }
        return [];
    }

    private addAdditionalNamespaces(nearestNamespace: FreNamespace, innerResult: Set<FreNamedNode>, visitedNamespaces: FreNamespace[]) {
        // We need to add the additional namespaces after the 'normal' ones because one or more may depend on resolving
        // a reference.
        const additionalNS: (FreNode | FreNodeReference<FreNamedNode>)[] = this.mainScoper.additionalNamespaces(nearestNamespace._myElem);
        // set up the loop
        let remainingNS: FreNodeReference<FreNamedNode>[] = [];
        additionalNS.forEach(ns => {
            if (ns instanceof FreNodeReference) remainingNS.push(ns);
        });
        // todo add non-references
        // loop over the additional namespaces until every one is done
        while (remainingNS.length > 0) {
            // console.log('remaining: ', remainingNS.map(ns => ns.pathname).join(', '));
            const toBeRemoved: (FreNode | FreNodeReference<FreNamedNode>)[] = [];
            remainingNS.forEach(addon => {
                let ns: FreNamespace = undefined;
                const node: FreNamedNode = this.findInResultSoFar(addon, innerResult);
                if (!isNullOrUndefined(node)) {
                    ns = FreNamespace.create(node);
                    toBeRemoved.push(addon);
                    // console.log('found ' + addon.pathname);
                }
                if (!isNullOrUndefined(ns) && !visitedNamespaces.includes(ns)) {
                    // console.log('\tADDTIONAL: starting namespace ' + ns._myElem['name']);
                    ns.getDeclaredNodes().forEach(node => {
                        innerResult.add(node);
                    });
                    // todo add additional NS-es for additional ???
                    // console.log('\tADDTIONAL: namespace ' + ns._myElem['name'] + ' is done.');
                    visitedNamespaces.push(ns);
                }
            });
            remainingNS = remainingNS.filter(el => !toBeRemoved.includes(el));
        }
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
    additionalNamespaces(node: FreNode): (FreNode | FreNodeReference<FreNamedNode>)[] {
        return [];
    }

    // @ts-ignore parameter is present to adhere to interface FreScoper
    replacementNamespaces(node: FreNode): (FreNamedNode | FreNodeReference<FreNamedNode>)[] {
        // console.log('BASE replacementNamespace for ' + node.freLanguageConcept() + " of type " + node.freLanguageConcept());
        return undefined;
    }

    /**
     * Try to find 'addon' in 'innerResult'
     * @param addon
     * @param innerResult
     * @constructor
     * @private
     */
    private findInResultSoFar(addon: FreNodeReference<FreNamedNode>, innerResult: Set<FreNamedNode>): FreNamedNode | undefined{
        // first taking only one name in the path into account
        let result: FreNamedNode = undefined;
        innerResult.forEach(node => {
            if (node.name === addon.name) {
                result = node;
            }
        })
        return result;
    }

    /**
     * Checks whether 'freNode' has a type that conforms to 'metatype'.
     *
     * @param freNode
     * @param metatype
     * @private
     */
    private hasCorrectType(freNode: FreNode, metatype: string): boolean {
        if (!!metatype && metatype.length > 0) {
            return FreLanguage.getInstance().metaConformsToType(freNode, metatype);
        } else {
            return true;
        }
    }
}
