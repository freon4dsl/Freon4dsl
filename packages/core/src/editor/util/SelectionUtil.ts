// import { Box, isActionBox, isSelectBox, isTextBox } from "../boxes";
// import { wait } from "./PiEditorUtil";
// import { PiCaret } from "./PiCaret";
//
// export class SelectionUtil {
//     /**
//      * Returns the box that is visually above `box`.
//      * @param box
//      */
//     boxAbove(box: Box): Box {
//         wait(0);
//         const x = box.actualX + this.scrollX;
//         const y = box.actualY + this.scrollY;
//         let result: Box = box.nextLeafLeft;
//         let tmpResult = result;
//         LOGGER.log("boxAbove " + box.role + ": " + Math.round(x) + ", " + Math.round(y) + " text: " +
//             (isTextBox(box) ? box.getText() : "NotTextBox"));
//         while (result !== null) {
//             LOGGER.log("previous : " + result.role + "  " + Math.round(result.actualX + this.scrollX) + ", " + Math.round(result.actualY + this.scrollY));
//             if (PiEditor.isOnPreviousLine(tmpResult, result) && PiEditor.isOnPreviousLine(box, tmpResult)) {
//                 return tmpResult;
//             }
//             if (PiEditor.isOnPreviousLine(box, result)) {
//                 if (result.actualX <= x) {
//                     return result;
//                 }
//             }
//             const next = result.nextLeafLeft;
//             tmpResult = result;
//             result = next;
//         }
//         return result;
//     }
//
//     // TODO rethink the parameter 'box' in all of these methods => should work on currently selected box
//
//     /**
//      * Returns the box that is visually below `box`.
//      * @param box
//      */
//     boxBelow(box: Box): Box {
//         const x = box.actualX + this.scrollX;
//         const y = box.actualY + this.scrollX;
//         let result: Box = box.nextLeafRight;
//         let tmpResult = result;
//         LOGGER.log("boxBelow " + box.role + ": " + Math.round(x) + ", " + Math.round(y) + " text: " +
//             (isTextBox(box) ? box.getText() : "NotTextBox"));
//         while (result !== null) {
//             LOGGER.log("next : " + result.role + "  " + Math.round(result.actualX + this.scrollX) + ", " + Math.round(result.actualY + this.scrollY));
//             if (PiEditor.isOnNextLine(tmpResult, result) && PiEditor.isOnNextLine(box, tmpResult)) {
//                 LOGGER.log("Found box below 1 [" + (!!tmpResult ? tmpResult.role : "null") + "]");
//                 return tmpResult;
//             }
//             if (PiEditor.isOnNextLine(box, result)) {
//                 if (result.actualX + this.scrollX + result.actualWidth >= x) {
//                     LOGGER.log("Found box below 2 [" + (!!result ? result.role : "null") + "]");
//                     return result;
//                 }
//             }
//             const next = result.nextLeafRight;
//             tmpResult = result;
//             result = next;
//         }
//         LOGGER.log("Found box below 3 [ null ]");
//         return result;
//     }
//
//     selectBoxBelow(box: Box) {
//         const down = this.boxBelow(box);
//         if (down !== null && down !== undefined) {
//             this.selectBoxNew(down);
//         }
//     }
//
//     selectBoxAbove(box: Box) {
//         const up = this.boxAbove(box);
//         if (up !== null) {
//             this.selectBoxNew(up);
//         }
//     }
//     /**
//      * Sets the first editable/selectable child of the currently selected box to be the selected box.
//      * TODO question: what is the diff with the previous method?
//      */
//     selectFirstEditableChildBox() {
//         const first = this.selectedBox?.firstEditableChild;
//         if (!!first) {
//             this.selectBoxNew(first);
//         }
//     }
//
//     /**
//      * Sets the next sibling of the currently selected box to be the selected box.
//      * TODO what if there is no next sibling?
//      */
//     selectNextLeaf() {
//         const next = this.selectedBox?.nextLeafRight;
//         LOGGER.log("!!!!!!! Select next leaf is box " + next?.role);
//         if (!!next) {
//             this.selectBoxNew(next, PiCaret.LEFT_MOST);
//             // if (isTextBox(next) || isSelectBox(next)) {
//             //     next.setCaret(PiCaret.LEFT_MOST);
//             // }
//         }
//     }
//
//     /**
//      * Sets the previous sibling of the currently selected box to be the selected box.
//      * TODO what if there is no previous sibling?
//      */
//     selectPreviousLeaf() {
//         // console.log("selectPreviosLeaf, selected is: " + this.selectedBox?.role)
//         const previous = this.selectedBox?.nextLeafLeft;
//         // console.log("Previous is " + previous);
//         if (!!previous) {
//             this.selectBoxNew(previous, PiCaret.RIGHT_MOST);
//             previous.setFocus();
//             // if (isTextBox(previous) || isSelectBox(previous)) {
//             //     LOGGER.log("!!!!!!! selectPreviousLeaf set caret to RIGHTMOST ");
//             //     previous.setCaret(PiCaret.RIGHT_MOST);
//             // }
//         }
//     }
//
//     /**
//      * Finds a new box for the element attached to 'box' within the projection, and selects this one.
//      * TODO more explanation why this is needed
//      * @param box
//      * @param caretPosition
//      */
//     selectBoxNew(box: Box, caretPosition?: PiCaret) {
//         LOGGER.log("SelectBoxNEW: " + (box ? box.role : box) + "  caret " + caretPosition?.position + " NOSELECT[" + this.NOSELECT + "]");
//         if (this.NOSELECT) {
//             return;
//         }
//         this.selectBox(this._rootBox.findBox(box.element.piId(), box.role), caretPosition);
//     }
//     // A series of setters for _selectedBox
//
//     // TODO this method is unused, remove?
//     selectBoxByRoleAndElementId(elementId: string, role: string) {
//         LOGGER.log("selectBoxByRoleAndElementId " + elementId + "  role " + role);
//         if (this.NOSELECT) {
//             return;
//         }
//         this.selectBox(this._rootBox.findBox(elementId, role));
//     }
//
//     /**
//      * Sets the parent of the currently selected box to be the selected box.
//      */
//     selectParentBox() {
//         LOGGER.log("==> SelectParent of " + this.selectedBox?.role + this.selectedBox?.parent.kind);
//         let parent = this.selectedBox?.parent;
//         if (!!parent && (isActionBox(parent) || isSelectBox(parent))) {
//             // Coming from (hidden) textbox in Select/Action box
//             parent = parent.parent;
//         }
//         if (!!parent) {
//             if (parent.selectable) {
//                 this.selectBoxNew(parent);
//             } else {
//                 this.selectBoxNew(parent);
//                 this.selectParentBox();
//             }
//         }
//     }
//
//     /**
//      * Sets the first editable/selectable child of the currently selected box to be the selected box.
//      */
//     selectFirstLeafChildBox() {
//         const first = this.selectedBox?.firstLeaf;
//         if (!!first) {
//             this.selectBoxNew(first);
//         }
//     }
//
//
//     /**
//      * TODO
//      * @param box
//      * @param caretPosition
//      * @private
//      */
//     private selectBox(box: Box | null, caretPosition?: PiCaret) {
//         if (this.NOSELECT) {
//             return;
//         }
//         if (box === null || box === undefined) {
//             console.error("PiEditor.selectBox is null !");
//             return;
//         }
//         LOGGER.log("selectBox: " + (!!box ? box.role : box) + " caret " + caretPosition?.position);
//         if (box === this.selectedBox) {
//             LOGGER.info("box already selected");
//             return;
//         }
//         if (isActionBox(box)) {
//             this.selectedBox = box.textBox;
//         } else {
//             this.selectedBox = box;
//         }
//         LOGGER.log("selectBox: select box " + this.selectedBox.role + " caret position: " + (!!caretPosition ? caretPosition.position : "undefined"));
//         if (isTextBox(box) || isActionBox(box) || isSelectBox(box)) {
//             if (!!caretPosition) {
//                 LOGGER.log("caret position is " + caretPosition.position);
//                 box.setCaret(caretPosition);
//             } else {
//                 LOGGER.log("caret position is empty");
//                 box.setCaret(PiCaret.RIGHT_MOST);
//             }
//         }
//         this.refreshComponentSelection();
//         // we do not set focus, see the comment for the setFocus method in Box.ts
//     }
//
//     /**
//      * Sets the selected box programmatically, and adjusts the selected element as well.
//      * @param box
//      */
//     set selectedBox(box: Box) { // TODO question how does this method relate to the other setters for _selectedBox? The check on ActionBox is also there.
//         LOGGER.log("selectedBox:  set selected box to: " + (!!box ? box.role : "null") + "  NOSELECT [" + this.NOSELECT + "]");
//         if (this.NOSELECT) {
//             return;
//         }
//
//         if (!!box && isActionBox(box)) {
//             this._selectedBox = box.textBox;
//         } else {
//             this._selectedBox = box;
//         }
//         if (!!this._selectedBox) {
//             this._selectedElement = this._selectedBox.element;
//         }
//         this.refreshComponentSelection();
//         LOGGER.log("SELECTED [" + this._selectedBox.role + "] elem [" + this?._selectedElement?.piLanguageConcept() + "]")
//     }
//
//     // Static helper methods
//
//     /**
//      * Returns true when 'other' is on the line above 'ref'.
//      * @param ref
//      * @param other
//      * @private
//      */
//
//     private static isOnPreviousLine(ref: Box, other: Box): boolean {
//         const margin = 5;
//         return other.actualY + margin < ref.actualY;
//     }
//
//     /**
//      * Returns true when 'other' is on the line below 'ref'.
//      * @param ref
//      * @param other
//      * @private
//      */
//     private static isOnNextLine(ref: Box, other: Box): boolean {
//         return this.isOnPreviousLine(other, ref);
//     }
// }
