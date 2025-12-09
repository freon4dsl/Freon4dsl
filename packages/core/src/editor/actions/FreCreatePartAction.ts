import type { FreBinaryExpression, FreNode } from "../../ast/index.js";
import { FreLanguage } from "../../language/index.js";
import { BTREE, FreUtils } from "../../util/index.js";
import type { Box } from "../boxes/index.js";
import type { FreEditor } from "../FreEditor.js";
import { ACTION_LOGGER, EMPTY_POST_ACTION, FreAction } from "./FreAction.js";
import { isString, triggerTypeToString } from "./FreTriggers.js";
import type { FreTriggerUse } from "./FreTriggers.js";
import type { FrePostAction } from "./FreAction.js";

// import { FreLogger } from "../../logging";
// const LOGGER = new FreLogger("FreCreateElementAction");

export class FreCreatePartAction extends FreAction {
    /**
     * The property in which the new element should be stored.
     */
    propertyName: string;
    /**
     * The concept that should be created for the new element.
     * This concept should be of a type accepted by the property type of the `propertyName`.
     */
    conceptName: string;

    constructor(initializer?: Partial<FreCreatePartAction>) {
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
    execute(box: Box, trigger: FreTriggerUse, editor: FreEditor, index?: number): FrePostAction {
        // todo make index optional and set the default value to -1;
        ACTION_LOGGER.log(
            "CreatePartCommand: trigger [" +
            triggerTypeToString(trigger) +
            "] part: " +
            this.conceptName +
            " in " +
            this.propertyName +
            " index " +
            index +
            " refshort " +
            this.referenceShortcut +
            " parentbox " +
            box?.node?.freLanguageConcept(),
        );
        const ownerConcept: string = box.node.freLanguageConcept();
        const propName: string = this.propertyName;
        const theModelElement = box.node[propName];

        const newElement: FreNode = FreLanguage.getInstance().concept(this.conceptName)?.creator({});
        if (newElement === undefined || newElement === null) {
            // TODO Find out why this happens sometimes
            ACTION_LOGGER.error("ActionBox action: Unexpected new element undefined");
            return EMPTY_POST_ACTION;
        }
        ACTION_LOGGER.log(
            `FreCreatePartCommand: setting/adding to ${propName} of ${box.node.freId()} (${box.node.freLanguageConcept()}) to ${newElement.freId()} (${newElement.freLanguageConcept()})`,
        );
        if (FreLanguage.getInstance().classifierProperty(ownerConcept, propName).isList) {
            if (index >= 0) {
                theModelElement.splice(index, 0, newElement);
            } else {
                theModelElement.push(newElement);
            }
        } else {
            box.node[propName] = newElement;
        }
        if (!!trigger && isString(trigger) && !!this.referenceShortcut) {
            newElement[this.referenceShortcut.propertyName] = FreLanguage.getInstance().referenceCreator(
                trigger,
                this.referenceShortcut.conceptName,
            );
        }
        // Always rebalance for a binary expression
        if (newElement.freIsBinaryExpression()) {
            BTREE.balanceTree(newElement as FreBinaryExpression, editor);
        }
        return function () {
            // editor.selectElement(newElement);
            // tslint:disable-next-line:max-line-length
            ACTION_LOGGER.log(
                "CreatePartCommand: newElement:" +
                newElement.freId() +
                " " +
                newElement.freLanguageConcept() +
                ", selected element: " +
                editor.selectedBox.node.freId() +
                " of kind " +
                editor.selectedBox.kind,
            );
            editor.selectFirstEditableChildBox(newElement, true);
        };
    }
}
