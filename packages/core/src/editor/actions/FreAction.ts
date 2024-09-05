import { FreNode } from "../../ast";
import { FreCaret } from "../util/";
import { Box } from "../boxes/";
import { FreEditor } from "../FreEditor";
import { FreCommand } from "./FreCommand";
import { FreTriggerUse, FreTriggerType } from "./FreTriggers";

export type CustomAction = (box: Box, trigger: FreTriggerUse, editor: FreEditor) => FreNode | null;
export type FrePostAction = () => void;

export const EMPTY_POST_ACTION = function () {
    /* todo create this function body */
};

export type ReferenceShortcut = {
    propertyName: string;
    conceptName: string;
};

/**
 * Abstract superclass for all actions in Freon
 */
export abstract class FreAction {
    /**
     * The trigger to activate this behavior
     */
    trigger: FreTriggerType;

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
    caretPosition?: FreCaret;

    /**
     * The property name of the reference for which this is a shortcut.
     */
    referenceShortcut?: ReferenceShortcut;

    /**
     * Returns the command object that can be executed to perform the action.
     */
    abstract command(): FreCommand;
}
