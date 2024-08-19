import { action, makeObservable } from "mobx";
import { FreUtils } from "./internal";
import { Box, FreEditor } from "../editor";
import { FreBinaryExpression, FreNode, FreExpressionNode } from "../ast";
import { isFreBinaryExpression, isFreExpression } from "../ast-utils";
import { FreLogger } from "../logging";

// reserved role names for expressions, use with care.
export const FRE_BINARY_EXPRESSION_LEFT = "FreBinaryExpression-left";
export const FRE_BINARY_EXPRESSION_RIGHT = "FreBinaryExpression-right";
export const BEFORE_BINARY_OPERATOR = "binary-pre";
export const AFTER_BINARY_OPERATOR = "binary-post";
export const LEFT_MOST = "exp-left";
export const RIGHT_MOST = "exp-right";
export const BINARY_EXPRESSION = "binary-expression";
export const EXPRESSION = "expression";
export const EXPRESSION_SYMBOL = "symbol";

const LOGGER = new FreLogger("BalanceTree");

/**
 * Type to export the element that needs top be selected after an expression has been inserted.
 */
export type Selected = {
    element: FreNode;
    boxRoleToSelect: string;
};

/**
 * Class with functions to balance binary trees according to their priorities.
 */
class BTree {
    constructor() {
        makeObservable(this, {
            balanceTree: action,
            setLeftExpression: action,
            setRightExpression: action,
            insertBinaryExpression: action,
        });
    }
    /**
     * Is `exp` the rightmost child in an expression tree?
     * @param exp
     */
    isRightMostChild(exp: FreExpressionNode): boolean {
        FreUtils.CHECK(!exp.freIsBinaryExpression(), "isRightMostChild expects a non-binary expression");
        let currentExp = exp;
        let ownerDescriptor = currentExp.freOwnerDescriptor();
        while (ownerDescriptor && isFreBinaryExpression(ownerDescriptor.owner)) {
            if (ownerDescriptor.owner.freRight() === currentExp) {
                currentExp = ownerDescriptor.owner;
                ownerDescriptor = ownerDescriptor.owner.freOwnerDescriptor();
            } else {
                return false;
            }
        }
        return true;
    }

    /**
     * Is `exp` the leftmost child in an expression tree?
     * @param exp
     */
    isLeftMostChild(exp: FreExpressionNode): boolean {
        FreUtils.CHECK(!exp.freIsBinaryExpression(), "isLeftMostChild expects a non-binary expression");
        let currentExp = exp;
        let ownerDescriptor = currentExp.freOwnerDescriptor();
        while (ownerDescriptor && isFreBinaryExpression(ownerDescriptor.owner)) {
            if (ownerDescriptor.owner.freLeft() === currentExp) {
                currentExp = ownerDescriptor.owner;
                ownerDescriptor = ownerDescriptor.owner.freOwnerDescriptor();
            } else {
                return false;
            }
        }
        return true;
    }

    /**
     * Set `newExp` as the right child of `exp`.
     * Take care of the existing right child and rebalance the expression tree according to the priorities.
     * @param binaryExp
     * @param newExp
     * @param editor
     */
    setRightExpression(binaryExp: FreBinaryExpression, newExp: FreBinaryExpression, editor: FreEditor) {
        const right = binaryExp.freRight();
        binaryExp.freSetRight(newExp);
        newExp.freSetRight(right);
        this.balanceTree(newExp, editor);
    }

    /**
     * Set `newExp` as the left child of `exp`.
     * Take care of the existing right child and rebalance the expression tree according to the priorities.
     * @param binaryExp
     * @param newExp
     * @param editor
     */
    setLeftExpression(binaryExp: FreBinaryExpression, newExp: FreBinaryExpression, editor: FreEditor) {
        const left = binaryExp.freLeft();
        binaryExp.freSetLeft(newExp);
        newExp.freSetLeft(left);
        this.balanceTree(newExp, editor);
    }

    insertBinaryExpression(newBinExp: FreBinaryExpression, box: Box, editor: FreEditor): Selected | null {
        LOGGER.log("insertBinaryExpression for " + box.node);
        let selectedElement: Selected | null = null;
        FreUtils.CHECK(
            isFreExpression(box.node),
            "insertBinaryExpression: current element should be a FreExpressionNode, but it isn't",
        );
        const exp = box.node as FreExpressionNode;
        switch (box.role) {
            case LEFT_MOST:
                selectedElement = { element: newBinExp, boxRoleToSelect: FRE_BINARY_EXPRESSION_LEFT };
                FreUtils.replaceExpression(exp, newBinExp, editor);
                newBinExp.freSetRight(exp);
                this.balanceTree(newBinExp, editor);
                break;
            case RIGHT_MOST:
                selectedElement = { element: newBinExp, boxRoleToSelect: FRE_BINARY_EXPRESSION_RIGHT };
                FreUtils.replaceExpression(exp, newBinExp, editor);
                newBinExp.freSetLeft(exp);
                this.balanceTree(newBinExp, editor);
                break;
            case BEFORE_BINARY_OPERATOR:
                FreUtils.CHECK(isFreBinaryExpression(exp), "Operator action only allowed in binary operator");
                selectedElement = { element: newBinExp, boxRoleToSelect: FRE_BINARY_EXPRESSION_RIGHT };
                const left = (exp as FreBinaryExpression).freLeft();
                (exp as FreBinaryExpression).freSetLeft(newBinExp);
                // FreUtils.replaceExpression(left as FreExpressionNode, newBinExp, editor);
                newBinExp.freSetLeft(left);
                this.balanceTree(newBinExp, editor);
                break;
            case AFTER_BINARY_OPERATOR:
                FreUtils.CHECK(isFreBinaryExpression(exp), "Operator action only allowed in binary operator");
                selectedElement = { element: newBinExp, boxRoleToSelect: FRE_BINARY_EXPRESSION_LEFT };
                const right = (exp as FreBinaryExpression).freRight();
                (exp as FreBinaryExpression).freSetRight(newBinExp);
                // FreUtils.replaceExpression(right, newBinExp, editor);
                newBinExp.freSetRight(right);
                this.balanceTree(newBinExp, editor);
                break;
            default:
                throw Error("Cannot insert binary expression");
        }
        return selectedElement;
    }

    /**
     * Balances the tree according to operator precedence.
     * Works when `exp` has just been added to the tree.
     */
    balanceTree(binaryExp: FreBinaryExpression, editor: FreEditor) {
        const ownerDescriptor = binaryExp.freOwnerDescriptor();
        const left = binaryExp.freLeft();
        if (isFreBinaryExpression(left)) {
            LOGGER.log("Rule 1: prio parent <= prio left");
            if (binaryExp.frePriority() > left.frePriority()) {
                const leftRight = left.freRight();
                FreUtils.setContainer(left, ownerDescriptor, editor);
                left.freSetRight(binaryExp);
                binaryExp.freSetLeft(leftRight);
                this.balanceTree(binaryExp, editor);
                return;
            }
        }
        const right = binaryExp.freRight();
        if (isFreBinaryExpression(right)) {
            LOGGER.log("Rule 2: prio parent < prio right");
            if (binaryExp.frePriority() >= right.frePriority()) {
                const rightLeft = right.freLeft();
                FreUtils.setContainer(right, ownerDescriptor, editor);
                right.freSetLeft(binaryExp);
                binaryExp.freSetRight(rightLeft);
                this.balanceTree(binaryExp, editor);
                return;
            }
        }
        if (ownerDescriptor && isFreBinaryExpression(ownerDescriptor.owner)) {
            const parent = ownerDescriptor.owner;
            if (parent.freLeft() === binaryExp) {
                LOGGER.log("Rule 3: exp is a left child");
                if (binaryExp.frePriority() < parent.frePriority()) {
                    const parentProContainer = parent.freOwnerDescriptor();
                    const expRight = binaryExp.freRight();
                    FreUtils.setContainer(binaryExp, parentProContainer, editor);
                    binaryExp.freSetRight(parent);
                    parent.freSetLeft(expRight);
                    this.balanceTree(binaryExp, editor);
                    return;
                }
            } else {
                FreUtils.CHECK(parent.freRight() === binaryExp, "should be the right child");
                LOGGER.log("Rule 4: exp is a right child, parent is " + parent);
                if (binaryExp.frePriority() <= parent.frePriority()) {
                    const parentProContainer = parent.freOwnerDescriptor();
                    const expLeft = binaryExp.freLeft();
                    FreUtils.setContainer(binaryExp, parentProContainer, editor);
                    binaryExp.freSetLeft(parent);
                    parent.freSetRight(expLeft);
                    this.balanceTree(binaryExp, editor);
                    return;
                }
            }
        }
    }
}

export const BTREE = new BTree();
