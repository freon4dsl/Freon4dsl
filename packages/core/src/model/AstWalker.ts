import { Language, Property } from "../storage/index";
import { PiLogger } from "../util/index";
import { AstWorker } from "./AstWorker";
import { PiElement } from "../model";

const LOGGER = new PiLogger("AstWalker");

/**
 * Class AstWalker implements the extended visitor pattern of instances of a Language.
 * This class implements the traversal of the model tree, classes that implement AstWorker
 * are responsible for the actual work being done on the nodes of the tree.
 * Every node is visited twice, once before the visit of its children, and once after this visit.
 *
 * With the use of the parameter 'includeChildren', which takes a function,
 * a very fine-grained control can be taken over which nodes are and are not visited.
 */
export class AstWalker {
    myWorkers: AstWorker[] = []; // the instances that do the actual work on each node of the tree

    /**
     * This method is the entry point of the traversal through the model tree. Each of the workers will be called in
     * the order in which they are present in the array 'myWorkers'. If, for a tree node, a worker returns 'true',
     * none of the rest of the workers will be called. For that particular node both the 'execBefore' and 'execAfter'
     * method of any of the other workers will be skipped.
     *
     * @param modelelement the top node of the part of the tree to be visited
     * @param includeChildren if true, the children of 'modelelement' will also be visited
     */
    public walk(modelelement: PiElement, includeChildren?: (elem: PiElement) => boolean) {
        if (this.myWorkers.length > 0) {
            let stopWalkingThisNode: boolean = false;
            for (const worker of this.myWorkers) {
                if (!stopWalkingThisNode) {
                    stopWalkingThisNode = worker.execBefore(modelelement);
                }
            }

            // find part properties in the language meta definition
            const partProperties: Property[] = Language.getInstance().getPropertiesOfKind(modelelement.piLanguageConcept(), "part");
            // walk all parts
            for(const prop of partProperties){
                for(const child of Language.getInstance().getPropertyValue(modelelement, prop)){
                    if( includeChildren(child)) {
                        this.walk(child, includeChildren);
                    }
                }
            }

            for (let worker of this.myWorkers) {
                if (!stopWalkingThisNode) {
                    stopWalkingThisNode = worker.execAfter(modelelement);
                }
            }
        } else {
            LOGGER.error(this, "No worker found.");
        }
    }
}
