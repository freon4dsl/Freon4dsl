import { PiElement } from "../../ast";
import { PiCaret } from "../util/";
import { Box } from "../boxes/";
import { PiEditor } from "../PiEditor";
import { PiCommand } from "./PiCommand";
import { PiTriggerUse, PiTriggerType } from "./PiTriggers";

export type CustomAction = (box: Box,
                            trigger: PiTriggerUse,
                            editor: PiEditor) => PiElement | null;
export type PiPostAction = () => void;

export const EMPTY_POST_ACTION = function() {};

export type ReferenceShortcut = {
    propertyName: string;
    conceptName: string;
};

/**
 * Abstract superclass for all actions in ProjectIt
 */
export abstract class PiAction {
    /**
     * The trigger to activate this behavior
     */
    trigger: PiTriggerType;

    /**
     * The box roles in which this trigger is active
     */
    activeInBoxRoles: string[];

    /**
     * Optional callback function that returns whether the trigger is applicable for the specific box.
     */
    isApplicable?: (box: Box) => boolean;

    /**
     * The role of the box that should be selected after the action has been executing.
     */
    boxRoleToSelect?: string;

    /**
     * The caret position where the cursor should be positioned after the action has been executed.
     * Only applicable if the selected box is a TextBox.
     */
    caretPosition?: PiCaret;

    /**
     * The property name of the reference for which this is a shortcut.
     */
    referenceShortcut?: ReferenceShortcut;

    /**
     * Returns the command object that can be executed to perform the action.
     * @param box
     */
    abstract command(box: Box): PiCommand;
}

