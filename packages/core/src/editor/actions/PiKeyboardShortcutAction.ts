import { PiElement } from "../../language/index";
import { PiKey, PiLogger, PiUtils } from "../../util/index";
import { Box } from "../boxes/index";
import { isProKey } from "../PiAction";
import { PiEditor } from "../PiEditor";
import { EMPTY_FUNCTION, PiAction, PiPostAction, PiActionTriggerType, PiActionTrigger } from "./PiAction";
import { PI_NULL_COMMAND, PiCommand } from "./PiCommand";

const LOGGER = new PiLogger("PiKeyboardShortcutAction");

export class PiKeyboardShortcutAction extends PiAction {

    action: (box: Box, text: PiKey, editor: PiEditor) => PiElement | null;

    constructor(initializer?: Partial<PiKeyboardShortcutAction>) {
        super();
        PiUtils.initializeObject(this, initializer);

    }

    execute(box: Box, trigger: PiActionTrigger, editor: PiEditor): PiPostAction {
        LOGGER.log("execute binary expression action");
        const self = this;
        if (isProKey(trigger)) {
            self.action(box, trigger, editor)
        }
        return EMPTY_FUNCTION;
    }

    undo(box: Box, editor: PiEditor): void {
        console.error("PiKeyboardShortcutAction.undo is empty")
    }

    command(box: Box): PiCommand {
        return PI_NULL_COMMAND;
    }

}
