/**
 * Class Namespace is a wrapper for a model element that is a namespace (as defined in the scoper definition).
 * It provides the implementation of the algorithm used to search for all names that are visible in the namespace.
 */
import { PiElement, PiModelUnit, PiNamedElement } from "../ast";
import { AstWalker, modelUnit } from "../ast-utils";
import { Language } from "../language";
import { PiLogger } from "../util/index";
import { CollectNamesWorker } from "./CollectNamesWorker";

const LOGGER = new PiLogger("FreonNamespace").mute();

export class FreonNamespace {
    private static allNamespaces: Map<PiElement, FreonNamespace> = new Map();

    /**
     * This method ensures that every element in the model has one and only one associated namespace object.
     * The type of element 'elem' should be marked as namespace in the scoper definition.
     * @param elem
     */
    public static create(elem: PiElement): FreonNamespace {
        if (this.allNamespaces.has(elem)) {
            return this.allNamespaces.get(elem);
        } else {
            const result = new FreonNamespace(elem);
            this.allNamespaces.set(elem, result);
            return result;
        }
    }

    /**
     * This convenience method merges 'list' and 'result', where if an element is present in both,
     * the element in 'list' is discarded, thus shadowing names from 'list'.
     * @param list
     * @param result
     */
    public static joinResultsWithShadowing(list: PiNamedElement[], result: PiNamedElement[]) {
        list.forEach(elem => {
            // shadow name in outer namespace if it is already present
            if (!result.includes(elem)) {
                result.push(elem);
            }
        });
    }

    public _myElem: PiElement;

    private constructor(elem: PiElement) {
        this._myElem = elem;
    }

    /**
     * Returns all elements that are visible in this namespace, including those from additional namespaces
     * as defined in the scoper definition.
     */
    public getVisibleElements(origin: PiModelUnit, metatype?: string): PiNamedElement[] {
        let result: PiNamedElement[] = [];

        result = this.getInternalVisibleElements(origin, metatype);

        return result;
    }

    /**
     * Returns the elements that are visible in this namespace only, without regard for additional namespaces
     * @param metatype
     */
    private getInternalVisibleElements(origin: PiModelUnit, metatype?: string): PiNamedElement[] {
        const result: PiNamedElement[] = [];
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
        myWalker.walk(this._myElem, (elem: PiElement) => {
            const sameModelUnit = (modelUnit(elem) === origin);
            const visit = !Language.getInstance().classifier(elem.piLanguageConcept()).isNamespace &&
                (sameModelUnit || (!!elem.piOwner() && Language.getInstance().classifierProperty(elem.piOwner().piLanguageConcept(), elem.piOwnerDescriptor().propertyName).isPublic));
            LOGGER.log("Namespace::Visit " + elem.piLanguageConcept() + "(" + elem["name"] + ")" + " ==> " + visit + "   same modelunit? " + sameModelUnit + "  _elem " + this._myElem.piLanguageConcept());
            return visit;
        });
        return result;
    }
}
