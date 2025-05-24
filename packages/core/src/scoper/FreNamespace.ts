/**
 * Class Namespace is a wrapper for a model element that is a namespace (as defined in the scoper definition).
 * It provides the implementation of the algorithm used to search for all names that are visible in the namespace.
 */
import { FreNode, FreNamedNode } from "../ast/index.js";
import { AstWalker } from "../ast-utils/index.js";
import { FreLanguage } from "../language/index.js";
import { CollectDeclaredNodesWorker } from "./CollectDeclaredNodesWorker.js";
// import { FreLogger } from "../logging/index.js";

// const LOGGER = new FreLogger("FreonNamespace").mute();

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

    // /**
    //  * Returns all elements that are visible in this namespace, including those from additional namespaces
    //  * as defined in the scoper definition.
    //  */
    // public getVisibleNodes(mainscoper: FreCompositeScoper): Set<FreNamedNode> {
    //     let result: Set<FreNamedNode> = this.getDeclaredNodes();
    //     const replacement = mainscoper.replacementNamespace(this._myElem);
    //     if (!isNullOrUndefined(replacement)) {
    //         replacement.getDeclaredNodes().forEach(node => {
    //             result.add(node);
    //         })
    //     } else {
    //         const parentNamespace: FreNamespace = this.findParentNamespace(this);
    //         if (parentNamespace) {
    //             parentNamespace.getVisibleNodes(mainscoper).forEach(x => {
    //                 // console.log('adding ', x.name);
    //                 result.add(x);
    //             });
    //         }
    //     }
    //     mainscoper.additionalNamespaces(this._myElem).forEach(ns => {
    //         ns.getDeclaredNodes().forEach(node => {
    //             result.add(node);
    //         })
    //     })
    //     return result;
    // }
    //
    // private findParentNamespace(child: FreNamespace): FreNamespace | undefined {
    //     let owner: FreNode = child._myElem.freOwner();
    //     while (!isNullOrUndefined(owner) ) {
    //         if (FreLanguage.getInstance().classifier(owner.freLanguageConcept()).isNamespace) {
    //             console.log('returning namespace ', owner.freLanguageConcept());
    //             return FreNamespace.create(owner);
    //         } else {
    //             owner = owner.freOwner();
    //         }
    //     }
    //     return undefined;
    // }
}
