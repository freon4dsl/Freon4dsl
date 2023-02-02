import { FreCreateBinaryExpressionAction, FreCustomAction } from "./internal";

export interface FreCombinedActions {
    binaryExpressionActions: FreCreateBinaryExpressionAction[];

    customActions: FreCustomAction[];
}
