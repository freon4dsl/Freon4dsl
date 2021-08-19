
export enum MetaKey {
    None,
    Ctrl,
    Alt,
    Shift,
    CtrlAlt,
    CtrlShift,
    AltShift,
    CtrlAltShift
}

export type PiKey = {
    meta: MetaKey;
    keyCode: number;
};

export function toPiKey(e: KeyboardEvent): PiKey {
    return {
        meta: meta(e),
        keyCode: e.keyCode
    };
}

export function meta(e: KeyboardEvent): MetaKey {
    if (!e.ctrlKey && !e.altKey && !e.shiftKey) {
        return MetaKey.None;
    }
    if (e.ctrlKey && e.altKey && e.shiftKey) {
        return MetaKey.CtrlAltShift;
    }
    if (e.ctrlKey && e.altKey) {
        return MetaKey.CtrlAlt;
    }
    if (e.ctrlKey && e.shiftKey) {
        return MetaKey.CtrlShift;
    }
    if (e.ctrlKey) {
        return MetaKey.Ctrl;
    }
    if (e.altKey && e.shiftKey) {
        return MetaKey.AltShift;
    }
    if (e.altKey) {
        return MetaKey.Alt;
    }
    if (e.shiftKey) {
        return MetaKey.Shift;
    }
    return MetaKey.None;
}

/**
 *  This file contains the constants for all key codes.
 *  Use these constants instead of the numeric values in the code to make it more readable.
 */
export const BACKSPACE = 8;
export const TAB = 9;
export const ENTER = 13;
export const CHARACTER_A = 65;
export const SHIFT = 16;
export const CONTROL = 17;
export const ALT = 18;
export const ESCAPE = 27;
export const SPACEBAR = 32;
export const ARROW_LEFT = 37;
export const ARROW_UP = 38;
export const ARROW_RIGHT = 39;
export const ARROW_DOWN = 40;
export const DELETE = 46;

/**
 *  keyCode is deprecated, should use the key values below.
 *  TODO Replace the keyCode with key everywhere
 */
export const KEY_BACKSPACE = "Backspace";
export const KEY_TAB = "Tab";
export const KEY_ENTER = "Enter";
export const KEY_SHIFT = "Shift";
export const KEY_CONTROL = "Control";
export const KEY_ALT = "Alt";
export const KEY_ESCAPE = "Escape";
export const KEY_SPACEBAR = " ";
export const KEY_ARROW_LEFT = "ArrowLeft";
export const KEY_ARROW_UP = "ArrowUp";
export const KEY_ARROW_RIGHT = "ArrowRight";
export const KEY_ARROW_DOWN = "ArrowDown";
export const KEY_DELETE = "Delete";

export function isNumeric(event: KeyboardEvent): boolean {
    const keyCode = event.keyCode;
    return !event.altKey && !event.shiftKey && !event.ctrlKey && ((keyCode >= 48 && keyCode <= 57) || (keyCode >= 96 && keyCode <= 105));
}

export function isPrintable(event: KeyboardEvent): boolean {
    // TODO Check new way of accessing key codes using event.key (keycode is deprecated), see https://github.com/ndrsn/is-printable-key-event
    const keyCode = event.keyCode;
    return (
        (!event.altKey &&
            !event.ctrlKey &&
            ((keyCode >= 48 && keyCode <= 90) ||
                (keyCode >= 96 && keyCode <= 105) ||
                (keyCode >= 106 && keyCode <= 111) ||
                (keyCode >= 186 && keyCode <= 222))) ||
        keyCode === SPACEBAR
    );
}

export function isMetaKey(event: KeyboardEvent): boolean {
    return event.shiftKey || event.altKey || event.ctrlKey;
}
