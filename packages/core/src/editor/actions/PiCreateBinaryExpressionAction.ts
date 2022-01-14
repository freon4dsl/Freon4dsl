import { PiBinaryExpression } from "../../language/index";
import { PiLogger, PiUtils } from "../../util/index";
import { Box } from "../boxes/index";
import { PiEditor } from "../PiEditor";
import { PiAction } from "./PiAction";
import { PiCommand, PiCreateBinaryExpressionCommand } from "./PiCommand";

const LOGGER = new PiLogger("PiCreateBinaryExpressionAction");

export class PiCreateBinaryExpressionAction extends PiAction {

    expressionBuilder: (box: Box, text: string, editor: PiEditor) => PiBinaryExpression;

    constructor(initializer?: Partial<PiCreateBinaryExpressionAction>) {
        super();
        PiUtils.initializeObject(this, initializer);
    }

    command(box: Box): PiCommand {
        return new PiCreateBinaryExpressionCommand(this.expressionBuilder);
    }

}
