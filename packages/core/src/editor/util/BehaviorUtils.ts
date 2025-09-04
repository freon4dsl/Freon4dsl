import { AST } from "../../change-manager/index.js";
import { type Box, type FreEditor, type FreAction , type FrePostAction } from "../index.js";
import { FreLogger } from "../../logging/index.js";

const LOGGER: FreLogger = new FreLogger("BehaviorUtils");

export enum BehaviorExecutionResult {
    NULL,
    EXECUTED,
    PARTIAL_MATCH,
    NO_MATCH,
}

/**
 * We know the action to be executed, so just do it.
 * @param action
 * @param box
 * @param text
 * @param label
 * @param editor
 */
export function executeSingleBehavior(
    action: FreAction,
    box: Box,
    label: string,
    editor: FreEditor,
): BehaviorExecutionResult {
    LOGGER.log(`Enter executeSingleBehavior label [${label}] refshortcut [${action.referenceShortcut}]`);
    let execresult: FrePostAction;

    const index = -1; // todo get the correct index
    AST.change(() => {
        execresult = action.execute(box, label, editor, index);
    });
    if (!!execresult) {
        execresult();
    }
    return BehaviorExecutionResult.EXECUTED;
}
