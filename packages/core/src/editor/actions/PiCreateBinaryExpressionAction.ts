import { PiBinaryExpression } from "../../language/index";
import { BTREE, PiLogger, PiUtils } from "../../util/index";
import { Box } from "../boxes/index";
import { isString } from "../PiAction";
import { PiEditor } from "../PiEditor";
import {
    EMPTY_FUNCTION,
    PiAction,
    PiPostAction,
    PiActionTriggerType,
    triggerToString2,
    PiActionTrigger
} from "./PiAction";
import { PiCommand, PiCreateBinaryExpressionCommand } from "./PiCommand";

const LOGGER = new PiLogger("PiCreateBinaryExpressionAction");

export class PiCreateBinaryExpressionAction extends PiAction {

    constructor(initializer?: Partial<PiCreateBinaryExpressionAction>) {
        super();
        PiUtils.initializeObject(this, initializer);
    }

    expressionBuilder: (box: Box, text: string, editor: PiEditor) => PiBinaryExpression;

    execute(box: Box, trigger: PiActionTrigger, editor: PiEditor): PiPostAction {
        LOGGER.log("execute binary expression alias ok");
        const self = this;
        const selected = BTREE.insertBinaryExpression(self.expressionBuilder(box, triggerToString2(trigger), editor), box, editor);
        return function () {
            editor.selectElement(selected.element, selected.boxRoleToSelect, self.caretPosition);
        }
        return EMPTY_FUNCTION;
    }

    undo(box: Box, editor: PiEditor): void {
        console.error("PiCreateBinaryExpressionAction.undo is empty")
    }

    command(box: Box): PiCommand {
        return new PiCreateBinaryExpressionCommand(this.expressionBuilder);
    }

}
