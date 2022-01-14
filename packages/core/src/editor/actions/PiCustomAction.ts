import { PiElement } from "../../language/index";
import { Language } from "../../storage/index";
import { PiLogger, PiUtils } from "../../util/index";
import { Box } from "../boxes/index";
import { isString } from "../PiAction";
import { PiEditor } from "../PiEditor";
import {
    EMPTY_FUNCTION,
    PiAction,
    PiPostAction,
    PiActionTrigger,
    CustomAction
} from "./internal";
import { PI_NULL_COMMAND, PiCommand, PiCustomCommand } from "./PiCommand";

const LOGGER = new PiLogger("PiCustomAction");

export class PiCustomAction extends PiAction {

    action: CustomAction;

    constructor(initializer?: Partial<PiCustomAction>) {
        super();
        PiUtils.initializeObject(this, initializer);
    }

    execute(box: Box, text: PiActionTrigger, editor: PiEditor): PiPostAction {
        LOGGER.log("execute custom action, text is [" + text + "] refShort [" + this.referenceShortcut + "]" );
        if (isString(text)) {
            const self = this;
            const selected = self.action(box, text, editor);

            if (!!selected) {
                return function() {
                    editor.selectElement(selected, self.boxRoleToSelect, self.caretPosition);
                }
            }
        }
        return EMPTY_FUNCTION;
    }

    undo(box: Box, ed: PiEditor): void {
        console.error("PiCustomAction.undo is empty")
    }

    command(box: Box): PiCommand {
        return new PiCustomCommand(this.action);
    }

}
