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
import { findEnclosingNamespace, resolvePathStartingInNamespace } from './ScoperUtil.js';

const LOGGER = new FreLogger("FreonNamespace").mute();

export class FreNamespace {
    private static allNamespaces: Map<FreNode, FreNamespace> = new Map();
    private mainScoper: FreCompositeScoper = undefined;

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

    /**
     * Returns all nodes that are visible in this namespace, including those from additional namespaces,
     * and replacement namespaces as defined in the scoper definition. All namespaces that are in
     * 'visitedNamespaces' are not included in the result.
     *
     * @param mainScoper
     * @param visitedNamespaces
     * @param publicOnly
     */
    public getVisibleNodes(mainScoper: FreCompositeScoper, visitedNamespaces: FreNamespace[], publicOnly: boolean): FreNamedNode[] {
        // console.log(`getVisibleNodes ${this._myNode.['name']}`)
        this.mainScoper = mainScoper;
        // First, add all the declared nodes.
        let resultSoFar: Set<FreNamedNode> = this.getDeclaredNodes(publicOnly);
        visitedNamespaces.push(this);

        // Second, determine whether we need to include a replacement or the parent namespace
        const parentNamespace: FreNamespace = this.findParentNamespace(this);
        const replacementNodes = this.mainScoper.replacementNamespaces(this._myNode);
        if (!isNullOrUndefined(replacementNodes) && replacementNodes.length > 0) {
            this.addReplacementNamespaces(replacementNodes, visitedNamespaces, resultSoFar);
        } else {
            if (!isNullOrUndefined(parentNamespace) && !visitedNamespaces.includes(parentNamespace)) {
                parentNamespace.getVisibleNodes(this.mainScoper, visitedNamespaces, publicOnly).forEach(x => {
                    resultSoFar.add(x);
                });
                // no need to add 'parentNamespace' to 'visitedNamespaces', this is done by 'parentNamespace.getVisibleNodes'
            }
        }
        // Third, add nodes from additional namespaces
        const additionalNodes = this.mainScoper.additionalNamespaces(this._myNode);
        this.addAdditionalNamespaces(additionalNodes, visitedNamespaces, resultSoFar);
        // Fourth, transform the result to the required type.
        return Array.from(resultSoFar);
    }

    /**
     *
     * @param replacementNodes
     * @param visitedNamespaces
     * @param resultSoFar
     * @private
     */
    private addReplacementNamespaces(replacementNodes: (FreNode | FreNodeReference<FreNamedNode>)[], visitedNamespaces: FreNamespace[], resultSoFar: Set<FreNamedNode>) {
        // console.log('replacement namespaces: ', replacementNodes.map(n => n['name']));
        replacementNodes.forEach((replacementNode) => {
            let replacementNamespace: FreNamespace = undefined;
            if (replacementNode instanceof FreNodeReference) {
                // NB using '.referred' only works when the owner of the reference does not reside in 'this'.
                // This should also be checked in meta!
                const toBeChecked: FreNamespace = findEnclosingNamespace(replacementNode.freOwner());
                if (toBeChecked === this) {
                    LOGGER.error(`Cannot add as namespace one that is defined via a reference '${replacementNode.pathname}' that resides in the same namespace '${this._myNode['name']}'`);
                } else {
                    const node: FreNamedNode = replacementNode.referred;
                    if (!isNullOrUndefined(node)) {
                        replacementNamespace = FreNamespace.create(node);
                    }
                }
            } else {
                replacementNamespace = FreNamespace.create(replacementNode);
            }
            this.addNS(replacementNamespace, visitedNamespaces, resultSoFar);
        });
    }

    /**
     *
     * @param additionalNodes
     * @param visitedNamespaces
     * @param resultSoFar
     * @private
     */
    private addAdditionalNamespaces(additionalNodes: (FreNode | FreNodeReference<FreNamedNode>)[], visitedNamespaces: FreNamespace[], resultSoFar: Set<FreNamedNode>) {
        // First add all additions that are not defined by FreNodeReferences
        additionalNodes.forEach(namespaceNode => {
            if (!(namespaceNode instanceof FreNodeReference) && !isNullOrUndefined(namespaceNode)) {
                this.addNS(FreNamespace.create(namespaceNode), visitedNamespaces, resultSoFar);
            }
        });
        // Second, add additions that are not defined by FreNodeReferences
        // This done after the 'normal' ones because the references may depend on the visible nodes of the other namespaces.
        // We loop over the references that are not resolved yet, until every one is done.
        let remainingNS: FreNodeReference<FreNamedNode>[] = [];
        additionalNodes.forEach(namespaceNode => {
            if (namespaceNode instanceof FreNodeReference) remainingNS.push(namespaceNode);
        });
        while (remainingNS.length > 0) {
            const toBeRemoved: (FreNode | FreNodeReference<FreNamedNode>)[] = [];
            remainingNS.forEach(addon => {
                const node: FreNamedNode = this.findInResultSoFar(addon, resultSoFar);
                if (!isNullOrUndefined(node)) {
                    this.addNS(FreNamespace.create(node), visitedNamespaces, resultSoFar);
                    toBeRemoved.push(addon);
                }
            });
            if (toBeRemoved.length === 0) {
                // Nothing found, while still having remaining NS-es to resolve
                LOGGER.log(
                  `addAdditionalNamespaces: cannot resolve additional namespaces for ${this._myNode["name"]} => ${remainingNS.map((remain) => (remain instanceof FreNodeReference ? remain.name : remain["name"]))}`,
                )
                break;
            }
            remainingNS = remainingNS.filter(el => !toBeRemoved.includes(el));
        }
    }

    private addNS(ns: FreNamespace, visitedNamespaces: FreNamespace[], resultSoFar: Set<FreNamedNode>) {
        // console.log(`adding NS: ${ns._myNode["name"]}, visited: ${visitedNamespaces.includes(ns)}`);
        if (!isNullOrUndefined(ns) && !visitedNamespaces.includes(ns)) {
            // ns!.getDeclaredNodes(true).forEach(n => console.log(n.name))
            ns!.getDeclaredNodes(true).forEach(node => {
                resultSoFar.add(node);
            });
            // todo Design decision: add additional NS-es of 'ns' as well???
            visitedNamespaces.push(ns);
        }
    }

    /**
     * Try to resolve the first of the pathname of 'toBeResolved' in 'foundSoFar'.
     * If this succeeds, then resolve the rest of the path.
     *
     * @param toBeResolved
     * @param foundSoFar
     * @private
     */
    private findInResultSoFar(toBeResolved: FreNodeReference<FreNamedNode>, foundSoFar: Set<FreNamedNode>): FreNamedNode | undefined{
        // We have to take all names in the path into account.
        // Search the first name within the nodes that are found so far, and continue from there.
        let result: FreNamedNode = undefined;
        let pathname = toBeResolved.pathname;
        foundSoFar.forEach(node => {
            if (node.name === pathname[0]) {
                result = node;
            }
        })
        if (pathname.length > 1 && !isNullOrUndefined(result) && FreLanguage.getInstance().classifier(result.freLanguageConcept()).isNamespace) {
            let previousNamespace: FreNamespace = FreNamespace.create(result);
            // Note that we need to pass the pathname without its first element,
            // and that the base namespace is different from the previous namespace!
            result = resolvePathStartingInNamespace(this, previousNamespace, pathname.slice(1), this.mainScoper, toBeResolved.typeName);
        }
        return result;
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
