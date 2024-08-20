export enum MetaKey {
    None,
    Ctrl,
    Alt,
    Shift,
    CtrlAlt,
    CtrlShift,
    AltShift,
    CtrlAltShift,
}

export type FreKey = {
    meta: MetaKey;
    key: string;
    code: string;
};

export function toFreKey(e: KeyboardEvent): FreKey {
    return {
        meta: meta(e),
        key: e.key,
        code: e.code,
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

export const BACKSPACE = "Backspace";
export const TAB = "Tab";
export const ENTER = "Enter";
export const SHIFT = "Shift";
export const CONTROL = "Control";
export const ALT = "Alt";
export const ESCAPE = "Escape";
export const SPACEBAR = " ";
export const ARROW_LEFT = "ArrowLeft";
export const ARROW_UP = "ArrowUp";
export const ARROW_RIGHT = "ArrowRight";
export const ARROW_DOWN = "ArrowDown";
export const DELETE = "Delete";

export function isNumeric(event: KeyboardEvent): boolean {
    const key = event.key;
    if (!event.altKey && !event.shiftKey && !event.ctrlKey) {
        // no meta keys
        switch (key) {
            case "0":
            case "1":
            case "2":
            case "3":
            case "4":
            case "5":
            case "6":
            case "7":
            case "8":
            case "9": {
                return true;
            }
            default: {
                return false;
            }
        }
    }
    return false;
}

export function isPrintable(event: KeyboardEvent): boolean {
    // TODO Check new way of accessing key codes using event.key (keycode is deprecated), see https://github.com/ndrsn/is-printable-key-event
    const keyCode = event.keyCode;
    return (
        (!event.altKey &&
            !event.ctrlKey &&
            ((keyCode >= 48 && keyCode <= 90) || // 0-9 plus a-Z
                (keyCode >= 96 && keyCode <= 111) || // the numpad keys
                (keyCode >= 186 && keyCode <= 222))) || // quotes and brackets
        keyCode === 32 // spacebar
    );
}

export function isMetaKey(event: KeyboardEvent): boolean {
    return event.shiftKey || event.altKey || event.ctrlKey;
}
