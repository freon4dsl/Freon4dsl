/**
 * Interface AstWorker defines the extended visitor pattern of instances of languages.
 * Every node is visited twice, once before the visit of its children, and once after this visit.
 */
import { PiElement } from "../model";

export interface AstWorker {
    /**
     * Method called by AstWalker before any children are visited.
     * @param modelelement The element being visited
     * @return When returns true, no other workers will be called for this modelElement.
     */
    execBefore(modelelement: PiElement): boolean;

    /**
     * Method called by AstWalker after all children are visited.
     * @param modelelement The element being visited
     * @return When returns true, no other workers will be called for this modelElement.
     */
    execAfter(modelelement: PiElement): boolean;

}
