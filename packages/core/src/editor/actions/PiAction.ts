import { PiElement } from "../../language/index";
import { Language } from "../../storage/index";
import { PiCaret, PiKey } from "../../util/index";
import { Box } from "../boxes/index";
import { isProKey, isRegExp, isString, PiTriggerType } from "../PiAction";
import { PiEditor } from "../PiEditor";
import { PiCommand } from "./PiCommand";

export type PiActionTriggerType = string | RegExp | PiKey;
export type PiActionTrigger = string | PiKey;
export type CustomAction = (box: Box, text: string, editor: PiEditor) => PiElement | null;

export function triggerToString2(trigger: PiActionTrigger): string {
    if (isString(trigger)){
        return trigger;
    } else if (isProKey(trigger)) {
        return "";
    } else {
        console.error("triggerToString() argument is not of PiTriggerType: " + typeof(trigger));
        return "";
    }
}

export type PiPostAction = () => void;

export const EMPTY_FUNCTION = function() {};

export type ReferenceShortcut2 = {
    propertyname: string;
    metatype: string;
}

export abstract class PiAction {
    /**
     * The trigger to activate this behavior
     */
    trigger: PiActionTriggerType;

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
    referenceShortcut?: ReferenceShortcut2;

    /**
     * Executes the action, should contain all model chnaages for this action.
     * Returns a function that should be executed after the projection has been calculated as a result
     * of the changes by `execute`.  Otherwise boxes and/or element that need to selected will not be available.
     * @param box
     * @param text
     * @param editor
     */
    // abstract execute(box: Box, text: PiActionTrigger, editor: PiEditor): PiPostAction;
    //
    // abstract undo(box: Box, editor: PiEditor): void;

    abstract command(box: Box): PiCommand;
}

