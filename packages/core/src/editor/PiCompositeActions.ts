import { PiCreateBinaryExpressionAction, PiCustomAction } from "./internal";

export interface PiCompositeActions {
    binaryExpressionActions: PiCreateBinaryExpressionAction[];
    customActions: PiCustomAction[];
}
