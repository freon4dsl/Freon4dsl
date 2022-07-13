import { PiBinaryExpression } from "../../ast";
import { PiUnaryExpression } from "../../ast/PiUnaryExpression";
import { PiUtils } from "../../util";
import { PiLogger } from "../../logging";
import { Box } from "../boxes/index";
import { PiEditor } from "../PiEditor";
import { PiAction } from "./PiAction";
import { PiCommand, PiCreateBinaryExpressionCommand, PiCreateUnaryExpressionCommand } from "./PiCommand";

const LOGGER = new PiLogger("PiCreateUnaryExpressionAction");

export class PiCreateUnaryExpressionAction extends PiAction {

    /**
     * the function that creates the binary expression.
     */
    expressionBuilder: (box: Box, text: string, editor: PiEditor) => PiUnaryExpression;

    static create(initializer?: Partial<PiCreateUnaryExpressionAction>): PiCreateUnaryExpressionAction {
        const result = new PiCreateUnaryExpressionAction();
        PiUtils.initializeObject(result, initializer);
        return result;
    }
    constructor() {
        super();
    }

    command(box: Box): PiCommand {
        return new PiCreateUnaryExpressionCommand(this.expressionBuilder);
    }

}
