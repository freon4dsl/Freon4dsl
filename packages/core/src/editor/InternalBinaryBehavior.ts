import { action } from "mobx";
import { PiBinaryExpression } from "../language/PiBinaryExpression";
import { BTREE } from "../util/BalanceTreeUtils";
import { PiLogger } from "../util/PiLogging";
import { PiUtils } from "../util/PiUtils";
import { Box } from "./boxes/Box";
import { InternalBehavior } from "./InternalBehavior";
import { PiBinaryExpressionCreator, PiTriggerType } from "./PiAction";
import { PiEditor } from "./PiEditor";

const LOGGER = new PiLogger("InternalBinaryBehavior");

export class InternalBinaryBehavior extends InternalBehavior implements PiBinaryExpressionCreator {
    expressionBuilder: (box: Box, aliasId: PiTriggerType, editor: PiEditor) => PiBinaryExpression;

    constructor(initializer?: Partial<InternalBinaryBehavior>) {
        super();
        PiUtils.initializeObject(this, initializer);
    }

    @action
    async execute(box: Box, aliasId: string, editor: PiEditor) {
        LOGGER.info(this, "execute binary expression alias ok");
        const selected = BTREE.insertBinaryExpression(this.expressionBuilder(box, aliasId, editor), box, editor);
        editor.selectElement(selected.element, selected.boxRoleToSelect, this.caretPosition);
    }
}
