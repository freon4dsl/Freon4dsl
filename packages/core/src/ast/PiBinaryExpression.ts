import { PiElement } from "./PiElement";
import { PiExpression } from "./PiExpression";

export interface PiBinaryExpression extends PiExpression {
    piLeft(): PiExpression;

    piSetLeft(left: PiExpression): void;

    piRight(): PiExpression;

    piSetRight(right: PiExpression): void;

    piPriority(): number;
}

export function isBinaryExpression(node: PiElement): node is PiBinaryExpression {
    return node.piIsBinaryExpression();
}
