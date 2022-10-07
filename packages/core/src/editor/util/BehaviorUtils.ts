import { runInAction } from "mobx";
import { isRegExp, isString, Box, PiEditor, PiPostAction, PiAction } from "../index";
import { PiLogger } from "../../logging";

const LOGGER = new PiLogger("BehaviorUtils");

export enum BehaviorExecutionResult {
    NULL,
    EXECUTED,
    PARTIAL_MATCH,
    NO_MATCH
}

/**
 * Try to execute the alias `text`, and return true if this succeeds
 * Matching on full text only.
 * @param {Box} box
 * @param {string} text
 * @param {PiEditor} editor
 * @returns {boolean}
 */
export function executeBehavior(box: Box, text: string, label: string, editor: PiEditor): BehaviorExecutionResult {
    LOGGER.log("Enter executeBehavior text [" + text + "] label [" + label + "] box role [" + box.role + "]");
    let partialMatch: boolean = false;
    let index = -1; // todo get the correct index

    for (const action of editor.newPiActions) {
        const trigger = action.trigger;
        LOGGER.log("  executeBehavior trigger " + trigger + "  roles " + action.activeInBoxRoles);
        if (action.activeInBoxRoles.includes(box.role)) {
            if (isRegExp(trigger)) {
                const matchArray = label.match(trigger);
                LOGGER.log("executeBehavior: MATCH " + label + " against " + trigger +
                    "  results in " + (!!matchArray ? matchArray.length : "null"));
                let execresult: PiPostAction;
                if (matchArray !== null && label === matchArray[0]) {
                    runInAction(() => {
                        const command = action.command(box);
                        execresult = command.execute(box, label, editor, index);
                    });
                    if (!!execresult) {
                        execresult();
                    }
                    return BehaviorExecutionResult.EXECUTED;
                }
            } else if (isString(trigger)) {
                if (trigger === text) {
                    LOGGER.log("executeBehavior: MATCH FULL TEXT label [" + label + "] refShortcut [" + action.referenceShortcut + "]");
                    let postAction: PiPostAction;
                    runInAction(() => {
                        const command = action.command(box);
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
    LOGGER.log("executeBehavior: no alias match, ;partial is " + partialMatch);
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
export function executeSingleBehavior(action: PiAction, box: Box, text: string, label: string, editor: PiEditor): BehaviorExecutionResult {
    LOGGER.log("Enter executeSingleBehavior text [" + text + "] label [" + label + "] refshortcut [" + action.referenceShortcut + "]");
    let execresult: PiPostAction;

    let index = -1; // todo get the correct index
    runInAction(() => {
        const command = action.command(box);
        execresult = command.execute(box, label, editor, index);
    });
    if (!!execresult) {
        execresult();
    }
    return BehaviorExecutionResult.EXECUTED;
}
