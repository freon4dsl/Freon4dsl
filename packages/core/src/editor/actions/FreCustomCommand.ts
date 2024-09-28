import { AST } from "../../change-manager/index.js";
import { Box } from "../boxes/index.js";
import { FreEditor } from "../FreEditor.js";
import { FreCaret } from "../util/index.js";
import { CustomAction, EMPTY_POST_ACTION, FrePostAction } from "./FreAction.js";
import { FreCommand } from "./FreCommand.js";
import { FreTriggerUse, triggerTypeToString } from "./FreTriggers.js";

export class FreCustomCommand extends FreCommand {
    boxRoleToSelect: string;
    caretPosition: FreCaret;
    action: CustomAction;

    constructor(action: CustomAction, boxRoleToSelect: string, caretPosition: FreCaret) {
        super();
        this.action = action;
        this.boxRoleToSelect = boxRoleToSelect;
        this.caretPosition = caretPosition;
    }

    execute(box: Box, trigger: FreTriggerUse, editor: FreEditor): FrePostAction {
        // FRECOMMAND_LOGGER.log("execute custom action, text is [" + trigger + "] refShort [" + this.referenceShortcut + "]" );
        console.log("FreCustomCommand: trigger [" + triggerTypeToString(trigger) + "]");
        const self = this;
        let selected
        AST.change( () => {
            selected = self.action(box, triggerTypeToString(trigger), editor);
        })
        if (!!selected) {
            if (!!self.boxRoleToSelect) {
                return function () {
                    console.log("FreCustomCommand select " + box.node.freLanguageConcept() + " box " + self.boxRoleToSelect);
                    editor.selectElementBox(selected, self.boxRoleToSelect, self.caretPosition);
                };
            } else {
                // Default: select the first editable child of the selected element
                return function () {
                    editor.selectFirstEditableChildBox(selected);
                };
            }
        }
        return EMPTY_POST_ACTION;
    }

    // @ts-ignore
    // parameters present to adhere to base class signature
    undo() {
        /* to be done */
    }
}
