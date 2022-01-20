import { PiBinaryExpression } from "../../language/index";
import { PiLogger, PiUtils } from "../../util/index";
import { Box } from "../boxes/index";
import { PiEditor } from "../PiEditor";
import { PiAction } from "./PiAction";
import { PiCommand, PiCreateBinaryExpressionCommand } from "./PiCommand";

const LOGGER = new PiLogger("PiCreateBinaryExpressionAction");

export class PiCreateBinaryExpressionAction extends PiAction {

    expressionBuilder: (box: Box, text: string, editor: PiEditor) => PiBinaryExpression;

    static create(initializer?: Partial<PiCreateBinaryExpressionAction>): PiCreateBinaryExpressionAction {
        const result = new PiCreateBinaryExpressionAction();
        PiUtils.initializeObject(result, initializer);
        return result;
    }
    constructor() {
        super();
    }

    command(box: Box): PiCommand {
        return new PiCreateBinaryExpressionCommand(this.expressionBuilder);
    }

}
