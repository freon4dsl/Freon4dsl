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
    public getDeclaredNodes(): Set<FreNamedNode> {
        const result: FreNamedNode[] = [];
        // set up the 'worker' of the visitor pattern
        const myNamesCollector = new CollectDeclaredNodesWorker();
        myNamesCollector.namesList = result;

        // set up the 'walker' of the visitor pattern
        const myWalker = new AstWalker();
        myWalker.myWorkers.push(myNamesCollector);

        // collect the elements from the namespace, but not from any child namespace
        myWalker.walk(this._myElem, (elem: FreNode) => {
            return !FreLanguage.getInstance().classifier(elem.freLanguageConcept()).isNamespace;
        });
        return new Set<FreNamedNode>(result);
    }

    /**
     * Returns all elements that are visible in this namespace, including those from additional namespaces
     * as defined in the scoper definition. All namespaces that are in 'visitedNamespaces' are not included
     * in the result.
     *
     * @param mainScoper
     * @param visitedNamespaces
     */
    public getVisibleNodes(mainScoper: FreCompositeScoper, visitedNamespaces: FreNamespace[]): FreNamedNode[] {
        // First, add all the declared nodes.
        let resultSoFar: Set<FreNamedNode> = this.getDeclaredNodes();
        // console.log('NEAREST: namespace ' + this._myElem['name'] + ' is done.');
        visitedNamespaces.push(this);

        // Second, determine whether we need to include a replacement or the parent namespace
        const parentNamespace: FreNamespace = this.findParentNamespace(this);
        const replacementNodes = mainScoper.replacementNamespaces(this._myElem);
        if (!isNullOrUndefined(replacementNodes) && replacementNodes.length > 0) {
            this.addReplacementNamespaces(replacementNodes, visitedNamespaces, resultSoFar);
        } else {
            if (!isNullOrUndefined(parentNamespace) && !visitedNamespaces.includes(parentNamespace)) {
                parentNamespace.getVisibleNodes(mainScoper, visitedNamespaces).forEach(x => {
                    resultSoFar.add(x);
                });
                // no need to add 'parentNamespace' to 'visitedNamespaces', this is done by 'parentNamespace.getVisibleNodes'
            }
        }
        // Third, add nodes from additional namespaces
        const additionalNodes = mainScoper.additionalNamespaces(this._myElem);
        this.addAdditionalNamespaces(additionalNodes, visitedNamespaces, resultSoFar);
        // Fourth, return the result
        return Array.from(resultSoFar);
    }

    private addReplacementNamespaces(replacementNodes: (FreNamedNode | FreNodeReference<FreNamedNode>)[], visitedNamespaces: FreNamespace[], resultSoFar: Set<FreNamedNode>) {
        // console.log('doing replacement nodes', replacementNodes.map(n => n?.name).join(', '));
        // if any of the replacement namespaces is a reference, this reference should be resolved within the parent namespace!!!
        replacementNodes.forEach((replacementNode) => {
            let replacementNamespace: FreNamespace = undefined;
            if (replacementNode instanceof FreNodeReference) {
                // NB using '.referred' only works when the owner of the reference does not reside in 'this'.
                // This should be checked in meta!
                // todo decide whether to create a check here
                const node = replacementNode.referred;
                if (!isNullOrUndefined(node)) {
                    replacementNamespace = FreNamespace.create(node);
                    // console.log('found replacement: ' + replacementNode.pathname);
                }
            } else {
                replacementNamespace = FreNamespace.create(replacementNode);
            }
            // console.log('replacement: ' + replacementNamespace?._myElem['name']);
            this.addNS(replacementNamespace, visitedNamespaces, resultSoFar);
        });
    }

    private addAdditionalNamespaces(additionalNS: (FreNamedNode | FreNodeReference<FreNamedNode>)[], visitedNamespaces: FreNamespace[], resultSoFar: Set<FreNamedNode>) {
        // First add all additions that are not defined by FreNodeReferences
        additionalNS.forEach(namespaceNode => {
            if (!(namespaceNode instanceof FreNodeReference)) {
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
            // console.log('remaining: ', remainingNS.map(ns => ns.pathname).join(', '));
            const toBeRemoved: (FreNode | FreNodeReference<FreNamedNode>)[] = [];
            remainingNS.forEach(addon => {
                const node: FreNamedNode = this.findInResultSoFar(addon, resultSoFar);
                if (!isNullOrUndefined(node)) {
                    // console.log('found ' + addon.pathname);
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
        if (!isNullOrUndefined(ns) && !visitedNamespaces.includes(ns)) {
            // console.log('\tADDING namespace: ' + ns._myElem['name']);
            ns!.getDeclaredNodes().forEach(node => {
                resultSoFar.add(node);
            });
            // todo add additional NS-es ???
            visitedNamespaces.push(ns);
        }
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

    private findParentNamespace(child: FreNamespace): FreNamespace | undefined {
        let owner: FreNode = child._myElem.freOwner();
        while (!isNullOrUndefined(owner) ) {
            if (FreLanguage.getInstance().classifier(owner.freLanguageConcept()).isNamespace) {
                console.log('returning namespace ', owner.freLanguageConcept());
                return FreNamespace.create(owner);
            } else {
                owner = owner.freOwner();
            }
        }
        return undefined;
    }

}
