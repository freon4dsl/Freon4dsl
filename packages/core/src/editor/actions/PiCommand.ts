import { PiBinaryExpression, PiElement } from "../../ast";
import { Language } from "../../language";
import { BTREE } from "../../util";
import { PiCaret, PiCaretPosition } from "../util";
import { Box } from "../boxes";
import { PiEditor } from "../PiEditor";
import { CustomAction, EMPTY_POST_ACTION, PiPostAction, ReferenceShortcut } from "./PiAction";
import { isString, PiTriggerUse, triggerTypeToString } from "./PiTriggers";
import { PiLogger } from "../../logging";

const LOGGER = new PiLogger("PiCommand"); //.mute();

/**
 * Abstract supercass for all commands in ProjectIt.
 * PiCommand is the only place where actual changes (coming from the editor) to the model should be made.
 *
 * The `undo()` function is not always implemented yet.
 */
export abstract class PiCommand {
    constructor() {}

    /**
     * Executes the action, should contain all model changes for this action.
     * Returns a function that should be executed after the projection has been calculated as a result
     * of the changes by `execute`. Otherwise, boxes and/or element that need to selected will not be available.
     * @param box    The box that is selected when invoking this command.
     * @param text   The text or keyboard shortcut or menu that invoked this command. // todo why do we need this here?
     * @param editor The editor instance in which this command is invoked.
     * @param index  If the action is executed on a list, the index at which to execute the action.
     */
    abstract execute(box: Box, text: PiTriggerUse, editor: PiEditor, index: number): PiPostAction;

    /**
     * Undo this command.
     * The assumption is that this will be done on the model in the state directly after executing this command.
     * If this is not the case, the undo might give unexpected results.
     * By keeping all executed commands on a stack, undo can be realized for multiple commands.
     *
     * @param box
     * @param editor
     */
    abstract undo(box: Box, editor: PiEditor): void;
}

class PiNullCommand extends PiCommand {
    execute(box: Box, text: PiTriggerUse, editor: PiEditor): PiPostAction {
        return EMPTY_POST_ACTION;
    }

    undo(box: Box, editor: PiEditor): void {}
}

export const PI_NULL_COMMAND: PiCommand = new PiNullCommand();

export type PiBinaryExpressionBuilder = (box: Box, text: string, editor: PiEditor) => PiBinaryExpression;

export class PiCreateBinaryExpressionCommand extends PiCommand {
    expressionBuilder: PiBinaryExpressionBuilder;
    boxRoleToSelect: string;
    caretPosition: PiCaret;

    constructor(expressionBuilder: PiBinaryExpressionBuilder) {
        super();
        this.expressionBuilder = expressionBuilder;
    }

    execute(box: Box, trigger: PiTriggerUse, editor: PiEditor): PiPostAction {
        // console.log("PiCreateBinaryExpressionCommand: trigger [" + triggerTypeToString(trigger) + "] part: ");
        const selected = BTREE.insertBinaryExpression(this.expressionBuilder(box, triggerTypeToString(trigger), editor), box, editor);
        return function () {
            editor.selectElement(selected.element, selected.boxRoleToSelect)
        };
    }

    undo() {}
}

export class PiCustomCommand extends PiCommand {
    boxRoleToSelect: string;
    caretPosition: PiCaretPosition;
    action: CustomAction;

    constructor(action: CustomAction, boxRoleToSelect) {
        super();
        this.action = action;
        this.boxRoleToSelect = boxRoleToSelect;
    }

    execute(box: Box, trigger: PiTriggerUse, editor: PiEditor): PiPostAction {
        // LOGGER.log("execute custom action, text is [" + text + "] refShort [" + this.referenceShortcut + "]" );
        // console.log("PiCustomCommand: trigger [" + triggerTypeToString(trigger) + "]");
        const self = this;
        const selected = self.action(box, triggerTypeToString(trigger), editor);

        if (!!selected) {
            if (!!self.boxRoleToSelect) {
                return function () {
                    // console.log("PiCommand select " + box.element.piLanguageConcept() + " box " + self.boxRoleToSelect);
                    editor.selectElement(selected, self.boxRoleToSelect);
                };
            } else {
                // Default: select the first editable child of the selected element
                return function () {
                    editor.selectElement(selected);
                    editor.selectFirstEditableChildBox();
                };
            }
        }
        return EMPTY_POST_ACTION;
    }

    undo() {}
}
