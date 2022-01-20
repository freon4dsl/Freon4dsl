import { PiElement } from "../../language/index";
import { PiCaret, PiKey } from "../../util/index";
import { Box } from "../boxes/index";
import { isProKey, isRegExp, isString } from "../PiAction";
import { PiEditor } from "../PiEditor";
import { PiCommand } from "./PiCommand";

export type PiActionTriggerType = string | RegExp | PiKey;
export type PiActionTrigger = string | PiKey;
export type CustomAction = (box: Box, text: string, editor: PiEditor) => PiElement | null;
export type PiPostAction = () => void;

export const EMPTY_POST_ACTION = function() {};

export type ReferenceShortcut = {
    propertyName: string;
    conceptName: string;
}

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

export function triggerTypeToString(trigger: PiActionTriggerType): string {
    if (isString(trigger)){
        return trigger;
    } else if (isProKey(trigger)) {
        return "'" + trigger.keyCode + "'";
    } else if (isRegExp(trigger)) {
        return "/" + trigger.source + "/";
    } else {
        console.error("triggerToString() argument is not of PiTriggerType: " + typeof(trigger));
        return "";
    }
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
    referenceShortcut?: ReferenceShortcut;

    abstract command(box: Box): PiCommand;
}

