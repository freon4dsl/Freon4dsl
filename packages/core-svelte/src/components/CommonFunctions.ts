import { runInAction } from "mobx";
import type { PiEditor, TextBox, Box } from "@projectit/core";

export function storeText(editor: PiEditor, text: string, textBox: TextBox) {
    // store the current value in the textbox, or delete the box, if appropriate
    runInAction(() => {
        if (textBox.deleteWhenEmpty && text.length === 0) {
            editor.deleteBox(textBox);
        } else if (text !== textBox.getText()) {
            textBox.setText(text);
        }
        // TODO set the new cursor through the editor
    });
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
