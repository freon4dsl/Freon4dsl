import { action } from "mobx";
import { ParameterRef } from "../../../playground/dist/example/language/gen/ParameterRef";
import { PiElement } from "../language/PiElement";
import { PiLogger } from "../util/PiLogging";
import { PiUtils } from "../util/PiUtils";
import { Box } from "./boxes/Box";
import { InternalBehavior } from "./InternalBehavior";
import { PiCustomBehavior, PiTriggerType } from "./PiAction";
import { PiEditor } from "./PiEditor";

const LOGGER = new PiLogger("InternalCustomBehavior");

export class InternalCustomBehavior extends InternalBehavior implements PiCustomBehavior {
    action: (box: Box, text: string, editor: PiEditor) => PiElement | null;

    constructor(initializer?: Partial<InternalCustomBehavior>) {
        super();
        PiUtils.initializeObject(this, initializer);
    }

    @action
    execute(box: Box, text: string, editor: PiEditor): PiElement | null {
        LOGGER.info(this, "execute custom alias ok");
        LOGGER.log("    text is [" + text + "] refShort [" + this.referenceShortcut + "]" );
        const selected = this.action(box, text, editor);
        if (!!this.referenceShortcut && text !== this.trigger) {
            console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++")
        }
        // TODO fact or out undo
        if (!!selected) {
            editor.selectElement(selected, this.boxRoleToSelect, this.caretPosition);
        }
        return selected;
    }

    @action undo(box: Box, ed: PiEditor): void {
        console.error("InternalCustomBehavior.undo is empty")
    }
}
