import { Box } from "../boxes";
import { FreEditor } from "../FreEditor";
import { EMPTY_POST_ACTION, FrePostAction } from "./FreAction";
import { FreTriggerUse } from "./FreTriggers";
import { FreLogger } from "../../logging";

export const FRECOMMAND_LOGGER = new FreLogger("FreCommand"); // .mute();

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

export const FRE_NULL_COMMAND: FreCommand = new FreNullCommand();



