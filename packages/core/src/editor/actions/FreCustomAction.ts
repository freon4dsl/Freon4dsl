import { AST } from "../../change-manager/index.js";
import { FreUtils } from "../../util/index.js";
import type { Box } from "../boxes/index.js";
import type { FreEditor } from "../FreEditor.js";
import type { CustomAction, FreTriggerUse, FrePostAction } from "../index.js";
import {
    FreAction,
    triggerTypeToString,
    ACTION_LOGGER
} from "./internal.js";

export class FreCustomAction extends FreAction {
    static create(initializer?: Partial<FreCustomAction>) {
        const result = new FreCustomAction();
        FreUtils.initializeObject(result, initializer);
        return result;
    }
    /**
     * The action function that will be performed
     */
    action: CustomAction;

    constructor() {
        super();
    }

    /**
     * @see FreAction.execute
     * @param box
     * @param trigger
     * @param editor
     */
    override execute(box: Box, trigger: FreTriggerUse, editor: FreEditor): FrePostAction {
        ACTION_LOGGER.log("FreCustomCommand: trigger [" + triggerTypeToString(trigger) + "]");
        ACTION_LOGGER.log("FreCustomCommand: action [" + this.action + "]");
        const self = this;
        let selected
        AST.change( () => {
            selected = self.action(box, triggerTypeToString(trigger), editor);
        })
        if (!!selected) {
            if (!!self.boxRoleToSelect) {
                return function () {
                    ACTION_LOGGER.log("FreCustomCommand select " + box.node.freLanguageConcept() + " box " + self.boxRoleToSelect);
                    editor.selectElementBox(selected, self.boxRoleToSelect, self.caretPosition);
                };
            } else {
                // Default: select the first editable child of the selected element
                return function () {
                    ACTION_LOGGER.log("editor.selectFirstEditableChildBox(selected) ");
                    editor.selectFirstEditableChildBox(selected);
                };
            }
        }
        return function(): void {
            // TODO "REFERENCE" is a quickfix to get the selection correct
            if (self.boxRoleToSelect === "REFERENCE") {
                const index = (box.node[box.propertyName] as Array<any>).length -1
                // const empty = editor.findBoxForNode(box.node, box.propertyName)
                editor.selectElement(box.node, box.propertyName, index)
                editor.selectNextLeaf()
                ACTION_LOGGER.log(`REFERENCE node ${box.node.freId()} prop ${box.propertyName} index ${index}`)
            }
        }
        // return EMPTY_POST_ACTION;
    }

}
