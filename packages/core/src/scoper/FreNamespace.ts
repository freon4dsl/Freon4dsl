/**
 * Class Namespace is a wrapper for a model element that is a namespace (as defined in the scoper definition).
 * It provides the implementation of the algorithm used to search for all names that are visible in the namespace.
 */
import { FreNode, FreModelUnit, FreNamedNode } from "../ast";
import { AstWalker, modelUnit } from "../ast-utils";
import { FreLanguage } from "../language";
import { FreLogger } from "../logging";
import { CollectNamesWorker } from "./CollectNamesWorker";

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

    /**
     * This convenience method merges 'list' and 'result', where if an element is present in both,
     * the element in 'list' is discarded, thus shadowing names from 'list'.
     * @param list
     * @param result
     */
    public static joinResultsWithShadowing(list: FreNamedNode[], result: FreNamedNode[]) {
        list.forEach((elem) => {
            // shadow name in outer namespace if it is already present
            if (!result.includes(elem)) {
                result.push(elem);
            }
        });
    }

    public _myElem: FreNode;

    private constructor(elem: FreNode) {
        this._myElem = elem;
    }

    /**
     * Returns all elements that are visible in this namespace, including those from additional namespaces
     * as defined in the scoper definition.
     */
    public getVisibleElements(origin: FreModelUnit, metatype?: string): FreNamedNode[] {
        let result: FreNamedNode[];

        result = this.getInternalVisibleElements(origin, metatype);

        return result;
    }

    /**
     * Returns the elements that are visible in this namespace only, without regard for additional namespaces
     * @param origin
     * @param metatype
     * @private
     */
    private getInternalVisibleElements(origin: FreModelUnit, metatype?: string): FreNamedNode[] {
        const result: FreNamedNode[] = [];
        // TODO check this: for now we push all parts, later public/private annotations can be taken into account
        // set up the 'worker' of the visitor pattern
        // const myNamesCollector = new ExampleNamesCollector();
        const myNamesCollector = new CollectNamesWorker(origin);
        myNamesCollector.namesList = result;
        if (!!metatype) {
            myNamesCollector.metatype = metatype;
        }

        // set up the 'walker of the visitor pattern
        // const myWalker = new ExampleWalker();
        const myWalker = new AstWalker();
        myWalker.myWorkers.push(myNamesCollector);

        // collect the elements from the namespace, but not from any child namespace
        myWalker.walk(this._myElem, (elem: FreNode) => {
            const sameModelUnit = modelUnit(elem) === origin;
            const visit =
                !FreLanguage.getInstance().classifier(elem.freLanguageConcept()).isNamespace &&
                (sameModelUnit ||
                    (!!elem.freOwner() &&
                        FreLanguage.getInstance().classifierProperty(
                            elem.freOwner().freLanguageConcept(),
                            elem.freOwnerDescriptor().propertyName,
                        ).isPublic));
            LOGGER.log(
                "Namespace::Visit " +
                    elem.freLanguageConcept() +
                    "(" +
                    elem["name"] +
                    ")" +
                    " ==> " +
                    visit +
                    "   same modelunit? " +
                    sameModelUnit +
                    "  _elem " +
                    this._myElem.freLanguageConcept(),
            );
            return visit;
        });
        return result;
    }
}
