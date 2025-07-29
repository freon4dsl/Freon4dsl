import { AST, FreDelta} from "../../change-manager/index.js"
import { FreLogger } from "../../logging/index.js";
import { Box, FreAction, FreEditor } from "../index.js";
import { FreExpressionNode } from "../../ast/index.js";
import { isFreExpression } from "../../ast-utils/index.js";
import { isProKey, FreTriggerUse } from "../actions/index.js";
import { FreUtils } from "../../util/index.js";

export type BooleanCallback = () => boolean;
export type DynamicBoolean = BooleanCallback | boolean;

export const wait = async (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
export const NBSP: string = "".concat("\u00A0");

const LOGGER = new FreLogger("FreEditorUtils").mute();

export class FreEditorUtil {
    static replaceExpression(oldExpression: FreExpressionNode, newExpression: FreExpressionNode, editor: FreEditor) {
        FreUtils.CHECK(
            isFreExpression(oldExpression),
            "replaceExpression: old element should be a FreExpressionNode, but it isn't",
        );
        FreUtils.CHECK(
            isFreExpression(newExpression),
            "replaceExpression: new element should be a FreExpressionNode, but it isn't",
        );
        AST.change(() => {
            FreUtils.setContainer(newExpression, oldExpression.freOwnerDescriptor(), editor);
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
    static findKeyboardShortcutAction(freKey: FreTriggerUse, box: Box, editor: FreEditor): FreAction {
        LOGGER.log(
            "findKeyboardShortcutCommand for box " +
                box.role +
                " kind " +
                box.kind +
                " for key " +
                JSON.stringify(freKey),
        );
        for (const act of editor.newFreActions) {
            if (isProKey(act.trigger) && isProKey(freKey)) {
                LOGGER.log(
                    "findKeyboardShortcutCommand for box " +
                        box.role +
                        " kind " +
                        box.kind +
                        " with activeroles: " +
                        act.activeInBoxRoles,
                );
                if (act.trigger.meta === freKey.meta && act.trigger.key === freKey.key) {
                    if (act.activeInBoxRoles.includes(box.role)) {
                        LOGGER.log("findKeyboardShortcutCommand: executing keyboard action");
                        return act;
                    } else {
                        LOGGER.log("findKeyboardShortcutCommand: Keyboard action does not include role " + box.role);
                    }
                }
            }
        }
        return null;
    }
    
    static selectAfterUndo(editor: FreEditor, delta: FreDelta): void {
        LOGGER.log(`selectAfterUndo ${delta.toString()}`)
        editor.selectFirstEditableChildBox(delta.owner)
        // TODO Make it more precise, to getb focus at better place
        // if (delta instanceof FrePrimDelta) {
        //     editor.selectElement(delta.owner, delta.propertyName)
        //     editor.selectFirstEditableChildBox(delta.owner)
        // } else if (delta instanceof FrePartDelta) {
        //     editor.selectElement(delta.owner, delta.propertyName)
        // } else if (delta instanceof FrePartListDelta) {
        //     editor.selectElement(delta.owner, delta.propertyName, delta.index)
        // } else if (delta instanceof FrePrimListDelta) {
        //     editor.selectElement(delta.owner, delta.propertyName, delta.index)
        // } else if(delta instanceof FreTransactionDelta) {
        //     FreEditorUtil.selectAfterUndo(editor, delta.internalDeltas[0])
        // }
    }
}

export function getRoot(box: Box): Box {
    if (!!box.parent) {
        return getRoot(box.parent);
    }
    return box;
}
