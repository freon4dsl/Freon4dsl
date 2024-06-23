import { PI_NULL_COMMAND, FreEditorUtil, toFreKey } from "@freon4dsl/core";
import { runInAction } from "mobx";
import { viewport } from "./EditorViewportStore.js";
import { get } from "svelte/store";
export function focusAndScrollIntoView(element) {
    if (!!element) {
        element.focus();
        // check if the element is already within the editor viewport
        let rect = element.getBoundingClientRect();
        let elemIsVisible = (rect.top >= get(viewport).top &&
            rect.left >= get(viewport).left &&
            rect.bottom <= get(viewport).height &&
            rect.right <= get(viewport).width);
        // if the element is not visible then scroll to it
        if (!elemIsVisible) {
            element.scrollIntoView();
        }
    }
}
export function executeCustomKeyboardShortCut(event, index, box, editor) {
    const cmd = FreEditorUtil.findKeyboardShortcutCommand(toFreKey(event), box, editor);
    if (cmd !== PI_NULL_COMMAND) {
        let postAction;
        runInAction(() => {
            const action = event["action"];
            if (!!action) {
                action();
            }
            postAction = cmd.execute(box, toFreKey(event), editor, index);
        });
        if (!!postAction) {
            postAction();
        }
        // todo this method will stop the event from propagating, but does not prevent default!! Should it do so?
        event.stopPropagation();
    }
}
export function isOdd(n) {
    return (n & 1) === 1;
}
export function isEven(n) {
    return (n & 1) === 0;
}
export function componentId(box) {
    return `${box?.element?.freId()}-${box?.role}`;
}
export function setBoxSizes(box, rect) {
    if (box !== null && box !== undefined) {
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
export function replaceHTML(s) {
    return s.replace(/\s/g, '&nbsp;').replace(/\</, "&lt;");
}
