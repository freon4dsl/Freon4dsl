/**
 * Class Namespace is a wrapper for a model node that is a namespace (as defined in the scoper definition).
 * It provides the implementation of the algorithm used to search for all names that are visible in the namespace.
 */
import { FreNode, FreNamedNode, FreNodeReference } from '../ast/index.js';
import { AstWalker } from "../ast-utils/index.js";
import { FreLanguage } from "../language/index.js";
import { CollectDeclaredNodesWorker } from "./CollectDeclaredNodesWorker.js";
import { isNullOrUndefined } from '../util/index.js';
import { FreCompositeScoper } from './FreCompositeScoper.js';
import { FreLogger } from "../logging/index.js";
import { resolvePathStartingInNamespace } from './ScoperUtil.js';
import { FreNamespaceInfo } from './FreNamespaceInfo.js';

const LOGGER = new FreLogger("FreonNamespace").mute();

export class FreNamespace {
    private static allNamespaces: Map<FreNode, FreNamespace> = new Map();
    // private mainScoper: FreCompositeScoper = undefined;

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
     * Returns all nodes that are declared in this namespace.
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

    public getParentNodes(mainScoper: FreCompositeScoper, visitedNamespaces: FreNamespace[], publicOnly: boolean): FreNamedNode[] {
        const parentNamespace: FreNamespace = this.findParentNamespace(this);
        let resultSoFar: Set<FreNamedNode> = new Set();
        if (!isNullOrUndefined(parentNamespace) && !visitedNamespaces.includes(parentNamespace)) {
            // We include all visible nodes form the parent, not only the declared nodes.
            parentNamespace.getVisibleNodes(mainScoper, visitedNamespaces, publicOnly).forEach(x => {
                resultSoFar.add(x);
            });
            // no need to add 'parentNamespace' to 'visitedNamespaces', this is done by 'parentNamespace.getVisibleNodes'
        }
        // Transform the result to the required type.
        return Array.from(resultSoFar);
    }
    
    public getImportedNodes(mainScoper: FreCompositeScoper, visitedNamespaces: FreNamespace[], publicOnly: boolean): FreNamedNode[] {
        const additionals: FreNamespaceInfo[] = mainScoper.additionalNamespaces(this._myNode);
        return this.internalAddImports(additionals, publicOnly, mainScoper, visitedNamespaces);
    }

    public getAlternativeNodes(mainScoper: FreCompositeScoper, visitedNamespaces: FreNamespace[], publicOnly: boolean): FreNamedNode[] {
        const alternatives: FreNamespaceInfo[] = mainScoper.alternativeNamespaces(this._myNode);
        let resultSoFar: Set<FreNamedNode> = this.getDeclaredNodes(publicOnly);
        this.internalAddImports(alternatives, publicOnly, mainScoper, visitedNamespaces).forEach(x => {
            resultSoFar.add(x);
        });
        // Transform the result to the required type.
        return Array.from(resultSoFar);
    }
    
    public getVisibleNodes(mainScoper: FreCompositeScoper, visitedNamespaces: FreNamespace[], publicOnly: boolean): FreNamedNode[] {
        // console.log(`getVisibleNodes ${this._myNode.['name']}`)
        visitedNamespaces.push(this);
        const replacements: FreNamespaceInfo[] = mainScoper.alternativeNamespaces(this._myNode);
        if (!isNullOrUndefined(replacements) && replacements.length > 0) {
            return this.getAlternativeNodes(mainScoper, visitedNamespaces, publicOnly);
        } else {
            // First, add all the declared nodes.
            let resultSoFar: Set<FreNamedNode> = this.getDeclaredNodes(publicOnly);
            this.getParentNodes(mainScoper, visitedNamespaces, publicOnly).forEach(x => {
                resultSoFar.add(x);
            });
            this.getImportedNodes(mainScoper, visitedNamespaces, publicOnly).forEach(x => {
                resultSoFar.add(x);
            })
            // Transform the result to the required type.
            return Array.from(resultSoFar);
        }
    }

    private internalAddImports(additionals: FreNamespaceInfo[], publicOnly: boolean, mainScoper: FreCompositeScoper, visitedNamespaces: FreNamespace[]): FreNamedNode[] {
        let resultSoFar: Set<FreNamedNode> = new Set();
        additionals.forEach(namespaceInfo => {
            const nsNode = namespaceInfo._myNode;
            if (!isNullOrUndefined(nsNode)) {
                if (nsNode instanceof FreNodeReference) {
                    // NB the reference should be resolvable in the parent of this namespace. This should also be checked in meta!
                    // NB this restricts nsNode: it may not be a 'child' namespace of 'this'!
                    const parentNs = this.findParentNamespace(this);
                    if (!isNullOrUndefined(parentNs)) {
                        const resolvedNode = resolvePathStartingInNamespace(this, parentNs, nsNode.pathname, mainScoper, nsNode.typeName);
                        if (isNullOrUndefined(resolvedNode)) {
                            LOGGER.error(`Namespace that is defined via a reference ('${nsNode.pathname}') must be resolvable in the parent namespace of '${this._myNode['name']}' (i.e. in ${parentNs._myNode['name']}).`);
                        } else {
                            this.internalAddSingleImport(resolvedNode, visitedNamespaces, publicOnly, resultSoFar, namespaceInfo, mainScoper);
                        }
                    }
                } else {
                    this.internalAddSingleImport(nsNode, visitedNamespaces, publicOnly, resultSoFar, namespaceInfo, mainScoper);
                }
            }
        });
        // Transform the result to the required type.
        return Array.from(resultSoFar);
    }

    private internalAddSingleImport(nsNode: FreNode, visitedNamespaces: FreNamespace[], publicOnly: boolean, resultSoFar: Set<FreNamedNode>, namespaceInfo: FreNamespaceInfo, mainScoper: FreCompositeScoper) {
        const addedNs = FreNamespace.create(nsNode);
        if (!visitedNamespaces.includes(addedNs)) {
            addedNs.getDeclaredNodes(publicOnly).forEach(x => {
                resultSoFar.add(x);
            });
            if (namespaceInfo.exported) {
                addedNs.getImportedNodes(mainScoper, visitedNamespaces, publicOnly).forEach(x => {
                    resultSoFar.add(x);
                });
            }
            visitedNamespaces.push(addedNs);
        }
    }

    /**
     * Return the parent namespace, i.e. the namespace associated with a node that is in the line of parent nodes in the AST.
     *
     * @param child
     * @private
     */
    private findParentNamespace(child: FreNamespace): FreNamespace | undefined {
        let owner: FreNode = child._myNode.freOwner();
        while (!isNullOrUndefined(owner) ) {
            if (FreLanguage.getInstance().classifier(owner.freLanguageConcept()).isNamespace) {
                return FreNamespace.create(owner as FreNamedNode);
            } else {
                owner = owner.freOwner();
            }
        }
        return undefined;
    }
}
