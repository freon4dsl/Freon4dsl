import { runInAction } from "mobx";
import { FreLogger } from "../../logging";
import { Box, PI_NULL_COMMAND, FreCommand, FreEditor } from "../index";
import { FreOwnerDescriptor, FreNode, FreExpressionNode } from "../../ast";
import { isFreExpression } from "../../ast-utils";
import { isProKey, FreTriggerUse } from "../actions/FreTriggers";
import { FreUtils } from "../../util";

export type BooleanCallback = () => boolean;
export type DynamicBoolean = BooleanCallback | boolean;

export const wait = async (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
export const NBSP: string = "".concat("\u00A0");

const LATEST_ID = 0;

const LOGGER = new FreLogger("FreEditorUtils").mute();

export class FreEditorUtil {

    static setContainer(exp: FreNode, freOwnerDescriptor: FreOwnerDescriptor | null, editor: FreEditor): void {
        runInAction(() => {
            if (!!freOwnerDescriptor) {
                if (freOwnerDescriptor.propertyIndex === undefined) {
                    freOwnerDescriptor.owner[freOwnerDescriptor.propertyName] = exp;
                } else {
                    freOwnerDescriptor.owner[freOwnerDescriptor.propertyName][freOwnerDescriptor.propertyIndex] = exp;
                }
            } else {
                editor.rootElement = exp;
            }
        });
    }

    static replaceExpression(oldExpression: FreExpressionNode, newExpression: FreExpressionNode, editor: FreEditor) {
        FreUtils.CHECK(isFreExpression(oldExpression), "replaceExpression: old element should be a FreExpressionNode, but it isn't");
        FreUtils.CHECK(isFreExpression(newExpression), "replaceExpression: new element should be a FreExpressionNode, but it isn't");
        runInAction(() => {
            FreEditorUtil.setContainer(newExpression, oldExpression.freOwnerDescriptor(), editor);
        });
    }

    // TODO refactor this into an InternalBehavior class, like other behaviors.
    /**
     * Check whether `freKey` is a defined keyboard-shortcut for `box`.
     * If so execute the corresponding keyboard-shortcut action and return true.
     * Else return false.
     * @param freKey
     * @param box
     * @param editor
     */
    // TODO question: freKey has type FreTriggerUSe which is either a string or a FreKey, but the check here says that freKey must be a 'isProKey',
    // which tests whether its input is a FreKey. Why???
    static findKeyboardShortcutCommand(freKey: FreTriggerUse, box: Box, editor: FreEditor): FreCommand {
        LOGGER.log("findKeyboardShortcutCommand for box " + box.role + " kind " + box.kind + " for key " + JSON.stringify(freKey));
        for (const act of editor.newFreActions) {
            if (isProKey(act.trigger) && isProKey(freKey)) {
                LOGGER.log("findKeyboardShortcutCommand for box " + box.role + " kind " + box.kind + " with activeroles: " + act.activeInBoxRoles);
                if (act.trigger.meta === freKey.meta && act.trigger.key === freKey.key) {
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
