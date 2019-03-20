import { PiCaret} from "./BehaviorUtils";
import { STYLES } from "../components/styles/Styles";
import { AliasBox } from "../boxes/AliasBox";
import { Box } from "../boxes/Box";
import { HorizontalListBox, isHorizontalBox } from "../boxes/ListBox";
import { SelectBox } from "../boxes/SelectBox";
import { SelectOption } from "../boxes/SelectOption";
import { PiEditor } from "../editor/PiEditor";
import { PiBinaryExpression, PiExpression } from "../language/PiModel";
import { PiProjection } from "../language/PiProjection";
import {
    AFTER_BINARY_OPERATOR,
    BTREE,
    BEFORE_BINARY_OPERATOR,
    BINARY_EXPRESSION,
    EXPRESSION,
    EXPRESSION_SYMBOL,
    LEFT_MOST,
    RIGHT_MOST
} from "./BalanceTreeUtils";
import { NBSP, PiUtils } from "./PiUtils";

// const LOGGER = new PiLogger("PiExpressionHelpers");

// LangDev: utils -> createDefaultBinaryBox
export function createDefaultBinaryBox(projection: PiProjection, exp: PiBinaryExpression, style?: string): HorizontalListBox {
    const result = new HorizontalListBox(exp, BINARY_EXPRESSION);

    result.addChildren([
        projection.getBox(exp.piLeft()),
        new AliasBox(exp, BEFORE_BINARY_OPERATOR, NBSP, {style: STYLES.aliasExpression}),
        createOperatorBox(projection["editor"], exp),
        new AliasBox(exp, AFTER_BINARY_OPERATOR, NBSP, {style: STYLES.aliasExpression}),
        projection.getBox(exp.piRight())
    ]);
    return result;
}

// LangDev: utils -> createDefaultExpressionBox
export function createDefaultExpressionBox(
    exp: PiExpression,
    role: string,
    children: Box[],
    initializer?: Partial<HorizontalListBox>
): Box {
    const leftMost = BTREE.isLeftMostChild(exp);
    const rightMost = BTREE.isRightMostChild(exp);
    if (leftMost || rightMost) {
        let result: HorizontalListBox;
        if (children.length === 1 && isHorizontalBox(children[0])) {
            result = children[0] as HorizontalListBox;
        } else {
            result = new HorizontalListBox(exp, EXPRESSION, children);
        }
        if (leftMost) {
            result.insertChild(new AliasBox(exp, LEFT_MOST, NBSP, {style: STYLES.aliasExpression}));
        }
        if (rightMost) {
            result.addChild(new AliasBox(exp, RIGHT_MOST, NBSP, {style: STYLES.aliasExpression}));
        }
        return result;
    } else {
        if (children.length === 1) {
            return children[0];
        } else {
            return new HorizontalListBox(exp, EXPRESSION, children);
        }
    }
}

/**
 * The creates an operator box as a selection to enable editing of operators.
 * @param editor
 * @param exp
 * @param style
 */
export function createOperatorBox(editor: PiEditor, exp: PiBinaryExpression, style?: string): Box {
    const operatorBox = new SelectBox(
        exp,
        EXPRESSION_SYMBOL,
        "<...>",
        () => {
            if (editor.actions && editor.actions.binaryExpressionCreators) {
                return editor.actions.binaryExpressionCreators
                    .filter(e => (!e.isApplicable || e.isApplicable(operatorBox)))
                    .map(e => ({
                        id: e.trigger as string,
                        label: e.trigger as string,
                        description: "empty description for operator",
                        icon: null,
                        hideInList: false
                    }));
            } else {
                return [];
            }
        },
        () => null,
        async (option: SelectOption) => {
            if (editor.actions && editor.actions.binaryExpressionCreators) {
                const alias = editor.actions.binaryExpressionCreators.filter(
                    e => (e.trigger as string) === option.id
                )[0];
                if (alias) {
                    const newExp = alias.expressionBuilder(operatorBox, alias.trigger, editor)
                    newExp.piSetLeft(exp.piLeft());
                    newExp.piSetRight(exp.piRight());
                    PiUtils.replaceExpression(exp, newExp, editor);
                    BTREE.balanceTree(newExp, editor);
                    exp = newExp;
                    await editor.selectElement(newExp.piRight());
                    await editor.selectBox(operatorBox.nextLeafRight.firstLeaf, PiCaret.LEFT_MOST);
                }
            }
        },
        {
            style: style
        }
    );

    operatorBox.getSelectedOption = () => {
        return { id: exp.piSymbol(), label: exp.piSymbol() };

    };

    return operatorBox;
}
