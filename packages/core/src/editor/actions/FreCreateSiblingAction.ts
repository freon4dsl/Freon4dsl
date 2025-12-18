import type { FreNode } from "../../ast/index.js";
import { FreLanguage } from "../../language/index.js";
import { FreUtils } from "../../util/index.js";
import type { Box } from "../boxes/index.js";
import type { FreEditor } from "../FreEditor.js";
import { ACTION_LOGGER, EMPTY_POST_ACTION, FreAction } from "./FreAction.js";
import type { FrePostAction } from "./FreAction.js";
import type { FreTriggerUse } from "./FreTriggers.js";
import { isString, triggerTypeToString } from "./FreTriggers.js";

// import { FreLogger } from "../../logging";
// const LOGGER = new FreLogger("FreCreateSiblingAction");

export class FreCreateSiblingAction extends FreAction {
    /**
     * The concept that should be created for the new element.
     * This concept should be of a type accepted by the property where the element lof the box (see execute)
     * is stored.
     */
    conceptName: string;

    constructor(initializer?: Partial<FreCreateSiblingAction>) {
        super();
        FreUtils.initializeObject(this, initializer);
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
        ACTION_LOGGER.log(
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
            ACTION_LOGGER.error("FreCreateSiblingCommand: Unexpected new element undefined");
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

}
