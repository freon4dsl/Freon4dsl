import * as React from "react";

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

export function reactToKey(e: React.KeyboardEvent<any>): PiKey {
  return {
    meta: meta(e),
    keyCode: e.keyCode
  };
}

export function meta(e: React.KeyboardEvent<any>): MetaKey {
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

export function isNumeric(event: React.KeyboardEvent<any>): boolean {
  const keyCode = event.keyCode;
  return (
    !event.altKey &&
    !event.shiftKey &&
    !event.ctrlKey &&
    ((keyCode >= 48 && keyCode <= 57) || (keyCode >= 96 && keyCode <= 105))
  );
}

export function isPrintable(event: React.KeyboardEvent<any>): boolean {
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

export function isMetaKey(event: React.KeyboardEvent<any>): boolean {
  return event.shiftKey || event.altKey || event.ctrlKey;
}
