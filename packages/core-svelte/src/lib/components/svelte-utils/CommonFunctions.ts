import {
    AST,
    Box,
    // FreLogger,
    FreEditor,
    FreEditorUtil,
    type FrePostAction,
    toFreKey,
    FreAction,
    ElementBox,
    isNullOrUndefined
} from '@freon4dsl/core';
import { SimpleElement } from '$lib/test-environment/models/SimpleElement.js';

// const LOGGER = new FreLogger('CommonFunctions').mute();

export const dummyBox = new ElementBox(new SimpleElement('dummy'), 'box-role');

// export function focusAndScrollIntoView(element: HTMLElement) {
//     if (!!element) {
//         element.focus();
//         // check if the element is already within the editor viewport
//         let rect = element.getBoundingClientRect();
//
//         let elemIsVisible =
//             rect.top >= get(viewport).top &&
//             rect.left >= get(viewport).left &&
//             rect.bottom <= get(viewport).height &&
//             rect.right <= get(viewport).width;
//
//         // if the element is not visible then scroll to it
//         // see https://learn.svelte.dev/tutorial/update for example on scrolling
//         if (!elemIsVisible) {
//             element.scrollIntoView();
//         }
//     }
// }

/**
 * This calculates the position of the context- or sub-menu, either on x-axis or y-axis
 * @param viewportSize
 * @param contentSize
 * @param mousePosition
 */
export function calculatePos(
    viewportSize: number,
    contentSize: number,
    mousePosition: number
): number {
    let result: number;
    // see if the menu will fit in the editor view, if not: position it left/up, not right/down of the mouse click
    if (viewportSize - mousePosition < contentSize) {
        result = mousePosition - contentSize;
    } else {
        result = mousePosition;
    }
    // if the result should be outside the editor view, then position it on the leftmost/uppermost point
    if (result < 0) {
        result = 0;
    }
    return result;
}

export function executeCustomKeyboardShortCut(
    event: KeyboardEvent,
    index: number,
    box: Box,
    editor: FreEditor
) {
    const cmd: FreAction = FreEditorUtil.findKeyboardShortcutAction(toFreKey(event), box, editor);
    if (cmd !== null) {
        let postAction: FrePostAction;
        AST.change(() => {
            // todo KeyboardEvent does not have an "action" prop, so what is happening here?
            const action = event['action' as keyof KeyboardEvent];
            if (!isNullOrUndefined(action)) {
                // @ts-expect-error if present, action is callable
                action();
            }
            postAction = cmd.execute(box, toFreKey(event), editor, index);
        });
        // @ts-expect-error this causes no error, because of the if-stat check
        if (!isNullOrUndefined(postAction)) {
            postAction();
        }
        // todo this method will stop the event from propagating, but does not prevent default!! Should it do so?
        event.stopPropagation();
    }
}

export function isOdd(n: number): boolean {
    return (n & 1) === 1;
}

// export function isEven(n: number): boolean {
//     return (n & 1) === 0;
// }

export function componentId(box: Box): string {
    return `${box?.node?.freId()}-${box?.role}`;
}

export function setBoxSizes(box: Box, rect: DOMRect) {
    if (!isNullOrUndefined(box)) {
        box.actualX = rect.left;
        box.actualY = rect.top;
        box.actualHeight = rect.height;
        box.actualWidth = rect.width;
        // XLOGGER.log("   actual is (" + Math.round(box.actualX) + ", " + Math.round(box.actualY) + ")");
    }
}

/**
 * Replace HTML tags and spaces with HTML Entities.
 * Used to make text containing these acceptable as HTML Text.
 * SPACE => @nbsp;
 * "<"   => &lt;
 */
export function replaceHTML(s: string): string {
    return s.replace(/\s/g, '&nbsp;').replace(/\</, '&lt;');
}
