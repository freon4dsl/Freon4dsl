import { PiBinaryExpression } from "./PiBinaryExpression";
import { PiElement } from "./PiElement";
import { PiExpression } from "./PiExpression";
import { PiModel } from "./PiModel";

export function isPiModel(element: PiElement): element is PiModel {
    return (!!element) && element.piIsModel && element.piIsModel();
}

export function isPiExpression(element: PiElement): element is PiExpression {
    return (!!element) && element.piIsExpression && element.piIsExpression();
}

export function isPiBinaryExpression(element: PiElement): element is PiBinaryExpression {
    return (!!element) && element.piIsExpression && element.piIsExpression() && element.piIsBinaryExpression && element.piIsBinaryExpression();
}
