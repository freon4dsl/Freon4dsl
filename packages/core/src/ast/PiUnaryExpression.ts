import { PiExpression } from "./PiExpression";

export interface PiUnaryExpression extends PiExpression {
    piExp(): PiExpression;

    piSetExp(exp: PiExpression): void;

    piPriority(): number;
}
