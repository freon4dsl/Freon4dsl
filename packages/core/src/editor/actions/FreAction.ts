import type { FreNode } from "../../ast/index.js";
import { FreLogger } from "../../logging/index.js";
import type { FreCaret } from "../util/index.js";
import type { Box } from "../boxes/index.js";
import type { FreEditor } from "../FreEditor.js";
import type { FreTriggerUse, FreTriggerType } from "./FreTriggers.js";

export const ACTION_LOGGER = new FreLogger("FreAction")
    
export type CustomAction = (box: Box, trigger: FreTriggerUse, editor: FreEditor) => FreNode | null;
export type FrePostAction = () => void;

/**
 *  Use this if there is no post action. 
 */
export const EMPTY_POST_ACTION = function () {
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
     * Execute the action
     * @param box       The selected box on which this action is executed
     * @param trigger   The trigger that causes this action to execute
     * @param editor    The editor 
     * @param index     The index in the list, if there is any
     */
    abstract execute(box: Box, trigger: FreTriggerUse, editor: FreEditor, index?: number): FrePostAction;
}
