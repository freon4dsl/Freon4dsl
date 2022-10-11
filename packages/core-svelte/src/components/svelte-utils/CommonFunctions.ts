import type { Box } from "@projectit/core";
import { PI_NULL_COMMAND, PiCommand, PiEditor, PiEditorUtil, PiPostAction, toPiKey } from "@projectit/core";
import { runInAction } from "mobx";

export function executeCustomKeyboardShortCut(event: KeyboardEvent, index: number, box: Box, editor: PiEditor) {
    const cmd: PiCommand = PiEditorUtil.findKeyboardShortcutCommand(toPiKey(event), box, editor);
    if (cmd !== PI_NULL_COMMAND) {
        let postAction: PiPostAction;
        runInAction(() => {
            const action = event["action"];
            if (!!action) {
                action();
            }
            postAction = cmd.execute(box, toPiKey(event), editor, index);
        });
        if (!!postAction) {
            postAction();
        }
        // todo this method will stop the event from propagating, but does not prevent default!! Should it do so?
        event.stopPropagation();
    }
}

export function isOdd(n: number): boolean {
    return (n & 1) === 1;
}
export function isEven(n: number): boolean {
    return (n & 1) === 0;
}

export function setBoxSizes(box: Box, rect: DOMRect) {
    if (box !== null && box !== undefined) {
        box.actualX = rect.left;
        box.actualY = rect.top;
        box.actualHeight = rect.height;
        box.actualWidth = rect.width;
        // XLOGGER.log("   actual is (" + Math.round(box.actualX) + ", " + Math.round(box.actualY) + ")");
    }
}

/** Dispatch event on click outside of node */
// TODO Should use https://svelte.dev/repl/dae848c2157e48ab932106779960f5d5?version=3.19.2
export function clickOutside(node) {

    const handleClick = event => {
        if (node && !node.contains(event.target) && !event.defaultPrevented) {
            node.dispatchEvent(
                new CustomEvent('click_outside', node)
            )
        }
    }

    document.addEventListener('click', handleClick, true);
    document.addEventListener('contextmenu', handleClick, true);

    return {
        destroy() {
            document.removeEventListener('click', handleClick, true);
        }
    }
}
