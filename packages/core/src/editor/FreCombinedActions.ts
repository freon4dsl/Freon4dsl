import { FreCreateBinaryExpressionAction, FreCustomAction } from "./actions";

export interface FreCombinedActions {
    binaryExpressionActions: FreCreateBinaryExpressionAction[];

    customActions: FreCustomAction[];
}
