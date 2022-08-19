import { PiCreateBinaryExpressionAction, PiCustomAction } from "./internal";

export interface PiCombinedActions {
    binaryExpressionActions: PiCreateBinaryExpressionAction[];

    customActions: PiCustomAction[];
}
