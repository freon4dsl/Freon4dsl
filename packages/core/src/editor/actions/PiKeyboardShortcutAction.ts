import { PiElement } from "../../language/index";
import { ENTER, MetaKey, PiKey, PiLogger, PiUtils } from "../../util/index";
import { Box } from "../boxes/index";
import { PiEditor } from "../PiEditor";
import { PiAction } from "./PiAction";
import { PiCommand, PiCustomCommand } from "./PiCommand";

const LOGGER = new PiLogger("PiKeyboardShortcutAction");

export class PiKeyboardShortcutAction extends PiAction {

    action: (box: Box, text: PiKey, editor: PiEditor) => PiElement | null;

    constructor(initializer?: Partial<PiKeyboardShortcutAction>) {
        super();
        PiUtils.initializeObject(this, initializer);
    }

    command(box: Box): PiCommand {
        const act = (box: Box, text: string, editor: PiEditor) => { return this.action(box, {  meta: MetaKey.None, keyCode: ENTER},editor)};
        return new PiCustomCommand(act);
    }

}
