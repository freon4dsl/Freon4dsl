import { isPiExpression, PiExpression } from "../../language/index";
import { PiLogger, PiUtils } from "../../util/index";
import { Box } from "../boxes/index";
import { PiEditor } from "../PiEditor";
import {
    PiAction,
    PiPostAction,
    triggerToString2,
    PiActionTrigger
} from "./PiAction";
import { PI_NULL_COMMAND } from "./PiCommand";

const LOGGER = new PiLogger("PiCreateExpressionAction");

export class PiCreateExpressionAction extends PiAction {
    constructor(initializer?: Partial<PiCreateExpressionAction>) {
        super();
        PiUtils.initializeObject(this, initializer);
    }

    expressionBuilder: (box: Box, text: string, editor: PiEditor) => PiExpression;

    execute(box: Box, text: PiActionTrigger, editor: PiEditor): PiPostAction {
        LOGGER.log("execute expression action");
        const self = this;
        const selected = self.expressionBuilder(box, triggerToString2(text), editor);
        PiUtils.CHECK(isPiExpression(selected), "execute: expecting new element to be a PiExpression");
        // TODO New expression must be put in the model somewhere.
        return function () {
            editor.selectElement(selected, self.boxRoleToSelect, self.caretPosition);
        }
    }

    undo(box: Box, editor: PiEditor): void {
        console.error("PiCreateExpressionAction.undo is empty")
    }

    command(box: Box) {
        return PI_NULL_COMMAND;
    }
}
