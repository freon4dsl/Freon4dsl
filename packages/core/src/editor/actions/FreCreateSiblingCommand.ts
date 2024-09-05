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
export class FreCreateSiblingCommand extends FreCommand {
    // propertyName: string;                   // The name of the property in which the created element will be stored.
    conceptName: string; // The name of the concept that will be created.
    referenceShortcut: ReferenceShortcut; // todo
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
    execute(box: Box, trigger: FreTriggerUse, editor: FreEditor): FrePostAction {
        // todo make index optional and set the default value to -1;
        console.log(
            "CreateSiblingCommand: trigger [" +
                triggerTypeToString(trigger) +
                "] part: " +
                this.conceptName +
                " refshort " +
                this.referenceShortcut,
        );
        const ownerDescriptor = box.node.freOwnerDescriptor();
        const ownerConcept: string = ownerDescriptor.owner.freLanguageConcept();
        const propName: string = ownerDescriptor.propertyName;
        let theModelElement = ownerDescriptor.owner[propName];

        const newElement: FreNode = FreLanguage.getInstance().concept(this.conceptName)?.creator({});
        if (newElement === undefined || newElement === null) {
            // TODO Find out why this happens sometimes
            console.error("FreCreateSiblingCommand: Unexpected new element undefined");
            return EMPTY_POST_ACTION;
        }
        if (FreLanguage.getInstance().classifierProperty(ownerConcept, propName).isList) {
            theModelElement.splice(ownerDescriptor.propertyIndex + 1, 0, newElement);
        } else {
            theModelElement = newElement;
        }
        if (!!trigger && isString(trigger) && !!this.referenceShortcut) {
            newElement[this.referenceShortcut.propertyName] = FreLanguage.getInstance().referenceCreator(
                trigger,
                this.referenceShortcut.conceptName,
            );
        }
        const self = this;
        if (!!this.boxRoleToSelect) {
            return function () {
                editor.selectElementBox(newElement, self.boxRoleToSelect);
            };
        } else {
            return function () {
                editor.selectElement(newElement);
                editor.selectFirstEditableChildBox(newElement);
            };
        }
    }

    // @ts-ignore
    // parameters present to adhere to base class signature
    undo(box: Box, editor: FreEditor) {
        /* to be done */
    }
}
