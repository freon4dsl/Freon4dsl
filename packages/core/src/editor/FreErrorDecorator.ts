import {FreError} from "../validator/index.js";
import {FreNode} from "../ast/index.js";
import {isNullOrUndefined} from "../util/index.js";
import {Box, ElementBox, isActionBox, isSelectBox, isTextBox} from "./boxes/index.js";
import {FreEditor} from "./FreEditor.js";
import {FreLogger} from "../logging/index.js";

const LOGGER: FreLogger = new FreLogger("FreErrorDecorator").mute();

// Margin, measure in number of pixels, used to identify whether boxes are on the same 'line'.
const LINE_HEIGHT_MARGIN: number = 6;

export class FreErrorDecorator {
    private myEditor: FreEditor;
    // The list of errors from the previous run of the validator
    private previousList: FreError[] =[];
    // The list of erroneous boxes from the latest run of the validator
    private erroneousBoxes: Box[] = [];

    constructor(editor: FreEditor) {
        this.myEditor = editor;
    }

    /**
     * This method makes sure that for all boxes that display nodes that are in the error list,
     * the hasError setter is being called.
     * @param errors
     */
    setErrors(errors: FreError[]) {
        // todo this method of removing old errors should be changed when nodes are validated
        //  upon every AST change
        // Remove all old errors
        this.previousList.forEach(err => {
            if (Array.isArray(err.reportedOn)) {
                err.reportedOn.forEach((x, index) => {
                    this.setErrorForNode(false, x, '', err.propertyName, index);
                })
            } else {
                this.setErrorForNode(false, err.reportedOn, '', err.propertyName);
            }
        });
        // Remember the errors
        this.previousList = errors;
        // Clear the previous erroneous boxes
        this.erroneousBoxes = [];
        // end of to be done

        // Set the new errors
        // First set the errors in the box where they belong
        errors.forEach(err => {
            if (Array.isArray(err.reportedOn)) {
                err.reportedOn.forEach((x, index) => {
                    this.setErrorForNode(true, x, err.message, err.propertyName, index);
                })
            } else {
                this.setErrorForNode(true, err.reportedOn, err.message, err.propertyName);
            }
        });
        this.gatherMessagesForGutter();
    }

    private setErrorForNode(value: boolean, node: FreNode, errorMessage: string, propertyName?: string, propertyIndex?: number) {
        LOGGER.log(
            `setErrorOnElement ${node?.freLanguageConcept()} with id ${node?.freId()}, property: [${propertyName}, ${propertyIndex}]`
        );
        let box: Box = this.myEditor.findBoxForNode(node, propertyName, propertyIndex);
        if (!isNullOrUndefined(box)) {
            if (box instanceof ElementBox) {
                // box is an elementBox, which is not shown, therefore we set the error on its one and only child
                box = box.children[0];
            }
            // console.log(`${value ? `SETTING` : `REMOVING`} error for ${box.id} ${box.role} ${box.kind}`)
            box.hasError = value;
            if (value) {
                box.addErrorMessage(errorMessage);
            } else {
                if (isTextBox(box) || isActionBox(box) || isSelectBox(box)) {
                    box.isFirstInLine = false;
                }
                box.resetErrorMessages();
            }
            // console.log(`${value ? `SETTING` : `REMOVING`} error for ${box.id} ${box.role} ${box.kind}: ${box.hasError}`)
        }
        if (!this.erroneousBoxes.includes(box)) {
            this.erroneousBoxes.push(box);
        }
    }

    public gatherMessagesForGutter() {
        if (isNullOrUndefined(this.erroneousBoxes[0]) || isNullOrUndefined(this.erroneousBoxes[0].actualY) || this.erroneousBoxes[0].actualY === -1) {
            // Too early, wait for the rendering to be done
            // console.log("Setting errors: gathering for gutter - TOO EARLY")
            return;
        }
        // Sort the erroneous boxes based on their y-coordinate, because we want to gather all messages on the same 'line'
        this.erroneousBoxes.sort((a, b: Box) => (a.actualY > b.actualY) ? 1 : -1);
        // Group the boxes per 'line'
        let lines: Box[][] = [];
        let lineIndex: number = 0;
        let prevLineEnd: number = 0;
        for (let i: number = 0; i < this.erroneousBoxes.length - 1; i++) {
            if (this.erroneousBoxes[i].actualY < this.erroneousBoxes[i + 1].actualY - LINE_HEIGHT_MARGIN) { // found line end
                lines[lineIndex++] = this.erroneousBoxes.slice(prevLineEnd, i + 1);
                prevLineEnd = i + 1;
            }
        }
        // Make the final line
        lines[lineIndex] = this.erroneousBoxes.slice(prevLineEnd, this.erroneousBoxes.length - 1);

//         console.log(`Found lines:
// ${lines.map((line: Box[]) => `[${line.map(box => `${box.id} ${box.kind} \t\n${box.errorMessages.map(err => `${err}`).join("\t\n")}`).join(', \n')}]\n`
//         ).join('\n')}`)

        // For each 'line' get the box on the left, and put all error messages on the line in that box.
        // Remove the error messages from the other boxes, but do not remove the 'hasError' marker.
        // The latter enables the styling of erroneous boxes, regardless of the presence of the error message.
        let outerIndex = 0;
        lines.forEach(line => {
            outerIndex++;
            // Sort the boxes in a single line based on their x-coordinate.
            line.sort((a, b: Box) => (a.actualX > b.actualX) ? 1 : -1);
            // Get the left-most box
            let first = line[0];
            for( let i: number = 1; i < line.length; i++ ) {
                first.addErrorMessage(line[i].errorMessages);
                // Leave the message in any type of box that is displayed by a TextComponent or TextDropdownComponent
                if (!isTextBox(line[i]) && !isActionBox(line[i]) && !isSelectBox(line[i])) {
                    line[i].resetErrorMessages();
                }
            }
            if (isTextBox(first) || isActionBox(first) || isSelectBox(first)) {
                first.isFirstInLine = true;
                console.log(`setting ${first.id} as first in line ${outerIndex}`)
            }
        })
    }
}
