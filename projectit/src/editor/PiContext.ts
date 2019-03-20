import { PiElement, PiExpression } from "../language";

// Langdev: Context
export interface PiContext {
    rootElement: PiElement;

    getPlaceHolderExpression: () => PiExpression;

}
