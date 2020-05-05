import { PiElement, PiExpression } from "../language";

export interface PiContext {
    // rootElement: PiElement;

    getPlaceHolderExpression: () => PiExpression;
}
