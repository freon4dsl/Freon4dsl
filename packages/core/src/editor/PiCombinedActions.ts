import { PiCreateBinaryExpressionAction, PiCustomAction } from "./internal";
import { PiKey } from "../util";

export interface PiCombinedActions {
    binaryExpressionActions: PiCreateBinaryExpressionAction[];

    customActions: PiCustomAction[];
}
