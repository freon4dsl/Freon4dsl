import { action } from "mobx";
import { PiExpression } from "../language/PiExpression";
import { isPiExpression } from "../language/LanguageUtil";
import { PiLogger } from "../util/PiLogging";
import { PiUtils } from "../util/PiUtils";
import { Box } from "./boxes/Box";
import { InternalBehavior } from "./InternalBehavior";
import { PiExpressionCreator, PiTriggerType } from "./PiAction";
import { PiEditor } from "./PiEditor";

const LOGGER = new PiLogger("InternalExpressionBehavior");

export class InternalExpressionBehavior extends InternalBehavior implements PiExpressionCreator {
    expressionBuilder: (box: Box, aliasId: PiTriggerType, editor: PiEditor) => PiExpression;

    constructor(initializer?: Partial<InternalExpressionBehavior>) {
        super();
        PiUtils.initializeObject(this, initializer);
    }

    @action
    async execute(box: Box, aliasId: string, editor: PiEditor) {
        LOGGER.info(this, "execute expression alias ok");
        const selected = this.expressionBuilder(box, aliasId, editor);
        PiUtils.CHECK(isPiExpression(selected), "execute: expecting new element to be a PiExpression");
        editor.selectElement(selected, this.boxRoleToSelect, this.caretPosition);
    }
}

