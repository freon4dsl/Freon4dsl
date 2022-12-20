import { EMPTY_POST_ACTION, PiPostAction, ReferenceShortcut } from "./PiAction";
import { Box } from "../boxes";
import { isString, PiTriggerUse, triggerTypeToString } from "./PiTriggers";
import { PiEditor } from "../PiEditor";
import { PiElement } from "../../ast";
import { Language } from "../../language";
import { PiCommand } from "./PiCommand";

/**
 * Command to create a part (child) of a PiElement.
 * The PiElement of the box on which this command is executed shpould have a property with `propertyName` of
 * type `conceptName`.
 */
export class PiCreatePartCommand extends PiCommand {
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
    execute(box: Box, trigger: PiTriggerUse, editor: PiEditor, index: number): PiPostAction {
        // todo make index optional and set the default value to -1;
        console.log(
            "CreatePartCommand: trigger [" +
            triggerTypeToString(trigger) +
            "] part: " +
            this.conceptName +
            " in " +
            this.propertyName +
            " refshort " +
            this.referenceShortcut
        );
        let ownerConcept: string = box.element.piLanguageConcept();
        let propName: string = this.propertyName;
        let theModelElement = box.element[propName];

        const newElement: PiElement = Language.getInstance().concept(this.conceptName)?.constructor();
        if (newElement === undefined || newElement === null) {
            // TODO Find out why this happens sometimes
            console.error("ActionBox action: Unexpected new element undefined");
            return EMPTY_POST_ACTION;
        }
        console.log(`PiCreatePartCommand: setting/adding to ${propName} of ${box.element.piId()} (${box.element.piLanguageConcept()}) to ${newElement.piId()} (${newElement.piLanguageConcept()})`);
        if (Language.getInstance().classifierProperty(ownerConcept, propName).isList) {
            if (index >= 0) {
                theModelElement.splice(index, 0, newElement);
            } else {
                theModelElement.push(newElement);
            }
        } else {
            theModelElement = newElement;
        }
        if (!!trigger && isString(trigger) && !!this.referenceShortcut) {
            newElement[this.referenceShortcut.propertyName] = Language.getInstance().referenceCreator(trigger, this.referenceShortcut.conceptName);
        }

        return function () {
            editor.selectElement(newElement);
            console.log('CreatePartCommand: newElement:' + newElement.piId() + ", selected element: " + editor.selectedBox.element.piId() + " of kind " + editor.selectedBox.kind)
            editor.selectFirstEditableChildBox();
        };
    }

    undo(box: Box, editor: PiEditor) {}
}
