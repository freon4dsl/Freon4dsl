import { runInAction } from "mobx";
import { AST } from "../../change-manager/index.js";
import { isRegExp, isString, Box, FreEditor, FrePostAction, FreAction } from "../index.js";
import { FreLogger } from "../../logging/index.js";

const LOGGER: FreLogger = new FreLogger("BehaviorUtils");

export enum BehaviorExecutionResult {
    NULL,
    EXECUTED,
    PARTIAL_MATCH,
    NO_MATCH,
}

/**
 * Try to execute the action `text`, and return true if this succeeds
 * Matching on full text only.
 * @param box
 * @param text
 * @param label
 * @param editor
 */
export function executeBehavior(box: Box, text: string, label: string, editor: FreEditor): BehaviorExecutionResult {
    LOGGER.log("Enter executeBehavior text [" + text + "] label [" + label + "] box role [" + box.role + "]");
    let partialMatch: boolean = false;
    const index = -1; // todo get the correct index

    // search for a matching action in the global actions table.
    for (const action of editor.newFreActions) {
        const trigger = action.trigger;
        LOGGER.log("  executeBehavior trigger " + trigger + "  roles " + action.activeInBoxRoles);
        if (action.activeInBoxRoles.includes(box.role)) {
            if (isRegExp(trigger)) {
                const matchArray = label.match(trigger);
                LOGGER.log(
                    "executeBehavior: MATCH " +
                        label +
                        " against " +
                        trigger +
                        "  results in " +
                        (!!matchArray ? matchArray.length : "null"),
                );
                let execresult: FrePostAction = null;
                if (matchArray !== null && label === matchArray[0]) {
                    runInAction(() => {
                        const command = action.command();
                        execresult = command.execute(box, label, editor, index);
                    });
                    if (!!execresult) {
                        execresult();
                    }
                    return BehaviorExecutionResult.EXECUTED;
                }
            } else if (isString(trigger)) {
                if (trigger === text) {
                    LOGGER.log(`  executeBehavior: MATCH DFULL TEXT label [${label}] refshortcut [${action.referenceShortcut}]`);
                    let postAction: FrePostAction;
                    runInAction(() => {
                        const command = action.command();
                        postAction = command.execute(box, label, editor, index);
                    });
                    postAction();
                    return BehaviorExecutionResult.EXECUTED;
                } else if (trigger.startsWith(label)) {
                    LOGGER.log("executeBehavior: MATCH PARTIAL TEXT");
                    partialMatch = true;
                }
            }
        }
    }
    LOGGER.log("  executeBehavior: no action match, partial is " + partialMatch);
    if (partialMatch) {
        return BehaviorExecutionResult.PARTIAL_MATCH;
    } else {
        return BehaviorExecutionResult.NO_MATCH;
    }
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
        const command = action.command();
        execresult = command.execute(box, label, editor, index);
    });
    if (!!execresult) {
        execresult();
    }
    return BehaviorExecutionResult.EXECUTED;
}
