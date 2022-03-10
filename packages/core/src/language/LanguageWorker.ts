/**
 * Interface LanguageWorker defines the extended visitor pattern of instances of languages.
 * Every node is visited twice, once before the visit of its children, and once after this visit.
 */
import { PiElement } from "./PiElement";

export interface LanguageWorker {
    execBefore(modelelement: PiElement): boolean;
    execAfter(modelelement: PiElement): boolean;

}
