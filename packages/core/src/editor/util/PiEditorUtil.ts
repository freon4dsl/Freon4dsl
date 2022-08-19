import { runInAction } from "mobx";
import { PiLogger } from "../../logging";
import { Box, PI_NULL_COMMAND, PiCommand, PiEditor } from "../index";
import { PiOwnerDescriptor, PiElement, PiExpression } from "../../ast";
import { isPiExpression } from "../../ast-utils";
import { isProKey, PiTriggerUse } from "../actions/PiTriggers";
import { PiUtils } from "../../util";

export type BooleanCallback = () => boolean;
export type DynamicBoolean = BooleanCallback | boolean;

export const wait = async (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
export const NBSP: string = "".concat("\u00A0");

const LATEST_ID = 0;

const LOGGER = new PiLogger("PiEditorUtils").mute();

export class PiEditorUtil {

    static setContainer(exp: PiElement, piOwnerDescriptor: PiOwnerDescriptor | null, editor: PiEditor): void {
        runInAction(() => {
            if (!!piOwnerDescriptor) {
                if (piOwnerDescriptor.propertyIndex === undefined) {
                    piOwnerDescriptor.owner[piOwnerDescriptor.propertyName] = exp;
                } else {
                    piOwnerDescriptor.owner[piOwnerDescriptor.propertyName][piOwnerDescriptor.propertyIndex] = exp;
                }
            } else {
                editor.rootElement = exp;
            }
        });
    }

    static replaceExpression(oldExpression: PiExpression, newExpression: PiExpression, editor: PiEditor) {
        PiUtils.CHECK(isPiExpression(oldExpression), "replaceExpression: old element should be a PiExpression, but it isn't");
        PiUtils.CHECK(isPiExpression(newExpression), "replaceExpression: new element should be a PiExpression, but it isn't");
        runInAction(() => {
            PiEditorUtil.setContainer(newExpression, oldExpression.piOwnerDescriptor(), editor);
        });
    }

    // TODO refactor this into an InternalBehavior class, like other behaviors.
    /**
     * Check whether `piKey` is a defined keyboard-shortcut for `box`.
     * If so execute the corresponding keyboard-shortcut action and return true.
     * Else return false.
     * @param piKey
     * @param box
     * @param editor
     */
    // TODO question: piKey has type PiTriggerUSe which is either a string or a PiKey, but the check here says that piKey must be a 'isProKey',
    // which tests whether its input is a PiKey. Why???
    static findKeyboardShortcutCommand(piKey: PiTriggerUse, box: Box, editor: PiEditor): PiCommand {
        LOGGER.log("findKeyboardShortcutCommand for box " + box.role + " kind " + box.kind + " for key " + JSON.stringify(piKey));
        for (const act of editor.new_pi_actions) {
            if (isProKey(act.trigger) && isProKey(piKey)) {
                LOGGER.log("findKeyboardShortcutCommand for box " + box.role + " kind " + box.kind + " with activeroles: " + act.activeInBoxRoles);
                if (act.trigger.meta === piKey.meta && act.trigger.keyCode === piKey.keyCode) {
                    if (act.activeInBoxRoles.includes(box.role)) {
                        LOGGER.log("findKeyboardShortcutCommand: executing keyboard action");
                        return act.command(box);
                    } else {
                        LOGGER.log("findKeyboardShortcutCommand: Keyboard action does not include role " + box.role);
                    }
                }
            }
        }
        return PI_NULL_COMMAND;
    }
}

export function getRoot(box: Box): Box {
    if (!!box.parent) {
        return getRoot(box.parent);
    }
    return box;
}
