import { action } from "mobx";
import { PiBinaryExpression } from "../language/PiBinaryExpression";
import { PiElement } from "../language/PiElement";
import { BTREE } from "../util/BalanceTreeUtils";
import { PiLogger } from "../util/PiLogging";
import { PiUtils } from "../util/PiUtils";
import { Box } from "./boxes/Box";
import { InternalBehavior } from "./InternalBehavior";
import { PiBinaryExpressionCreator, PiTriggerType } from "./PiAction";
import { PiEditor } from "./PiEditor";

const LOGGER = new PiLogger("InternalBinaryBehavior");

export class InternalBinaryBehavior extends InternalBehavior implements PiBinaryExpressionCreator {
    expressionBuilder: (box: Box, text: string, editor: PiEditor) => PiBinaryExpression;

    constructor(initializer?: Partial<InternalBinaryBehavior>) {
        super();
        PiUtils.initializeObject(this, initializer);
    }

    @action
    execute(box: Box, text: string, editor: PiEditor): PiElement | null {
        LOGGER.info(this, "execute binary expression alias ok");
        const selected = BTREE.insertBinaryExpression(this.expressionBuilder(box, text, editor), box, editor);
        editor.selectElement(selected.element, selected.boxRoleToSelect, this.caretPosition);
        return selected.element;
    }

    undo(box: Box, editor: PiEditor): void {
        console.error("InternalBinaryBehavior.undo is empty")
    }

}
