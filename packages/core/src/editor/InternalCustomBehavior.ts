import { action } from "mobx";
import { PiElement } from "../language/PiElement";
import { PiLogger } from "../util/PiLogging";
import { PiUtils } from "../util/PiUtils";
import { Box } from "./boxes/Box";
import { InternalBehavior } from "./InternalBehavior";
import { PiCustomBehavior, PiTriggerType } from "./PiAction";
import { PiEditor } from "./PiEditor";

const LOGGER = new PiLogger("InternalCustomBehavior");

export class InternalCustomBehavior extends InternalBehavior implements PiCustomBehavior {
    action: (box: Box, aliasId: PiTriggerType, editor: PiEditor) => PiElement | null;

    constructor(initializer?: Partial<InternalCustomBehavior>) {
        super();
        PiUtils.initializeObject(this, initializer);
    }

    @action
    async execute(box: Box, aliasId: string, editor: PiEditor) {
        LOGGER.info(this, "execute custom alias ok");
        const selected = this.action(box, aliasId, editor);
        if (selected) {
            editor.selectElement(selected, this.boxRoleToSelect, this.caretPosition);
        }
    }
}
