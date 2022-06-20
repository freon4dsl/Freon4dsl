import { runInAction } from "mobx";
import { isRegExp, isString, Box, PiEditor, PiPostAction, PiAction } from "../editor";
import { PiLogger } from "../logging";

const LOGGER = new PiLogger("BehaviorUtils");

export enum PiCaretPosition {
    UNSPECIFIED,
    LEFT_MOST,
    RIGHT_MOST,
    INDEX
}

export class PiCaret {
    static RIGHT_MOST = new PiCaret(PiCaretPosition.RIGHT_MOST, 0);
    static LEFT_MOST = new PiCaret(PiCaretPosition.LEFT_MOST, 0);
    static UNSPECIFIED = new PiCaret(PiCaretPosition.UNSPECIFIED, 0);

    static IndexPosition(i: number): PiCaret {
        return new PiCaret(PiCaretPosition.INDEX, i);
    }

    position: PiCaretPosition;
    index: number;

    constructor(p: PiCaretPosition, i: number) {
        this.position = p;
        this.index = i;
    }
}

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

    for (const action of editor.new_pi_actions) {
        const trigger = action.trigger;
        LOGGER.log("  executeBehavior trigger " + trigger + "  roles " + action.activeInBoxRoles);
        if (action.activeInBoxRoles.includes(box.role)) {
            if (isRegExp(trigger)) {
                const matchArray = label.match(trigger);
                LOGGER.log("executeBehavior: MATCH " + label + " against " + trigger +
                    "  results in " + (!!matchArray ? matchArray.length : "null"));
                let execresult: PiPostAction;
                if (matchArray !== null && label === matchArray[0]) {
                    runInAction( () => {
                        const command = action.command(box);
                        execresult = command.execute(box, label, editor);
                    });
                    if(!!execresult) {
                        execresult();
                    }
                    return BehaviorExecutionResult.EXECUTED;
                }
            } else if (isString(trigger)) {
                if (trigger === text) {
                    LOGGER.log("executeBehavior: MATCH FULL TEXT label [" + label + "] refShortcut [" + action.referenceShortcut + "]");
                    let postAction: PiPostAction;
                    runInAction( () => {
                        const command = action.command(box);
                        postAction = command.execute(box, label, editor);
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
    console.log("Enter @@@@@@@@@ executeSingleBehavior text [" + text + "] label [" + label + "] refshortcut [" + action.referenceShortcut + "]");
    let partialMatch: boolean = false;
    let execresult: PiPostAction;

    const trigger = action.trigger;
    runInAction( () => {
        console.log("========================== START");
        const command = action.command(box);
        execresult = command.execute(box, label, editor);
        console.log("===============================")
    });
    if( !!execresult){
        execresult();

        // if (!!action.boxRoleToSelect) {
        //     editor.selectBoxByRoleAndElementId(execresult.piId(),action.boxRoleToSelect,action.caretPosition);
        // }else {
        //     editor.selectFirstLeafChildBox();
        //     if (editor.selectedBox.role.includes(LEFT_MOST)){
        //         // Special expression prefix box, don't select it
        //         editor.selectNextLeaf()
        //     }
        // }
    }
    // if( !!execresult){
    //     await editor.selectElement(execresult, LEFT_MOST);
    //     editor.selectFirstLeafChildBox();
    // }
    return BehaviorExecutionResult.EXECUTED;
}
