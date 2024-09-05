import { FreLanguage, FreLanguageProperty } from "../language";
import { FreLogger } from "../logging";
import { AstWorker } from "./AstWorker";
import { FreNode } from "../ast";

const LOGGER = new FreLogger("AstWalker");

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
     * method of the other workers will be skipped.
     *
     * @param node the top node of the part of the tree to be visited
     * @param includeNode tests every child of 'modelelement', if true, it will also be visited
     */
    public walk(node: FreNode, includeNode?: (elem: FreNode) => boolean) {
        if (this.myWorkers.length > 0) {
            let stopWalkingThisNode: boolean = false;
            for (const worker of this.myWorkers) {
                if (!stopWalkingThisNode) {
                    stopWalkingThisNode = worker.execBefore(node);
                }
            }

            // find part properties in the language meta definition
            const partProperties: FreLanguageProperty[] = FreLanguage.getInstance().getPropertiesOfKind(
                node.freLanguageConcept(),
                "part",
            );
            // walk all parts
            for (const prop of partProperties) {
                for (const child of FreLanguage.getInstance().getPropertyValue(node, prop)) {
                    if (includeNode === undefined || includeNode(child)) {
                        this.walk(child, includeNode);
                    }
                }
            }

            for (const worker of this.myWorkers) {
                if (!stopWalkingThisNode) {
                    stopWalkingThisNode = worker.execAfter(node);
                }
            }
        } else {
            LOGGER.error("No worker found.");
        }
    }
}
