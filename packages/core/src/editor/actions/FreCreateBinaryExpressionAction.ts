import { FreBinaryExpression } from "../../ast/index.js";
import { AST } from "../../change-manager/index.js";
import { BTREE, FRE_BINARY_EXPRESSION_LEFT, FreUtils, Selected } from "../../util/index.js";
import { Box } from "../boxes/index.js";
import { FreEditor } from "../FreEditor.js";
import { ACTION_LOGGER, FreAction, FrePostAction } from "./FreAction.js";
import { FreTriggerUse, triggerTypeToString } from "./FreTriggers.js";


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
            ACTION_LOGGER.log(
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

}
