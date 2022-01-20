import { Box, PiCreateBinaryExpressionAction, PiCustomAction, ReferenceShortcut } from "./internal";
import { PiElement } from "../language";
import { PiCaret, PiKey } from "../util";
import { PiEditor } from "./internal";

export type PiTriggerType = string | RegExp | PiKey;

export function triggerToString(t: PiTriggerType): string {
    if (isRegExp(t)) {
        return t.source;
    } else if (isProKey(t)) {
        return t.meta.toString() + t.keyCode;
    } else {
        return t;
    }
}

// tag::action-interface[]
export interface PiActions {
    binaryExpressionActions: PiCreateBinaryExpressionAction[];

    customActions: PiCustomAction[];
}
// end::action-interface[]

// tag::PiBehavior[]
export interface PiBehavior {
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
    boxRoleToSelect?: string;
    caretPosition?: PiCaret;

    referenceShortcut?: ReferenceShortcut;

}
// end::PiBehavior[]

// TODO Use this to replace KeyboardShortcutTrigger
export interface KeyboardShortcutBehavior extends PiBehavior {
    trigger: PiKey;
    action: (box: Box, trigger: PiKey, editor: PiEditor, propertyName?: string) => PiElement;
}

export function isRegExp(a: PiTriggerType): a is RegExp {
    return (a as any).exec !== undefined;
}

export function isProKey(a: PiTriggerType): a is PiKey {
    return (a as any).meta !== undefined;
}

export function isString(a: PiTriggerType): a is string {
    return !isRegExp(a) && typeof a === "string";
}
