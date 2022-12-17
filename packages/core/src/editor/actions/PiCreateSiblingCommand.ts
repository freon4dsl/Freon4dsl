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
export class PiCreateSiblingCommand extends PiCommand {
    // propertyName: string;                   // The name of the property in which the created element will be stored.
    conceptName: string;                    // The name of the concept that will be created.
    referenceShortcut: ReferenceShortcut;   // todo
    boxRoleToSelect: string;

    constructor(conceptName: string, referenceShortcut: ReferenceShortcut, boxRoleToSelect?: string) {
        super();
        this.conceptName = conceptName;
        this.referenceShortcut = referenceShortcut;
        this.boxRoleToSelect = boxRoleToSelect;
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
        console.log("CreateSiblingCommand: trigger [" + triggerTypeToString(trigger) + "] part: " + this.conceptName + " refshort " + this.referenceShortcut);
        const ownerDescriptor = box.element.piOwnerDescriptor();
        let ownerConcept: string = ownerDescriptor.owner.piLanguageConcept();
        let propName: string = ownerDescriptor.propertyName;
        let theModelElement = ownerDescriptor.owner[propName];

        const newElement: PiElement = Language.getInstance().concept(this.conceptName)?.constructor();
        if (newElement === undefined || newElement === null) {
            // TODO Find out why this happens sometimes
            console.error("PiCreateSiblingCommand: Unexpected new element undefined");
            return EMPTY_POST_ACTION;
        }
        if (Language.getInstance().classifierProperty(ownerConcept, propName).isList) {
            theModelElement.splice(ownerDescriptor.propertyIndex + 1, 0, newElement);
        } else {
            theModelElement = newElement;
        }
        if (!!trigger && isString(trigger) && !!this.referenceShortcut) {
            newElement[this.referenceShortcut.propertyName] = Language.getInstance().referenceCreator(trigger, this.referenceShortcut.conceptName);
        }
        const self = this;
        if (!!this.boxRoleToSelect) {
            return function () {
                editor.selectElement(newElement, self.boxRoleToSelect);
            };
        } else {
            return function () {
                editor.selectElement(newElement);
                editor.selectFirstEditableChildBox();
            };
        }
    }

    undo(box: Box, editor: PiEditor) {}
}
