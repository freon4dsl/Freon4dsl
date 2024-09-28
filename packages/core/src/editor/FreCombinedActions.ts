import { FreCreateBinaryExpressionAction, FreCustomAction } from "./actions/index.js";

export interface FreCombinedActions {
    binaryExpressionActions: FreCreateBinaryExpressionAction[];

    customActions: FreCustomAction[];
}
