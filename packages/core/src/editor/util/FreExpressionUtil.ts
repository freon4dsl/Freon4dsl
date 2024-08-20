import {
    Box,
    HorizontalLayoutBox,
    isHorizontalBox,
    SelectBox,
    SelectOption,
    FreEditor,
    triggerTypeToString,
    BoxFactory,
    FreProjectionHandler,
} from "../index";
import { FreBinaryExpression, FreExpressionNode } from "../../ast";
import { FreLanguage } from "../../language";
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
} from "../../util";
import { NBSP } from "../index";
import { BehaviorExecutionResult } from "./BehaviorUtils";

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
            // TODO Change into Svelte Style
            // result.insertChild(new ActionBox(exp, LEFT_MOST, NBSP, { style: STYLES.aliasExpression }));
            result.insertChild(BoxFactory.action(exp, LEFT_MOST, NBSP));
        }
        if (isRightMost) {
            // TODO Change into Svelte Style
            // result.addChild(new ActionBox(exp, RIGHT_MOST, NBSP, { style: STYLES.aliasExpression }));
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
        // TODO  Change into Svelte styles: style: STYLES.aliasExpression
        BoxFactory.action(exp, BEFORE_BINARY_OPERATOR, NBSP),
        createOperatorBox(editor, exp, symbol),
        // TODO  Change into Svelte styles: style: STYLES.aliasExpression
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
    const operatorBox = new SelectBox(
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
                        icon: null,
                        hideInList: false,
                    }));
            } else {
                return [];
            }
        },
        () => null,
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
                    newExp.freSetLeft(exp.freLeft());
                    newExp.freSetRight(exp.freRight());
                    FreUtils.replaceExpression(exp, newExp, innerEditor);
                    BTREE.balanceTree(newExp, innerEditor);
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

    operatorBox.getSelectedOption = () => {
        return { id: symbol, label: symbol };
    };

    return operatorBox;
}
