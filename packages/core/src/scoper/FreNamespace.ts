/**
 * Class Namespace is a wrapper for a model element that is a namespace (as defined in the scoper definition).
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

    /**
     * This method ensures that every element in the model has one and only one associated namespace object.
     * The type of element 'node' should be marked as namespace in the scoper definition.
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

    public _myElem: FreNode;

    private constructor(elem: FreNode) {
        if (!elem) {
            console.log('FreNamespace constructed without node!');
        }
        this._myElem = elem;
    }

    /**
     * Returns all elements that are declared in this namespace. Private/public is not taken into account yet.
     */
    public getDeclaredNodes(publicOnly: boolean): Set<FreNamedNode> {
        // console.log('getDeclaredNodes for ', this._myElem.['name'], ' publicOnly', publicOnly);
        // When public/private is taken into account, this method could get a parameter on which to decide
        // to only return public nodes. This parameter could be set in the places marked by 'PUBLIC' in this class.
        let result: FreNamedNode[] = [];
        // set up the 'worker' of the visitor pattern
        const myNamesCollector = new CollectDeclaredNodesWorker();
        myNamesCollector.namesList = result;

        // set up the 'walker' of the visitor pattern
        const myWalker = new AstWalker();
        myWalker.myWorkers.push(myNamesCollector);

        // collect the elements from the namespace, but not from any child namespace
        myWalker.walk(this._myElem, (elem: FreNode) => {
            // To not go into nested private nodes, we also check whether the property is public.
            return !FreLanguage.getInstance().classifier(elem.freLanguageConcept()).isNamespace &&
              (!publicOnly ||
                (!!elem.freOwner() &&
                  FreLanguage.getInstance().classifierProperty(
                    elem.freOwner().freLanguageConcept(),
                    elem.freOwnerDescriptor().propertyName,
                  ).isPublic))
        });

        if (publicOnly) {
            result = result.filter((elem) => {
                return (!!elem.freOwner() &&
                  FreLanguage.getInstance().classifierProperty(
                    elem.freOwner().freLanguageConcept(),
                    elem.freOwnerDescriptor().propertyName
                  ).isPublic);
            })
        }

        return new Set<FreNamedNode>(result);
    }

    /**
     * Returns all elements that are visible in this namespace, including those from additional namespaces
     * as defined in the scoper definition. All namespaces that are in 'visitedNamespaces' are not included
     * in the result.
     *
     * @param mainScoper
     * @param visitedNamespaces
     * @param publicOnly
     */
    public getVisibleNodes(mainScoper: FreCompositeScoper, visitedNamespaces: FreNamespace[], publicOnly: boolean): FreNamedNode[] {
        // console.log(`getVisibleNodes ${this._myElem.['name']}`)
        // First, add all the declared nodes.
        let resultSoFar: Set<FreNamedNode> = this.getDeclaredNodes(publicOnly);
        visitedNamespaces.push(this);

        // Second, determine whether we need to include a replacement or the parent namespace
        const parentNamespace: FreNamespace = this.findParentNamespace(this);
        const replacementNodes = mainScoper.replacementNamespaces(this._myElem);
        if (!isNullOrUndefined(replacementNodes) && replacementNodes.length > 0) {
            this.addReplacementNamespaces(replacementNodes, visitedNamespaces, resultSoFar);
        } else {
            if (!isNullOrUndefined(parentNamespace) && !visitedNamespaces.includes(parentNamespace)) {
                parentNamespace.getVisibleNodes(mainScoper, visitedNamespaces, publicOnly).forEach(x => {
                    resultSoFar.add(x);
                });
                // no need to add 'parentNamespace' to 'visitedNamespaces', this is done by 'parentNamespace.getVisibleNodes'
            }
        }
        // Third, add nodes from additional namespaces
        const additionalNodes = mainScoper.additionalNamespaces(this._myElem);
        this.addAdditionalNamespaces(additionalNodes, visitedNamespaces, resultSoFar, mainScoper);
        // Fourth, return the result
        return Array.from(resultSoFar);
    }

    private addReplacementNamespaces(replacementNodes: (FreNode | FreNodeReference<FreNamedNode>)[], visitedNamespaces: FreNamespace[], resultSoFar: Set<FreNamedNode>) {
        // console.log('replacement namespaces: ', replacementNodes.map(n => n['name']));
        replacementNodes.forEach((replacementNode) => {
            let replacementNamespace: FreNamespace = undefined;
            if (replacementNode instanceof FreNodeReference) {
                // NB using '.referred' only works when the owner of the reference does not reside in 'this'.
                // This should also be checked in meta!
                const toBeChecked: FreNamespace = findEnclosingNamespace(replacementNode.freOwner());
                if (toBeChecked === this) {
                    LOGGER.error(`Cannot add as namespace one that is defined via a reference '${replacementNode.pathname}' that resides in the same namespace '${this._myElem['name']}'`);
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

    private addAdditionalNamespaces(additionalNS: (FreNode | FreNodeReference<FreNamedNode>)[], visitedNamespaces: FreNamespace[], resultSoFar: Set<FreNamedNode>, mainScoper: FreCompositeScoper) {
        // First add all additions that are not defined by FreNodeReferences
        additionalNS.forEach(namespaceNode => {
            if (!(namespaceNode instanceof FreNodeReference) && !isNullOrUndefined(namespaceNode)) {
                this.addNS(FreNamespace.create(namespaceNode), visitedNamespaces, resultSoFar);
            }
        });
        // Second, add additions that are not defined by FreNodeReferences
        // This done after the 'normal' ones because the references may depend on the visible elements of the other namespaces.
        // We loop over the references that are not resolved yet, until every one is done.
        let remainingNS: FreNodeReference<FreNamedNode>[] = [];
        additionalNS.forEach(namespaceNode => {
            if (namespaceNode instanceof FreNodeReference) remainingNS.push(namespaceNode);
        });
        while (remainingNS.length > 0) {
            const toBeRemoved: (FreNode | FreNodeReference<FreNamedNode>)[] = [];
            remainingNS.forEach(addon => {
                const node: FreNamedNode = this.findInResultSoFar(addon, resultSoFar, mainScoper);
                if (!isNullOrUndefined(node)) {
                    this.addNS(FreNamespace.create(node), visitedNamespaces, resultSoFar);
                    toBeRemoved.push(addon);
                }
            });
            if (toBeRemoved.length === 0) {
                // nothing found , done while still having remaining NS's to resolve
                LOGGER.log(
                  `addAdditionalNamespaces: cannot resolve additional namespaces for ${this._myElem["name"]} => ${remainingNS.map((remain) => (remain instanceof FreNodeReference ? remain.name : remain["name"]))}`,
                )
                break;
            }
            remainingNS = remainingNS.filter(el => !toBeRemoved.includes(el));
        }
    }

    private addNS(ns: FreNamespace, visitedNamespaces: FreNamespace[], resultSoFar: Set<FreNamedNode>) {
        // console.log(`adding NS: ${ns._myElem["name"]}, visited: ${visitedNamespaces.includes(ns)}`);
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
     * Try to resolve 'addon' in 'innerResult'
     *
     * @param toBeResolved
     * @param foundSoFar
     * @param mainScoper
     * @private
     */
    private findInResultSoFar(toBeResolved: FreNodeReference<FreNamedNode>, foundSoFar: Set<FreNamedNode>, mainScoper: FreCompositeScoper): FreNamedNode | undefined{
        // We have to take all names in the path into account.
        // Search the first name within the nodes that are found so far.
        let result: FreNamedNode = undefined;
        let pathname = toBeResolved.pathname;
        foundSoFar.forEach(node => {
            if (node.name === pathname[0]) {
                result = node;
            }
        })
        // todo write a test that covers this if-statement
        if (pathname.length > 1 && !isNullOrUndefined(result) && FreLanguage.getInstance().classifier(result.freLanguageConcept()).isNamespace) {
            let previousNamespace: FreNamespace = FreNamespace.create(result);
            // Note that we need to pass the pathname without its first element.
            result = resolvePathStartingInNamespace(this, previousNamespace, pathname.slice(1), mainScoper, toBeResolved.typeName);
        }
        return result;
    }

    private findParentNamespace(child: FreNamespace): FreNamespace | undefined {
        let owner: FreNode = child._myElem.freOwner();
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
