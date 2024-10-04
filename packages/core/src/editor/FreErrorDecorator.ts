import {FreError} from "../validator/index.js";
import {FreNode} from "../ast/index.js";
import {isNullOrUndefined} from "../util/index.js";
import {Box, ElementBox} from "./boxes/index.js";
import {FreEditor} from "./FreEditor.js";
import {FreLogger} from "../logging/index.js";

const LOGGER: FreLogger = new FreLogger("FreErrorDecorator").mute();

// Margin, measure in number of pixels, used to identify whether boxes are on the same 'line'.
const LINE_HEIGHT_MARGIN: number = 6;

export class FreErrorDecorator {
    private myEditor: FreEditor;
    private previousList: FreError[] =[];

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
        //  upon every change
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
        // end of to be done

        // Set the new errors
        let erroneousBoxes: Box[] = [];
        // First set the errors in the box where they belong
        errors.forEach(err => {
            if (Array.isArray(err.reportedOn)) {
                err.reportedOn.forEach((x, index) => {
                    erroneousBoxes.push(...this.setErrorForNode(true, x, err.message, err.propertyName, index));
                })
            } else {
                erroneousBoxes.push(...this.setErrorForNode(true, err.reportedOn, err.message, err.propertyName));
            }
        });
        // Sort the erroneous boxes based on their y-coordinate, because we want to gather all messages on the same 'line'
        erroneousBoxes.sort((a, b: Box) => (a.actualY > b.actualY) ? 1 : -1);
        // Group the boxes
        let lines: Box[][] = [];
        let lineIndex: number = 0;
        let oldIndex: number = 0;
        for( let i: number = 0; i < erroneousBoxes.length; i++ ) {
            if (erroneousBoxes[i].actualY + LINE_HEIGHT_MARGIN < erroneousBoxes[i+1].actualY ) {
                lines[lineIndex] = erroneousBoxes.slice(oldIndex, i);
                oldIndex = i;
                lineIndex ++;
            }
        }
        console.log(`Found lines: 
            ${lines.map((line: Box[]) => `[${line.map(box => `${box.id} ${box.kind} ${box.errorMessages}`).join(', ')}]\n`
        )}`)
        // For each 'line' get the outermost box, i.e. the one of the left, and put all error messages
        // on the line in that box. Remove the error messages from the other boxes, but do not remove the 'hasError' marker.
        // The latter enables the styling of erroneous boxes, regardless of the presence of the error message.
        lines.forEach(line => {
            // Sort the boxes in a single line based on their x-coordinate.
            line.sort((a, b: Box) => (a.actualX > b.actualX) ? 1 : -1);
            // Get the left-most box
            let first = line[0];
            for( let i: number = 0; i < line.length; i++ ) {
                first.addErrorMessage(line[i].errorMessages)
                line[i].resetErrorMessages();
            }
        })
        console.log(`Found messages: 
            ${lines.map((line: Box[]) => `[${line.map(box => `${box.id} ${box.kind}  ${box.errorMessages}`).join(', ')}]\n`
        )}`)
    }

    private setErrorForNode(value: boolean, node: FreNode, errorMessage: string, propertyName?: string, propertyIndex?: number): Box[] {
        LOGGER.log(
            `setErrorOnElement ${node?.freLanguageConcept()} with id ${node?.freId()}, property: [${propertyName}, ${propertyIndex}]`
        );
        let result: Box[] = [];
        let box: Box = this.myEditor.findBoxForNode(node, propertyName, propertyIndex);
        if (!isNullOrUndefined(box)) {
            if (box instanceof ElementBox) {
                // box is an elementBox, which is not shown, therefore we set the error on its one and only child
                box = box.children[0];
            }
            console.log(`${value ? `SETTING` : `REMOVING`} error for ${box.role} ${box.kind}`)
            box.hasError = value;
            if (value) {
                box.addErrorMessage(errorMessage);
            } else {
                box.resetErrorMessages();
            }
            result.push(box);
        }
        return result;
    }
}
