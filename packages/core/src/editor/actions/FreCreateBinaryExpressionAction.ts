import { FreBinaryExpression } from "../../ast";
import { FreUtils } from "../../util";
import { FreLogger } from "../../logging";
import { Box } from "../boxes/index";
import { FreEditor } from "../FreEditor";
import { FreAction } from "./FreAction";
import { FreCommand, FreCreateBinaryExpressionCommand } from "./FreCommand";

const LOGGER = new FreLogger("FreCreateBinaryExpressionAction");

export class FreCreateBinaryExpressionAction extends FreAction {

    /**
     * the function that creates the binary expression.
     */
    expressionBuilder: (box: Box, text: string, editor: FreEditor) => FreBinaryExpression;

    static create(initializer?: Partial<FreCreateBinaryExpressionAction>): FreCreateBinaryExpressionAction {
        const result = new FreCreateBinaryExpressionAction();
        FreUtils.initializeObject(result, initializer);
        return result;
    }
    constructor() {
        super();
    }

    command(box: Box): FreCommand {
        return new FreCreateBinaryExpressionCommand(this.expressionBuilder);
    }

}
