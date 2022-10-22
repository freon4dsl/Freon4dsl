import {
    Box,
    HorizontalListBox,
    isHorizontalBox,
    SelectBox,
    SelectOption,
    PiEditor,
    triggerToString, BoxFactory, PiBoxProviderCache
} from "../editor";
import { PiBinaryExpression, PiExpression } from "../ast";
import { Language } from "../language";
import {
    PI_BINARY_EXPRESSION_LEFT,
    PI_BINARY_EXPRESSION_RIGHT,
    AFTER_BINARY_OPERATOR,
    BEFORE_BINARY_OPERATOR,
    BINARY_EXPRESSION,
    BTREE,
    EXPRESSION,
    EXPRESSION_SYMBOL,
    LEFT_MOST,
    RIGHT_MOST,
    BehaviorExecutionResult,
    PiCaret,
    NBSP,
    PiUtils
} from "./internal";

// const LOGGER = new PiLogger("PiExpressionHelpers");

export function createDefaultExpressionBox(exp: PiExpression, role: string, children: Box[], initializer?: Partial<HorizontalListBox>): Box {
    const isLeftMost: Boolean = BTREE.isLeftMostChild(exp);
    const isRightMost: Boolean = BTREE.isRightMostChild(exp);
    if (isLeftMost || isRightMost) {
        let result: HorizontalListBox;
        if (children.length === 1 && isHorizontalBox(children[0])) {
            result = children[0] as HorizontalListBox;
        } else {
            result = BoxFactory.horizontalList(exp, EXPRESSION, children);
        }
        if (isLeftMost) {
            // TODO Change into Svelte Style
            // result.insertChild(new AliasBox(exp, LEFT_MOST, NBSP, { style: STYLES.aliasExpression }));
            result.insertChild(BoxFactory.alias(exp, LEFT_MOST, NBSP));
        }
        if (isRightMost) {
            // TODO Change into Svelte Style
            // result.addChild(new AliasBox(exp, RIGHT_MOST, NBSP, { style: STYLES.aliasExpression }));
            result.addChild(BoxFactory.alias(exp, RIGHT_MOST, NBSP));
        }
        return result;
    } else {
        if (children.length === 1) {
            return children[0];
        } else {
            return BoxFactory.horizontalList(exp, EXPRESSION, children);
        }
    }
}

/**
 * Create a binary box with eleft and right expression boxes, or alias boxes as placeholders for missing left and/or right children.
 * Also add an alias box between the operator and the left and right child to enable the user to add more operators.
 * @param exp
 * @param symbol
 * @param editor
 * @param style
 */
export function createDefaultBinaryBox(exp: PiBinaryExpression, symbol: string, editor: PiEditor, boxProviderCache: PiBoxProviderCache, style?: string): HorizontalListBox {
    // TODO move this method to BoxUtils
    const result = BoxFactory.horizontalList(exp, BINARY_EXPRESSION);
    // const projection = editor.projection;
    // const projectionToUse = !!projection.rootProjection ? projection.rootProjection : projection;

    const rightConceptName = Language.getInstance().classifier(exp.piLanguageConcept())?.properties.get("right")?.type;
    const leftConceptName = Language.getInstance().classifier(exp.piLanguageConcept())?.properties.get("left")?.type;
    // console.log("RIGHT CONCEPT for "+ exp.piLanguageConcept()  + " is " + Language.getInstance().classifier(exp.piLanguageConcept()) );
    // console.log("            ===> " + Language.getInstance().classifier(exp.piLanguageConcept())?.properties.get("right") + " is " + rightConceptName);
    result.addChildren([
        (!!exp.piLeft() ? boxProviderCache.getConceptProjection(exp.piLeft()).box : BoxFactory.alias(exp, PI_BINARY_EXPRESSION_LEFT, "[add-left]", { propertyName: "left", conceptName: leftConceptName  })),
        // TODO  Change into Svelte styles: style: STYLES.aliasExpression
        BoxFactory.alias(exp, BEFORE_BINARY_OPERATOR, NBSP),
        createOperatorBox(editor, exp, symbol),
        // TODO  Change into Svelte styles: style: STYLES.aliasExpression
        BoxFactory.alias(exp, AFTER_BINARY_OPERATOR, NBSP),
        (!!exp.piRight() ? boxProviderCache.getConceptProjection(exp.piRight()).box : BoxFactory.alias(exp, PI_BINARY_EXPRESSION_RIGHT, "[add-right]", { propertyName: "right", conceptName: rightConceptName }))
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
export function createOperatorBox(editor: PiEditor, exp: PiBinaryExpression, symbol: string, cssStyle?: string): Box {
    const operatorBox = new SelectBox(
        exp,
        EXPRESSION_SYMBOL,
        "<...>",
        () => {
            if (!!editor.actions && editor.actions.binaryExpressionActions) {
                return editor.actions.binaryExpressionActions
                    .filter(e => !e.isApplicable || e.isApplicable(operatorBox))
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
        (editor: PiEditor, option: SelectOption): BehaviorExecutionResult => {
            if (editor.actions && editor.actions.binaryExpressionActions) {
                const alias = editor.actions.binaryExpressionActions.filter(e => (e.trigger as string) === option.id)[0];
                if (!!alias) {
                    const newExp = alias.expressionBuilder(operatorBox, triggerToString(alias.trigger), editor);
                    newExp.piSetLeft(exp.piLeft());
                    newExp.piSetRight(exp.piRight());
                    PiUtils.replaceExpression(exp, newExp, editor);
                    BTREE.balanceTree(newExp, editor);
                    exp = newExp;
                    editor.selectElement(newExp, AFTER_BINARY_OPERATOR);
                    // editor.selectBoxNew(operatorBox.nextLeafRight.firstLeaf, PiCaret.LEFT_MOST);
                    return BehaviorExecutionResult.EXECUTED;
                }
            }
            return BehaviorExecutionResult.NO_MATCH;
        },
        {
            cssStyle: cssStyle
        }
    );

    operatorBox.getSelectedOption = () => {
        return { id: symbol, label: symbol };
    };

    return operatorBox;
}
