/**
 * Class Namespace is a wrapper for a model node that is a namespace (as defined in the scoper definition).
 * It provides the implementation of the algorithm used to search for all names that are visible in the namespace.
 */

/* TODO This code is not adapted to resolving a FreNodeReference that has as pathname a fully qualified name which contains
    '<anonymous>'. This situation might occur when there is a namespace whose '_myNode' does not have a name, i.e. it is not a FreNamedNode.
*/

/*
To clarify the algorithm, we include the pseudocode for this class.
FreNamespace {
    getDeclaredNodes(publicOnly: boolean): FreNamedNode[] {
        return all AST nodes in the subtree of which this namespace is the top,
        and the leafs are AST nodes that are themselves namespaces.
        The parameter 'publicOnly' indicates whether to include AST nodes that are marked private.
    }
    getParentNodes(): FreNamedNode[] {
        THIS.parentNamespace.getVisibleNodes();
    }
    getImportedNodes(list: NamespaceImports): FreNamedNode[] {
        list.forEach( NS => {
            NS.getDeclaredNodes(PUBLIC_ONLY)
        plus
            if (import is recursive) {
                NS.getImportedNodes(NS.imports)
            }
        })
    }
    getAlternativeNodes(): FreNamedNode[] {
            getDeclaredNodes(ALL) plus
            getImportedNodes(THIS.alternatives)
    }
    getVisibleNodes(): FreNamedNode[] {
        if (has replacement) then
            getAlternativeNodes()
        else
            getDeclaredNodes(ALL) plus
            getParentNodes() plus
            getImportedNodes(THIS.imports)
        endif
    }
}

*/

import { type FreNode, type FreNamedNode, FreNodeReference } from '../ast/index.js';
import { AstWalker } from "../ast-utils/index.js";
import { FreLanguage } from "../language/index.js";
import { CollectDeclaredNodesWorker } from "./CollectDeclaredNodesWorker.js";
import { isNullOrUndefined, notNullOrUndefined } from '../util/index.js';
import { FreCompositeScoper } from './FreCompositeScoper.js';
import { FreLogger } from "../logging/index.js";
import { resolvePathStartingInNamespace } from './ScoperUtil.js';
import { FreNamespaceInfo } from './FreNamespaceInfo.js';

const LOGGER = new FreLogger("FreonNamespace").mute();

export const PUBLIC_AND_PRIVATE: boolean = false;
export const PUBLIC_ONLY: boolean = true;

export class FreNamespace {
    private static allNamespaces: Map<FreNode, FreNamespace> = new Map();

    /**
     * This method ensures that every node in the model has one and only one associated namespace object.
     * The type of 'node' should be marked as namespace in the scoper definition.
     * @param node
     */
    public static create(node: FreNode): FreNamespace {
        const existingNS = this.allNamespaces.get(node);
        if (!!existingNS) {
            return existingNS;
        } else {
            const result = new FreNamespace(node);
            this.allNamespaces.set(node, result);
            return result;
        }
    }

    public _myNode: FreNode;

    private constructor(node: FreNode) {
        // todo should we check whether node 'is' a namespace?
        if (!node) {
            LOGGER.log('FreNamespace constructed without node!');
        }
        this._myNode = node;
    }

    /**
     * Returns all named nodes that are declared in this namespace.
     *
     * If the parameter 'publicOnly' is true, no private nodes are returned,
     * only the public ones.
     *
     * @param publicOnly
     */
    public getDeclaredNodes(publicOnly: boolean): Set<FreNamedNode> {
        // console.log('getDeclaredNodes for ', this._myNode.['name'], ' publicOnly', publicOnly);
        let result: FreNamedNode[] = [];
        // Set up the 'worker' of the visitor pattern.
        const myNamesCollector = new CollectDeclaredNodesWorker();
        myNamesCollector.namesList = result;

        // Set up the 'walker' of the visitor pattern.
        const myWalker = new AstWalker();
        myWalker.myWorkers.push(myNamesCollector);

        // Walk over the AST and collect the nodes from the namespace, but not from any child namespace.
        // If 'publicOnly', do not gather the children from any nodes that are marked 'private',
        // not even the 'public' ones.
        myWalker.walk(this._myNode, (node: FreNode) => {
            // To not go into nested private nodes, we also check whether the property is public.
            return !FreLanguage.getInstance().classifier(node.freLanguageConcept()).isNamespace &&
              (!publicOnly ||
                (!!node.freOwner() &&
                  FreLanguage.getInstance().classifierProperty(
                    node.freOwner().freLanguageConcept(),
                    node.freOwnerDescriptor().propertyName,
                  ).isPublic))
        });

        // Filter the nodes on being 'public'.
        if (publicOnly) {
            result = result.filter((node) => {
                return (!!node.freOwner() &&
                  FreLanguage.getInstance().classifierProperty(
                    node.freOwner().freLanguageConcept(),
                    node.freOwnerDescriptor().propertyName
                  ).isPublic);
            })
        }

        // Transform the result to the required type.
        return new Set<FreNamedNode>(result);
    }

    /**
     * Returns all named nodes that are visible in the parent namespace of this namespace.
     * @param mainScoper
     * @param visitedNamespaces
     */
    public getParentNodes(mainScoper: FreCompositeScoper, visitedNamespaces: FreNamespace[]): FreNamedNode[] {
        const parentNamespace: FreNamespace = this.findParentNamespace(this);
        let resultSoFar: Set<FreNamedNode> = new Set();
        if (notNullOrUndefined(parentNamespace) && !visitedNamespaces.includes(parentNamespace)) {
            // We include all visible nodes from the parent, not only the declared nodes.
            parentNamespace.getVisibleNodes(mainScoper, visitedNamespaces, PUBLIC_AND_PRIVATE).forEach(x => {
                resultSoFar.add(x);
            });
            // No need to add 'parentNamespace' to 'visitedNamespaces', this is done by 'parentNamespace.getVisibleNodes'
        }
        // Transform the result to the required type.
        return Array.from(resultSoFar);
    }

    /**
     * Returns all named nodes that are visible in this namespace because of a namespace import statement in the .scope file.
     *
     * The parameter resultSoFar holds all visible nodes that are gathered so far in the process. These are used to
     * resolve any FreNodeReference in the set of imported namespaces. If any of these cannot be resolved, an error is logged.
     *
     * @param mainScoper
     * @param visitedNamespaces
     * @param resultSoFar
     */
    public getImportedNodes(mainScoper: FreCompositeScoper, visitedNamespaces: FreNamespace[], resultSoFar: Set<FreNamedNode>): FreNamedNode[] {
        const additionals: FreNamespaceInfo[] = mainScoper.importedNamespaces(this._myNode);

        // First add all imports that are not defined by FreNodeReferences
        additionals.forEach(namespaceInfo => {
            const nsNode = namespaceInfo._myNode;
            if (notNullOrUndefined(nsNode) && !(nsNode instanceof FreNodeReference)) {
                this.internalAddSingleImport(mainScoper, nsNode, visitedNamespaces, resultSoFar, namespaceInfo.recursive).forEach(n =>{
                    resultSoFar.add(n);
                })
            }
        });
        // Second, add imports that ARE defined by FreNodeReferences
        // This done after the 'normal' ones because the references may depend on the visible nodes of the other namespaces.
        // We loop over the references that are not resolved yet, until every one is done. If not every reference can be resolved,
        // an error is logged.
        let remainingNS: FreNamespaceInfo[] = [];
        additionals.forEach(namespaceInfo => {
            if (namespaceInfo._myNode instanceof FreNodeReference) remainingNS.push(namespaceInfo);
        });
        while (remainingNS.length > 0) {
            const toBeRemoved: FreNamespaceInfo[] = [];
            remainingNS.forEach(addon => {
                const node: FreNamedNode = this.findInResultSoFar(mainScoper, addon._myNode as FreNodeReference<FreNamedNode>, resultSoFar);
                if (notNullOrUndefined(node)) {
                    this.internalAddSingleImport(mainScoper, node, visitedNamespaces, resultSoFar, addon.recursive).forEach(n =>{
                        resultSoFar.add(n);
                    })
                    toBeRemoved.push(addon);
                }
            });
            if (toBeRemoved.length === 0) {
                // Nothing found, while still having remaining NS-es to resolve
                const referenceSeparator: string = '##'; // todo get value from .edit file
                LOGGER.error(
                  `getImportedNodes: cannot resolve imported namespaces for ${this._myNode["name"]} => ${remainingNS.map((remain) => (remain._myNode instanceof FreNodeReference ? remain._myNode.pathnameToString(referenceSeparator) : remain._myNode["name"]))}`,
                )
                break;
            }
            remainingNS = remainingNS.filter(el => !toBeRemoved.includes(el));
        }

        // Transform the result to the required type.
        return Array.from(resultSoFar);
    }

    /**
     * Returns all named nodes that are visible in this namespace from a namespace alternative statement in the .scope file.
     *
     * Any references must be resolvable within the parent namespace of this namespace, because otherwise it would not be resolvable.
     *
     * @param mainScoper
     * @param visitedNamespaces
     */
    public getAlternativeNodes(mainScoper: FreCompositeScoper, visitedNamespaces: FreNamespace[]): FreNamedNode[] {
        const alternatives: FreNamespaceInfo[] = mainScoper.alternativeNamespaces(this._myNode);
        let resultSoFar: Set<FreNamedNode> = this.getDeclaredNodes(PUBLIC_AND_PRIVATE);
        alternatives.forEach(namespaceInfo => {
            const nsNode = namespaceInfo._myNode;
            if (notNullOrUndefined(nsNode)) {
                const parentNs = this.findParentNamespace(this);
                const visibleInParent = new Set<FreNamedNode>(parentNs.getVisibleNodes(mainScoper, [], false));
                if (nsNode instanceof FreNodeReference) {
                    // NB the reference should be resolvable in the parent of this namespace. This should also be checked in meta!
                    // NB this restricts nsNode: it may not be a 'child' namespace of 'this'!
                    if (notNullOrUndefined(parentNs)) {
                        const resolvedNode = resolvePathStartingInNamespace(this, parentNs, nsNode.pathname, mainScoper, nsNode.typeName);
                        if (isNullOrUndefined(resolvedNode)) {
                            LOGGER.error(`Namespace that is defined via a reference ('${nsNode.pathname}') must be resolvable in the parent namespace of '${this._myNode['name']}' (i.e. in ${parentNs._myNode['name']}).`);
                        } else {
                            this.internalAddSingleImport(mainScoper, resolvedNode, visitedNamespaces, visibleInParent, namespaceInfo.recursive).forEach(n =>{
                                resultSoFar.add(n);
                            });
                        }
                    }
                } else {
                    const parentNs = this.findParentNamespace(this);
                    const visibleInParent = new Set<FreNamedNode>(parentNs.getVisibleNodes(mainScoper, [], false));
                    this.internalAddSingleImport(mainScoper, nsNode, visitedNamespaces, visibleInParent, namespaceInfo.recursive).forEach(n =>{
                        resultSoFar.add(n);
                    });
                }
            }
        });
        // Transform the result to the required type.
        return Array.from(resultSoFar);
    }

    /**
     * Returns all visible nodes in this namespace, taking into account any alternative namespace declarations, any import namespace
     * declarations, and the names from the parent namespace in the following order.
     *
     * 1. The declared nodes in this namespace itself. When 'publicOnly' is true, only public nodes are included.
     *    Otherwise, all declared nodes are included.
     * 2. If there are alternative namespace declarations, the declared nodes from these namespace are added.
     *    Based on the 'recursive' info in the alternative namespace declaration, its imported nodes are also included.
     * 3. If there are no alternative namespace declarations, all visible nodes from the parent namespace are included,
     *    followed by the declared nodes of the imports. Here too, based on the 'recursive' info in the import
     *    namespace declaration, its imported nodes are also included.
     *
     * @param mainScoper
     * @param visitedNamespaces
     * @param publicOnly
     */
    public getVisibleNodes(mainScoper: FreCompositeScoper, visitedNamespaces: FreNamespace[], publicOnly: boolean): FreNamedNode[] {
        // console.log(`getVisibleNodes ${this._myNode.['name']}`)
        visitedNamespaces.push(this);
        const replacements: FreNamespaceInfo[] = mainScoper.alternativeNamespaces(this._myNode);
        if (notNullOrUndefined(replacements) && replacements.length > 0) {
            return this.getAlternativeNodes(mainScoper, visitedNamespaces);
        } else {
            // First, add all the declared nodes.
            let resultSoFar: Set<FreNamedNode> = this.getDeclaredNodes(publicOnly);
            this.getParentNodes(mainScoper, visitedNamespaces).forEach(x => {
                resultSoFar.add(x);
            });
            this.getImportedNodes(mainScoper, visitedNamespaces, resultSoFar).forEach(x => {
                resultSoFar.add(x);
            })
            // Transform the result to the required type.
            return Array.from(resultSoFar);
        }
    }

    /**
     * Returns all declared nodes from namespace 'nsNode'. If 'recursive' is true, the nodes from the imported namespaces for 'nsNode' are also included.
     *
     * @param mainScoper
     * @param nsNode
     * @param visitedNamespaces
     * @param resultSoFar
     * @param recursive
     * @private
     */
    private internalAddSingleImport(mainScoper: FreCompositeScoper, nsNode: FreNode, visitedNamespaces: FreNamespace[], resultSoFar: Set<FreNamedNode>, recursive: boolean): Set<FreNamedNode> {
        const myResult: Set<FreNamedNode> = new Set<FreNamedNode>();
        const addedNs = FreNamespace.create(nsNode);
        if (!visitedNamespaces.includes(addedNs)) {
            addedNs.getDeclaredNodes(PUBLIC_ONLY).forEach(x => {
                myResult.add(x);
            });
            if (recursive) {
                addedNs.getImportedNodes(mainScoper, visitedNamespaces, resultSoFar).forEach(x => {
                    myResult.add(x);
                });
            }
            visitedNamespaces.push(addedNs);
        }
        return myResult;
    }

    /**
     * Return the parent namespace, i.e. the namespace associated with a node that is in the line of parent nodes in the AST.
     *
     * @param child
     * @private
     */
    private findParentNamespace(child: FreNamespace): FreNamespace | undefined {
        let owner: FreNode = child._myNode.freOwner();
        while (notNullOrUndefined(owner) ) {
            if (FreLanguage.getInstance().classifier(owner.freLanguageConcept()).isNamespace) {
                return FreNamespace.create(owner as FreNamedNode);
            } else {
                owner = owner.freOwner();
            }
        }
        return undefined;
    }


    /**
     * Try to resolve the first of the pathname of 'toBeResolved' in 'foundSoFar'.
     * If this succeeds, then resolve the rest of the path.
     *
     * @param mainScoper
     * @param toBeResolved
     * @param foundSoFar
     * @private
     */
    private findInResultSoFar(mainScoper: FreCompositeScoper, toBeResolved: FreNodeReference<FreNamedNode>, foundSoFar: Set<FreNamedNode>): FreNamedNode | undefined{
        // We have to take all names in the path into account.
        // Search the first name within the nodes that are found so far, and continue from there.
        let result: FreNamedNode = undefined;
        let pathname = toBeResolved.pathname;
        foundSoFar.forEach(node => {
            if (node.name === pathname[0]) {
                result = node;
            }
        })
        if (pathname.length > 1 && notNullOrUndefined(result) && FreLanguage.getInstance().classifier(result.freLanguageConcept()).isNamespace) {
            let currentNamespace: FreNamespace = FreNamespace.create(result);
            // Note that we need to pass the pathname without its first element,
            // and that the base namespace is different from the previous namespace!
            result = resolvePathStartingInNamespace(this, currentNamespace, pathname.slice(1), mainScoper, toBeResolved.typeName);
        }
        return result;
    }
}
