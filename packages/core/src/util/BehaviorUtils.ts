import { LEFT_MOST } from "../";
import { isRegExp, isString } from "../editor/PiAction";
import { PiLogger } from "./PiLogging";
import { Box } from "../editor/boxes/Box";
import { PiEditor } from "../editor/PiEditor";

const LOGGER = new PiLogger("BehaviorUtils"); //.mute();

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
export async function executeBehavior(box: Box, text: string, editor: PiEditor): Promise<BehaviorExecutionResult> {
    let partialMatch: boolean = false;
    // LOGGER.log("MATCH EXECUTE BEHAVIOR");

    for (const a of editor.behaviors) {
        const trigger = a.trigger;
        if (a.activeInBoxRoles.includes(box.role)) {
            if (isRegExp(trigger)) {
                const matchArray = text.match(trigger);
                LOGGER.log("MATCH " + text + " against " + trigger + "  results in " + (!!matchArray ? matchArray.length : "null"));
                if (matchArray !== null && text === matchArray[0]) {
                    a.execute(box, text, editor);
                    return BehaviorExecutionResult.EXECUTED;
                }
            } else if (isString(trigger)) {
                if (trigger === text) {
                    LOGGER.log("MATCH FULL TEXT");
                    a.execute(box, text, editor);
                    return BehaviorExecutionResult.EXECUTED;
                } else if (trigger.startsWith(text)) {
                    LOGGER.log("MATCH PARTIAL TEXT");
                    partialMatch = true;
                }
            }
        }
    }
    LOGGER.info(this, "no alias match");
    if (partialMatch) {
        return BehaviorExecutionResult.PARTIAL_MATCH;
    } else {
        return BehaviorExecutionResult.NO_MATCH;
    }
}
