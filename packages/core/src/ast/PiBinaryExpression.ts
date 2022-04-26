import { PiExpression } from "./PiExpression";

export interface PiBinaryExpression extends PiExpression {
    piLeft(): PiExpression;

    piSetLeft(left: PiExpression): void;

    piRight(): PiExpression;

    piSetRight(right: PiExpression): void;

    piPriority(): number;
}
