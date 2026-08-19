import { BACKSPACE, DELETE, FreCaret, FreCaretPosition } from '@freon4dsl/core';
import { flushSync } from 'svelte';

/**
 * Converts camelCase text to readable text by adding spaces before capital letters
 * and capitalizing the first letter.
 * Example: "sourceToTargetMappings" -> "Source To Target Mappings"
 * @param text The camelCase text to convert
 * @returns The converted readable text
 */
export function camelCaseToReadable(text: string): string {
    if (!text || text.length === 0) {
        return text;
    }

    // Remove < and > characters
    const withoutBrackets = text.replace(/[<>]/g, '');

    // Add space before capital letters (except the first character)
    const withSpaces = withoutBrackets.replace(/([a-z])([A-Z])/g, '$1 $2');

    // Capitalize the first letter
    return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
}

export function isUndoKey(event: KeyboardEvent): boolean {
    const key = event.key.toLowerCase();
    const isCommandKey = event.ctrlKey || event.metaKey;

    return isCommandKey && key === 'z' && !event.shiftKey;
}

export function isRedoKey(event: KeyboardEvent): boolean {
    const key = event.key.toLowerCase();
    const isCommandKey = event.ctrlKey || event.metaKey;

    return (
        isCommandKey &&
        (key === 'y' || // Windows/Linux
            (key === 'z' && event.shiftKey)) // macOS
    );
}

export function isSelectAllKey(event: KeyboardEvent): boolean {
    const key = event.key.toLowerCase();
    const isCommandKey = event.ctrlKey || event.metaKey;

    return isCommandKey && !event.altKey && key === 'a';
}

export function isHomeKey(event: KeyboardEvent): boolean {
    return event.key === 'Home';
}

export function isEndKey(event: KeyboardEvent): boolean {
    return event.key === 'End';
}

export function isDeletePreviousWordKey(event: KeyboardEvent): boolean {
    return (
        event.ctrlKey &&
        !event.metaKey &&
        !event.shiftKey &&
        !event.altKey &&
        event.key === BACKSPACE
    );
}

export function isDeleteNextWordKey(event: KeyboardEvent): boolean {
    return (
        event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey && event.key === DELETE
    );
}

export function canMoveCaretToStart(input: HTMLInputElement | HTMLTextAreaElement | undefined): boolean {
    if (!input) return false;

    const start = input.selectionStart ?? 0;
    const end = input.selectionEnd ?? 0;

    return start !== 0 || end !== 0;
}

export function canMoveCaretToEnd(input: HTMLInputElement | HTMLTextAreaElement | undefined): boolean {
    if (!input) return false;

    const value = input.value ?? '';
    const start = input.selectionStart ?? 0;
    const end = input.selectionEnd ?? 0;

    return start !== value.length || end !== value.length;
}

export function canDeletePreviousWord(input: HTMLInputElement | HTMLTextAreaElement | undefined): boolean {
    if (!input) return false;

    const start = input.selectionStart ?? 0;
    const end = input.selectionEnd ?? 0;

    return start !== end || start > 0;
}

export function canDeleteNextWord(input: HTMLInputElement | HTMLTextAreaElement | undefined): boolean {
    if (!input) return false;

    const value = input.value ?? '';
    const start = input.selectionStart ?? 0;
    const end = input.selectionEnd ?? 0;

    return start !== end || end < value.length;
}

export function canMoveCaretLeft(input: HTMLInputElement | HTMLTextAreaElement | undefined): boolean {
    if (!input) return false;

    const start = input.selectionStart ?? 0;
    const end = input.selectionEnd ?? 0;

    return start !== end || start > 0;
}

export function canMoveCaretRight(input: HTMLInputElement | HTMLTextAreaElement | undefined): boolean {
    if (!input) return false;

    const value = input.value ?? '';
    const start = input.selectionStart ?? 0;
    const end = input.selectionEnd ?? 0;

    return start !== end || end < value.length;
}

export function canUseBackspace(input: HTMLInputElement | HTMLTextAreaElement | undefined): boolean {
    if (!input) return false;

    const start = input.selectionStart ?? 0;
    const end = input.selectionEnd ?? 0;

    return start !== end || start > 0;
}

export function canUseDelete(input: HTMLInputElement | HTMLTextAreaElement | undefined): boolean {
    if (!input) return false;

    const value = input.value ?? '';
    const start = input.selectionStart ?? 0;
    const end = input.selectionEnd ?? 0;

    return start !== end || end < value.length;
}

export type TextCaretPosition = { start: number; end: number }; // Note the diff with FreCaretPosition from core!

export function resetCaretPosition(freCaret: FreCaret, currentValue: string): TextCaretPosition {
    const caretPos: TextCaretPosition = { start: 0, end: 0 };
    switch (freCaret.position) {
        case FreCaretPosition.RIGHT_MOST: // type nr 2
            caretPos.start = caretPos.end = currentValue.length;
            break;
        case FreCaretPosition.LEFT_MOST: // type nr 1
            caretPos.start = 0;
            caretPos.end = 0;
            break;
        case FreCaretPosition.UNSPECIFIED: // type nr 0
            caretPos.start = 0;
            caretPos.end = currentValue.length;
            break;
        case FreCaretPosition.INDEX: // type nr 3
            const len = currentValue.length;
            // make sure the given position is within the current text
            caretPos.start = Math.max(0, Math.min(freCaret.from, len));
            caretPos.end = Math.max(caretPos.start, Math.min(freCaret.to, len));
            break;
        default:
            caretPos.start = 0;
            caretPos.end = currentValue.length;
            break;
    }
    return caretPos;
}

export type TextInputClipboardContext = {
    inputElement: HTMLInputElement | HTMLTextAreaElement | undefined;
    text: string;
    setText: (value: string) => void;
    afterChange?: () => void;
};

/* Helper function in the following three clipboard functions */
function getSafeSelection(input: HTMLInputElement | HTMLTextAreaElement): { start: number; end: number } {
    const start = Math.max(0, input.selectionStart ?? 0);
    const end = Math.max(start, input.selectionEnd ?? start);
    return { start, end };
}

/**
 * Returns the currently selected text from the input.
 * Restores focus to the input afterward, because focus may be on an outer button.
 */
export function getSelectedTextFromInput(ctx: TextInputClipboardContext): string {
    flushSync(); // flush any pending updates

    // get input from ctx, i.e. from the component that is using this function
    const input = ctx.inputElement;
    if (!input) {
        return '';
    }
    // NB focus is on an outer button, so read selection immediately ...
    const value = input.value ?? ctx.text ?? '';
    const { start, end } = getSafeSelection(input);

    // ... then restore focus
    input.focus(); // important, because focus is on an outer button
    return value.slice(start, end);
}

/**
 * Deletes the current selection from the input.
 * If nothing is selected, nothing happens.
 */
export function deleteSelectionFromInput(ctx: TextInputClipboardContext): void {
    flushSync(); // ensure DOM and state are aligned

    // get input from ctx, i.e. from the component that is using this function
    const input = ctx.inputElement;
    if (!input) return;

    const value = input.value ?? ctx.text ?? '';
    const { start, end } = getSafeSelection(input);

    if (start === end) {
        // nothing selected → nothing to delete
        return;
    }

    const newValue = value.slice(0, start) + value.slice(end);

    input.value = newValue;
    ctx.setText(newValue);

    input.focus(); // important, because focus is on outer button
    // restore caret position
    input.setSelectionRange(start, start);

    // do everything the component needs to be done after the deletion
    ctx.afterChange?.();
}

/**
 * Inserts text at the current selection/caret position.
 * Replaces the current selection if there is one.
 */
export function insertAtSelectionInInput(
    insertedText: string,
    ctx: TextInputClipboardContext
): void {
    flushSync(); // ensure DOM and state are aligned

    // get input from ctx, i.e. from the component that is using this function
    const input = ctx.inputElement;
    if (!input) return;

    const safeInsert = insertedText ?? '';
    const value = input.value ?? ctx.text ?? '';
    const { start, end } = getSafeSelection(input);

    const newValue = value.slice(0, start) + safeInsert + value.slice(end);
    const newCaret = start + safeInsert.length;

    input.value = newValue;
    ctx.setText(newValue);

    input.focus(); // important, because focus is on outer button
    // restore caret position
    input.setSelectionRange(newCaret, newCaret);

    // do everything the component needs to be done after the deletion
    ctx.afterChange?.();
}

/**
 * Computes the width for an input based on its text or placeholder,
 * using a hidden span for measurement.
 */
export function computeInputWidth(
    text: string | undefined,
    placeholder: string | undefined,
    widthSpan: HTMLSpanElement
): string {
    let value = text ?? '';

    if (value.length === 0) {
        value = placeholder ?? '';
        if (value.length === 0) {
            value = ' '; // ensure span has measurable content
        }
    }

    // Ensure that HTML tags in value are encoded, otherwise they will be seen as HTML => done by textContent.
    widthSpan.textContent = value;

    // Add small buffer for caret
    return `${widthSpan.offsetWidth + 2}px`;
}

export function isAtFirstLine(el: HTMLTextAreaElement): boolean {
    const pos = el.selectionStart ?? 0;
    const value = el.value ?? '';

    // If there is no newline before the caret, we are on the first line
    return value.lastIndexOf('\n', pos - 1) === -1;
}

export function isAtLastLine(el: HTMLTextAreaElement): boolean {
    const pos = el.selectionStart ?? 0;
    const value = el.value ?? '';

    // If there is no newline after the caret, we are on the last line
    return value.indexOf('\n', pos) === -1;
}
