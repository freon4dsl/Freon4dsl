import { FreExpressionNode } from "./FreExpressionNode";

export interface FreBinaryExpression extends FreExpressionNode {
    freLeft(): FreExpressionNode;

    freSetLeft(left: FreExpressionNode): void;

    freRight(): FreExpressionNode;

    freSetRight(right: FreExpressionNode): void;

    frePriority(): number;
}
