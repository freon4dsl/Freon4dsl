import { FreBinaryExpression } from "../../ast/index";
import { AST } from "../../change-manager/index";
import { BTREE, FRE_BINARY_EXPRESSION_LEFT, Selected } from "../../util/index";
import { Box } from "../boxes/index";
import { FreEditor } from "../FreEditor";
import { FreCaret } from "../util/index";
import { FrePostAction } from "./FreAction";
import { FreCommand, FRECOMMAND_LOGGER } from "./FreCommand";
import { FreTriggerUse, triggerTypeToString } from "./FreTriggers";

export type FreBinaryExpressionBuilder = (box: Box, text: string, editor: FreEditor) => FreBinaryExpression;

export class FreCreateBinaryExpressionCommand extends FreCommand {
    expressionBuilder: FreBinaryExpressionBuilder;
    boxRoleToSelect: string;
    caretPosition: FreCaret;

    constructor(expressionBuilder: FreBinaryExpressionBuilder) {
        super();
        this.expressionBuilder = expressionBuilder;
    }

    execute(box: Box, trigger: FreTriggerUse, editor: FreEditor): FrePostAction {
        // console.log("FreCreateBinaryExpressionCommand: trigger [" + triggerTypeToString(trigger) + "] part: ");
        let selected: Selected
        AST.change( () => {
            selected = BTREE.insertBinaryExpression(
                this.expressionBuilder(box, triggerTypeToString(trigger), editor),
                box,
                editor,
            );
        })
        // TODO Check whether this fix works consistently correct.
        const childProperty = selected.boxRoleToSelect === FRE_BINARY_EXPRESSION_LEFT ? "left" : "right";
        return function () {
            FRECOMMAND_LOGGER.log(
                "FreCreateBinaryExpressionCommand select after: " +
                selected.element.freLanguageConcept() +
                " ID " +
                selected.element.freId() +
                " rolr " +
                childProperty,
            );
            editor.selectElement(selected.element, childProperty);
            editor.selectFirstEditableChildBox(selected.element);
        };
    }

    // @ts-ignore
    // parameters present to adhere to base class signature
    undo() {
        /* to be done */
    }
}
