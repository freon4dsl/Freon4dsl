import { runInAction } from "mobx";
import { isRegExp, isString, Box, FreEditor, FrePostAction, FreAction } from "../index";
import { FreLogger } from "../../logging";

const LOGGER = new FreLogger("BehaviorUtils");

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
                    LOGGER.log(
                        "executeBehavior: MATCH FULL TEXT label [" +
                            label +
                            "] refShortcut [" +
                            action.referenceShortcut +
                            "]",
                    );
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
    LOGGER.log("executeBehavior: no action match, ;partial is " + partialMatch);
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
    text: string,
    label: string,
    editor: FreEditor,
): BehaviorExecutionResult {
    LOGGER.log(
        "Enter executeSingleBehavior text [" +
            text +
            "] label [" +
            label +
            "] refshortcut [" +
            action.referenceShortcut +
            "]",
    );
    let execresult: FrePostAction;

    const index = -1; // todo get the correct index
    runInAction(() => {
        const command = action.command();
        execresult = command.execute(box, label, editor, index);
    });
    if (!!execresult) {
        execresult();

        // TODO The following ensured that the cursor gwets the correct focus after the change.  probably still needed.
        // if (!!action.boxRoleToSelect) {
        //     editor.selectBoxByRoleAndElementId(execresult.freId(),action.boxRoleToSelect,action.caretPosition);
        // }else {
        //     editor.selectFirstLeafChildBox();
        //     if (editor.selectedBox.role.includes(LEFT_MOST)){
        //         // Special expression prefix box, don't select it
        //         editor.selectNextLeaf()
        //     }
        // }
    }
    // TODO Probably needed to focus on the correct element.
    // if( !!execresult){
    //     await editor.selectElement(execresult, LEFT_MOST);
    //     editor.selectFirstLeafChildBox();
    // }
    return BehaviorExecutionResult.EXECUTED;
}
