import { isRegExp, isString, Box, PiEditor } from "../editor";
import { Language } from "../storage/Language";
import { PiLogger } from "./internal";

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
export async function executeBehavior(box: Box, text: string, label: string, editor: PiEditor): Promise<BehaviorExecutionResult> {
    LOGGER.log("Enter executeBehavior");
    let partialMatch: boolean = false;

    for (const behavior of editor.behaviors) {
        const trigger = behavior.trigger;
        if (behavior.activeInBoxRoles.includes(box.role)) {
            if (isRegExp(trigger)) {
                const matchArray = text.match(trigger);
                LOGGER.log("executeBehavior: MATCH " + text + " against " + trigger +
                            "  results in " + (!!matchArray ? matchArray.length : "null"));
                if (matchArray !== null && text === matchArray[0]) {
                    const execresult = behavior.execute(box, text, editor);
                    // if( !!execresult){
                    //     editor.selectElement(execresult);
                    //     editor.selectFirstLeafChildBox();
                    // }
                    return BehaviorExecutionResult.EXECUTED;
                }
            } else if (isString(trigger)) {
                if (trigger === text) {
                    LOGGER.log("executeBehavior: MATCH FULL TEXT label [" + label + "] refShortcut [" + behavior.referenceShortcut + "]");
                    const execresult = behavior.execute(box, text, editor);
                    // If this is a referenceShortcut, fill in the selected reference, which is in the label
                    if (!!label && !!behavior.referenceShortcut) {
                        execresult[behavior.referenceShortcut.propertyname] = Language.getInstance().referenceCreator(label.substr(0, label.indexOf(" ")), behavior.referenceShortcut.metatype);
                    }
                    // if( !!execresult){
                    //     await editor.selectElement(execresult, LEFT_MOST);
                    //     editor.selectFirstLeafChildBox();
                    // }
                    return BehaviorExecutionResult.EXECUTED;
                } else if (trigger.startsWith(text)) {
                    LOGGER.log("executeBehavior: MATCH PARTIAL TEXT");
                    partialMatch = true;
                }
            }
        }
    }
    LOGGER.log("executeBehavior: no alias match");
    if (partialMatch) {
        return BehaviorExecutionResult.PARTIAL_MATCH;
    } else {
        return BehaviorExecutionResult.NO_MATCH;
    }
}
