import { EMPTY_POST_ACTION, FrePostAction, ReferenceShortcut } from "./FreAction";
import { Box } from "../boxes";
import { isString, FreTriggerUse, triggerTypeToString } from "./FreTriggers";
import { FreEditor } from "../FreEditor";
import { FreNode } from "../../ast";
import { FreLanguage } from "../../language";
import { FreCommand } from "./FreCommand";

/**
 * Command to create a part (child) of a FreElement.
 * The FreElement of the box on which this command is executed shpould have a property with `propertyName` of
 * type `conceptName`.
 */
export class FreCreatePartCommand extends FreCommand {
    propertyName: string;                   // The name of the property in which the created element will be stored.
    conceptName: string;                    // The name of the concept that will be created.
    referenceShortcut: ReferenceShortcut;   // todo

    constructor(propertyName: string, conceptName: string, referenceShortcut: ReferenceShortcut) {
        super();
        this.propertyName = propertyName;
        this.conceptName = conceptName;
        this.referenceShortcut = referenceShortcut;
        console.log("+++++++++++++++ Create part command " + propertyName + ", " + conceptName);
    }

    /**
     *
     * @param box
     * @param trigger
     * @param editor
     * @param index If the property is a list, the index in the list at which the created element will be stored.
     */
    execute(box: Box, trigger: FreTriggerUse, editor: FreEditor, index: number): FrePostAction {
        // todo make index optional and set the default value to -1;
        console.log(
            "CreatePartCommand: trigger [" +
            triggerTypeToString(trigger) +
            "] part: " +
            this.conceptName +
            " in " +
            this.propertyName +
            " refshort " +
            this.referenceShortcut +
            " parentbox " + box?.element?.freLanguageConcept()
        );
        const ownerConcept: string = box.element.freLanguageConcept();
        const propName: string = this.propertyName;
        const theModelElement = box.element[propName];

        const newElement: FreNode = FreLanguage.getInstance().concept(this.conceptName)?.constructor();
        if (newElement === undefined || newElement === null) {
            // TODO Find out why this happens sometimes
            console.error("ActionBox action: Unexpected new element undefined");
            return EMPTY_POST_ACTION;
        }
        console.log(`FreCreatePartCommand: setting/adding to ${propName} of ${box.element.freId()} (${box.element.freLanguageConcept()}) to ${newElement.freId()} (${newElement.freLanguageConcept()})`);
        if (FreLanguage.getInstance().classifierProperty(ownerConcept, propName).isList) {
            if (index >= 0) {
                theModelElement.splice(index, 0, newElement);
            } else {
                theModelElement.push(newElement);
            }
        } else {
            box.element[propName] = newElement;
        }
        if (!!trigger && isString(trigger) && !!this.referenceShortcut) {
            newElement[this.referenceShortcut.propertyName] = FreLanguage.getInstance().referenceCreator(trigger, this.referenceShortcut.conceptName);
        }

        return function () {
            // editor.selectElement(newElement);
            // tslint:disable-next-line:max-line-length
            console.log("CreatePartCommand: newElement:" + newElement.freId() + " " + newElement.freLanguageConcept() + ", selected element: " + editor.selectedBox.element.freId() + " of kind " + editor.selectedBox.kind);
            editor.selectFirstEditableChildBox(newElement);
        };
    }

    undo(box: Box, editor: FreEditor) { /* to be done */ }
}
