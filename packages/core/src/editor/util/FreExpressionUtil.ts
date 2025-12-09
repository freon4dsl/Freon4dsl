import { AST } from "../../change-manager/index.js";
import type {
    Box,
    FreEditor} from "../index.js";
import {
    type HorizontalLayoutBox,
    isHorizontalBox,
    type SelectOption,
    triggerTypeToString,
    BoxFactory,
    type FreProjectionHandler,
} from "../index.js";
import type { FreBinaryExpression, FreExpressionNode } from "../../ast/index.js";
import { FreLanguage } from "../../language/index.js";
import {
    FRE_BINARY_EXPRESSION_LEFT,
    FRE_BINARY_EXPRESSION_RIGHT,
    AFTER_BINARY_OPERATOR,
    BEFORE_BINARY_OPERATOR,
    BINARY_EXPRESSION,
    BTREE,
    EXPRESSION,
    EXPRESSION_SYMBOL,
    LEFT_MOST,
    RIGHT_MOST,
    FreUtils,
} from "../../util/index.js";
import { NBSP } from "../index.js";
import { BehaviorExecutionResult } from "./BehaviorUtils.js";

// const LOGGER = new FreLogger("FreExpressionNodeHelpers");
// todo maybe moved these functions to BoxUtils?

export function createDefaultExpressionBox(exp: FreExpressionNode, children: Box[], initializer?: Partial<HorizontalLayoutBox>): Box {
    const isLeftMost: Boolean = BTREE.isLeftMostChild(exp);
    const isRightMost: Boolean = BTREE.isRightMostChild(exp);
    if (isLeftMost || isRightMost) {
        let result: HorizontalLayoutBox;
        if (children.length === 1 && isHorizontalBox(children[0])) {
            result = children[0] as HorizontalLayoutBox;
        } else {
            result = BoxFactory.horizontalLayout(exp, EXPRESSION, "", children);
        }
        if (isLeftMost) {
            result.insertChild(BoxFactory.action(exp, LEFT_MOST, NBSP));
        }
        if (isRightMost) {
            result.addChild(BoxFactory.action(exp, RIGHT_MOST, NBSP));
        }
        FreUtils.initializeObject(result, initializer);
        return result;
    } else {
        if (children.length === 1) {
            return children[0];
        } else {
            return BoxFactory.horizontalLayout(exp, EXPRESSION, "", children);
        }
    }
}

/**
 * Create a binary box with eleft and right expression boxes, or action boxes as placeholders for missing left and/or right children.
 * Also add an action box between the operator and the left and right child to enable the user to add more operators.
 * @param exp
 * @param symbol
 * @param editor
 * @param boxProviderCache
 * @param style
 */
export function createDefaultBinaryBox(
    exp: FreBinaryExpression,
    symbol: string,
    editor: FreEditor,
    boxProviderCache: FreProjectionHandler,
): HorizontalLayoutBox {
    // TODO move this method to BoxUtils
    const result = BoxFactory.horizontalLayout(exp, BINARY_EXPRESSION, "");
    // const projection = editor.projection;
    // const projectionToUse = !!projection.rootProjection ? projection.rootProjection : projection;

    const rightConceptName = FreLanguage.getInstance()
        .classifier(exp.freLanguageConcept())
        ?.properties.get("right")?.type;
    const leftConceptName = FreLanguage.getInstance()
        .classifier(exp.freLanguageConcept())
        ?.properties.get("left")?.type;
    // console.log("RIGHT CONCEPT for "+ exp.freLanguageConcept()  + " is " + Language.getInstance().classifier(exp.freLanguageConcept()) );
    // console.log("            ===> " + Language.getInstance().classifier(exp.freLanguageConcept())?.properties.get("right") + " is " + rightConceptName);
    result.addChildren([
        !!exp.freLeft()
            ? boxProviderCache.getBoxProvider(exp.freLeft()).box
            : BoxFactory.action(exp, FRE_BINARY_EXPRESSION_LEFT, "[add-left]", {
                  propertyName: "left",
                  conceptName: leftConceptName,
              }),
        BoxFactory.action(exp, BEFORE_BINARY_OPERATOR, NBSP),
        createOperatorBox(editor, exp, symbol),
        BoxFactory.action(exp, AFTER_BINARY_OPERATOR, NBSP),
        !!exp.freRight()
            ? boxProviderCache.getBoxProvider(exp.freRight()).box
            : BoxFactory.action(exp, FRE_BINARY_EXPRESSION_RIGHT, "[add-right]", {
                  propertyName: "right",
                  conceptName: rightConceptName,
              }),
    ]);
    return result;
}

/**
 * The creates an operator box as a selection to enable editing of operators.
 * @param editor
 * @param exp
 * @param symbol
 * @param cssStyle
 */
export function createOperatorBox(editor: FreEditor, exp: FreBinaryExpression, symbol: string, cssStyle?: string): Box {
    // TODO Does not work without factory!
    const operatorBox = BoxFactory.select(
        exp,
        EXPRESSION_SYMBOL,
        "<...>",
        () => {
            if (!!editor.actions && editor.actions.binaryExpressionActions) {
                return editor.actions.binaryExpressionActions
                    .filter((e) => !e.isApplicable || e.isApplicable(operatorBox))
                    .map((e) => ({
                        id: e.trigger as string,
                        label: e.trigger as string,
                        description: "empty description for operator",
                        // TODO icon and hideInList do not adhere to the SelectOption interface. What is happening here?
                        icon: null,
                        hideInList: false,
                    }));
            } else {
                return [];
            }
        },
        () => {
            return { id: symbol, label: symbol };
        },
        (innerEditor: FreEditor, option: SelectOption): BehaviorExecutionResult => {
            if (innerEditor.actions && innerEditor.actions.binaryExpressionActions) {
                const action = innerEditor.actions.binaryExpressionActions.filter(
                    (e) => (e.trigger as string) === option.id,
                )[0];
                if (!!action) {
                    const newExp = action.expressionBuilder(
                        operatorBox,
                        triggerTypeToString(action.trigger),
                        innerEditor,
                    );
                    AST.changeNamed("FreExpressionUtil.createOperatorBox", () => {
                        newExp.freSetLeft(exp.freLeft());
                        newExp.freSetRight(exp.freRight());
                        FreUtils.replaceExpression(exp, newExp, innerEditor);
                        BTREE.balanceTree(newExp, innerEditor);
                    })
                    exp = newExp;
                    innerEditor.selectElementBox(newExp, AFTER_BINARY_OPERATOR); // todo adjust property name
                    // editor.selectBoxNew(operatorBox.nextLeafRight.firstLeaf, FreCaret.LEFT_MOST);
                    return BehaviorExecutionResult.EXECUTED;
                }
            }
            return BehaviorExecutionResult.NO_MATCH;
        },
        {
            cssStyle: cssStyle,
        },
    );

    return operatorBox;
}
