import { FreBinaryExpression } from "../../ast/index.js";
import { FreUtils } from "../../util/index.js";
import { Box } from "../boxes/index.js";
import { FreEditor } from "../FreEditor.js";
import { FreAction } from "./FreAction.js";
import { FreCommand } from "./FreCommand.js";
import { FreCreateBinaryExpressionCommand } from "./FreCreateBinaryExpressionCommand.js";


export class FreCreateBinaryExpressionAction extends FreAction {
    static create(initializer?: Partial<FreCreateBinaryExpressionAction>): FreCreateBinaryExpressionAction {
        const result = new FreCreateBinaryExpressionAction();
        FreUtils.initializeObject(result, initializer);
        return result;
    }

    /**
     * the function that creates the binary expression.
     */
    expressionBuilder: (box: Box, text: string, editor: FreEditor) => FreBinaryExpression;
    constructor() {
        super();
    }

    command(): FreCommand {
        return new FreCreateBinaryExpressionCommand(this.expressionBuilder);
    }
}
