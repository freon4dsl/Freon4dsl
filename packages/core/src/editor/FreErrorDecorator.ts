import {FreError} from "../validator";
import {FreNode} from "../ast";
import {isNullOrUndefined} from "../util";
import {Box, ElementBox} from "./boxes";
import {FreEditor} from "./FreEditor";
import {FreLogger} from "../logging";

const LOGGER: FreLogger = new FreLogger("FreErrorDecorator").mute();

export class FreErrorDecorator {
    private myEditor: FreEditor;
    private previousList: FreError[] =[];

    constructor(editor: FreEditor) {
        this.myEditor = editor;
    }

    /**
     * This method makes sure that for all boxes that display nodes that are in the error list,
     * the hasError setter is being called.
     * @param list
     */
    setErrors(list: FreError[]) {
        // remove all old errors
        this.previousList.forEach(err => {
            if (Array.isArray(err.reportedOn)) {
                err.reportedOn.forEach((x, index) => {
                    this.setErrorForNode(false, x, '', err.propertyName, index);
                })
            } else {
                this.setErrorForNode(false, err.reportedOn, '', err.propertyName);
            }
        });
        // set the new errors
        list.forEach(err => {
            if (Array.isArray(err.reportedOn)) {
                err.reportedOn.forEach((x, index) => {
                    this.setErrorForNode(true, x, err.message, err.propertyName, index);
                })
            } else {
                this.setErrorForNode(true, err.reportedOn, err.message, err.propertyName);
            }
        });
        // remember the errors
        this.previousList = list;
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
            console.log(`${value ? `SETTING` : `REMOVING`} error for ${box.role} ${box.kind}`)
            box.hasError = value;
            box.errorMessage = errorMessage;
        }
    }
}
