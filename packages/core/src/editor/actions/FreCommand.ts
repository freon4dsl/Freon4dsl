import { FreBinaryExpression } from "../../ast";
import { BTREE, FRE_BINARY_EXPRESSION_LEFT } from "../../util";
import { FreCaret } from "../util";
import { Box } from "../boxes";
import { FreEditor } from "../FreEditor";
import { CustomAction, EMPTY_POST_ACTION, FrePostAction } from "./FreAction";
import { FreTriggerUse, triggerTypeToString } from "./FreTriggers";
import { FreLogger } from "../../logging";

const LOGGER = new FreLogger("FreCommand"); // .mute();

/**
 * Abstract supercass for all commands in Freon.
 * FreCommand is the only place where actual changes (coming from the editor) to the model should be made.
 *
 * The `undo()` function is not always implemented yet.
 */
export abstract class FreCommand {
    /**
     * Executes the action, should contain all model changes for this action.
     * Returns a function that should be executed after the projection has been calculated as a result
     * of the changes by `execute`. Otherwise, boxes and/or element that need to selected will not be available.
     * @param box    The box that is selected when invoking this command.
     * @param text   The text or keyboard shortcut or menu that invoked this command. // todo why do we need this here?
     * @param editor The editor instance in which this command is invoked.
     * @param index  If the action is executed on a list, the index at which to execute the action.
     */
    abstract execute(box: Box, text: FreTriggerUse, editor: FreEditor, index: number): FrePostAction;

    /**
     * Undo this command.
     * The assumption is that this will be done on the model in the state directly after executing this command.
     * If this is not the case, the undo might give unexpected results.
     * By keeping all executed commands on a stack, undo can be realized for multiple commands.
     *
     * @param box
     * @param editor
     */
    abstract undo(box: Box, editor: FreEditor): void;
    // todo implement undo function in all subclasses of FreCommand
}

class FreNullCommand extends FreCommand {
    // @ts-ignore
    // parameters present to adhere to base class signature
    execute(box: Box, text: FreTriggerUse, editor: FreEditor): FrePostAction {
        return EMPTY_POST_ACTION;
    }

    // @ts-ignore
    // parameters present to adhere to base class signature
    undo(box: Box, editor: FreEditor): void {
        /* to be done */
    }
}

export const PI_NULL_COMMAND: FreCommand = new FreNullCommand();

export type FreBinaryExpressionBuilder = (box: Box, text: string, editor: FreEditor) => FreBinaryExpression;

export class FreCreateBinaryExpressionCommand extends FreCommand {
    expressionBuilder: FreBinaryExpressionBuilder;
    boxRoleToSelect: string;
    caretPosition: FreCaret;

    constructor(expressionBuilder: FreBinaryExpressionBuilder) {
        super();
        this.expressionBuilder = expressionBuilder;
    }

    execute(box: Box, trigger: FreTriggerUse, editor: FreEditor): FrePostAction {
        // console.log("FreCreateBinaryExpressionCommand: trigger [" + triggerTypeToString(trigger) + "] part: ");
        const selected = BTREE.insertBinaryExpression(
            this.expressionBuilder(box, triggerTypeToString(trigger), editor),
            box,
            editor,
        );
        // TODO Check whether this fix works consistently correct.
        const childProperty = selected.boxRoleToSelect === FRE_BINARY_EXPRESSION_LEFT ? "left" : "right";
        return function () {
            LOGGER.log(
                "FreCreateBinaryExpressionCommand select after: " +
                    selected.element.freLanguageConcept() +
                    " ID " +
                    selected.element.freId() +
                    " rolr " +
                    childProperty,
            );
            editor.selectElement(selected.element, childProperty);
            editor.selectFirstEditableChildBox(selected.element);
        };
    }

    // @ts-ignore
    // parameters present to adhere to base class signature
    undo() {
        /* to be done */
    }
}

export class FreCustomCommand extends FreCommand {
    boxRoleToSelect: string;
    caretPosition: FreCaret;
    action: CustomAction;

    constructor(action: CustomAction, boxRoleToSelect: string, caretPosition: FreCaret) {
        super();
        this.action = action;
        this.boxRoleToSelect = boxRoleToSelect;
        this.caretPosition = caretPosition;
    }

    execute(box: Box, trigger: FreTriggerUse, editor: FreEditor): FrePostAction {
        // LOGGER.log("execute custom action, text is [" + text + "] refShort [" + this.referenceShortcut + "]" );
        // console.log("FreCustomCommand: trigger [" + triggerTypeToString(trigger) + "]");
        const self = this;
        const selected = self.action(box, triggerTypeToString(trigger), editor);

        if (!!selected) {
            if (!!self.boxRoleToSelect) {
                return function () {
                    // console.log("FreCommand select " + box.element.freLanguageConcept() + " box " + self.boxRoleToSelect);
                    editor.selectElementBox(selected, self.boxRoleToSelect, self.caretPosition);
                };
            } else {
                // Default: select the first editable child of the selected element
                return function () {
                    editor.selectFirstEditableChildBox(selected);
                };
            }
        }
        return EMPTY_POST_ACTION;
    }

    // @ts-ignore
    // parameters present to adhere to base class signature
    undo() {
        /* to be done */
    }
}
