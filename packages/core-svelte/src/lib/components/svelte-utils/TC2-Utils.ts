import { BACKSPACE, DELETE } from '@freon4dsl/core';

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

export function canMoveCaretToStart(input: HTMLInputElement | undefined): boolean {
    if (!input) return false;

    const start = input.selectionStart ?? 0;
    const end = input.selectionEnd ?? 0;

    return start !== 0 || end !== 0;
}

export function canMoveCaretToEnd(input: HTMLInputElement | undefined): boolean {
    if (!input) return false;

    const value = input.value ?? '';
    const start = input.selectionStart ?? 0;
    const end = input.selectionEnd ?? 0;

    return start !== value.length || end !== value.length;
}

export function canDeletePreviousWord(input: HTMLInputElement | undefined): boolean {
    if (!input) return false;

    const start = input.selectionStart ?? 0;
    const end = input.selectionEnd ?? 0;

    return start !== end || start > 0;
}

export function canDeleteNextWord(input: HTMLInputElement | undefined): boolean {
    if (!input) return false;

    const value = input.value ?? '';
    const start = input.selectionStart ?? 0;
    const end = input.selectionEnd ?? 0;

    return start !== end || end < value.length;
}

export function canMoveCaretLeft(input: HTMLInputElement | undefined): boolean {
    if (!input) return false;

    const start = input.selectionStart ?? 0;
    const end = input.selectionEnd ?? 0;

    return start !== end || start > 0;
}

export function canMoveCaretRight(input: HTMLInputElement | undefined): boolean {
    if (!input) return false;

    const value = input.value ?? '';
    const start = input.selectionStart ?? 0;
    const end = input.selectionEnd ?? 0;

    return start !== end || end < value.length;
}

export function canUseBackspace(input: HTMLInputElement | undefined): boolean {
    if (!input) return false;

    const start = input.selectionStart ?? 0;
    const end = input.selectionEnd ?? 0;

    return start !== end || start > 0;
}

export function canUseDelete(input: HTMLInputElement | undefined): boolean {
    if (!input) return false;

    const value = input.value ?? '';
    const start = input.selectionStart ?? 0;
    const end = input.selectionEnd ?? 0;

    return start !== end || end < value.length;
}
