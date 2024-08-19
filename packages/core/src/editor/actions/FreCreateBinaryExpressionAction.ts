import { FreBinaryExpression } from "../../ast";
import { FreUtils } from "../../util";
import { Box } from "../boxes";
import { FreEditor } from "../FreEditor";
import { FreAction } from "./FreAction";
import { FreCommand, FreCreateBinaryExpressionCommand } from "./FreCommand";

// import { FreLogger } from "../../logging";
// const LOGGER = new FreLogger("FreCreateBinaryExpressionAction");

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
