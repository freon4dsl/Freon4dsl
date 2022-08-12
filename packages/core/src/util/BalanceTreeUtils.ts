import { action, makeObservable } from "mobx";
import { PiUnaryExpression } from "../ast/PiUnaryExpression";
import { PiUtils } from "./internal";
import { Box, PiEditor } from "../editor";
import { PiBinaryExpression, PiElement, PiExpression, isBinaryExpression } from "../ast";
import { isPiBinaryExpression, isPiExpression } from "../ast-utils";
import { PiLogger } from "../logging";

// reserved role names for expressions, use with care.
export const PI_BINARY_EXPRESSION_LEFT = "PiBinaryExpression-left";
export const PI_BINARY_EXPRESSION_RIGHT = "PiBinaryExpression-right";
export const BEFORE_BINARY_OPERATOR = "binary-pre";
export const AFTER_BINARY_OPERATOR = "binary-post";
export const LEFT_MOST = "exp-left";
export const RIGHT_MOST = "exp-right";
export const BINARY_EXPRESSION = "binary-expression";
export const EXPRESSION = "expression";
export const EXPRESSION_SYMBOL = "symbol";

const LOGGER = new PiLogger("BalanceTree");

/**
 * Type to export the element that needs top be selected after an expression has been inserted.
 */
export type Selected = {
    element: PiElement;
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
           insertBinaryExpression: action
        });
    }
    /**
     * Is `exp` the rightmost child in an expression tree?
     * @param exp
     */
    isRightMostChild(exp: PiExpression): boolean {
        PiUtils.CHECK(!exp.piIsBinaryExpression(), "isRightMostChild expects a non-binary expression");
        let currentExp = exp;
        let ownerDescriptor = currentExp.piOwnerDescriptor();
        while (ownerDescriptor && isPiBinaryExpression(ownerDescriptor.owner)) {
            if (ownerDescriptor.owner.piRight() === currentExp) {
                currentExp = ownerDescriptor.owner;
                ownerDescriptor = ownerDescriptor.owner.piOwnerDescriptor();
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
    isLeftMostChild(exp: PiExpression): boolean {
        PiUtils.CHECK(!exp.piIsBinaryExpression(), "isLeftMostChild expects a non-binary expression");
        let currentExp = exp;
        let ownerDescriptor = currentExp.piOwnerDescriptor();
        while (ownerDescriptor && isPiBinaryExpression(ownerDescriptor.owner)) {
            if (ownerDescriptor.owner.piLeft() === currentExp) {
                currentExp = ownerDescriptor.owner;
                ownerDescriptor = ownerDescriptor.owner.piOwnerDescriptor();
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
    setRightExpression(binaryExp: PiBinaryExpression, newExp: PiBinaryExpression, editor: PiEditor) {
        const right = binaryExp.piRight();
        newExp.piSetRight(right);
        binaryExp.piSetRight(newExp);
        this.balanceTree(newExp, editor);
    }

    /**
     * Set `newExp` as the left child of `exp`.
     * Take care of the existing right child and rebalance the expression tree according to the priorities.
     * @param binaryExp
     * @param newExp
     * @param editor
     */
    setLeftExpression(binaryExp: PiBinaryExpression, newExp: PiBinaryExpression, editor: PiEditor) {
        const left = binaryExp.piLeft();
        newExp.piSetLeft(left);
        binaryExp.piSetLeft(newExp);
        this.balanceTree(newExp, editor);
    }

    insertBinaryExpression(newBinExp: PiBinaryExpression, box: Box, editor: PiEditor): Selected | null {
        LOGGER.log("insertBinaryExpression for " + box.element);
        let selectedElement: Selected | null = null;
        PiUtils.CHECK(isPiExpression(box.element), "insertBinaryExpression: current element should be a PiExpression, but it isn't");
        const exp = box.element as PiExpression;
        switch (box.role) {
            case LEFT_MOST:
                selectedElement = { element: newBinExp, boxRoleToSelect: PI_BINARY_EXPRESSION_LEFT };
                PiUtils.replaceExpression(exp, newBinExp, editor);
                newBinExp.piSetRight(exp);
                this.balanceTree(newBinExp, editor);
                break;
            case RIGHT_MOST:
                selectedElement = { element: newBinExp, boxRoleToSelect: PI_BINARY_EXPRESSION_RIGHT };
                PiUtils.replaceExpression(exp, newBinExp, editor);
                newBinExp.piSetLeft(exp);
                this.balanceTree(newBinExp, editor);
                break;
            case BEFORE_BINARY_OPERATOR:
                if (isBinaryExpression(exp)) {
                    selectedElement = { element: newBinExp, boxRoleToSelect: PI_BINARY_EXPRESSION_RIGHT };
                    this.setLeftExpression(exp, newBinExp, editor);
                    // const left = exp.piLeft();
                    // exp.piSetLeft(newBinExp);
                    // newBinExp.piSetLeft(left);
                    // this.balanceTree(newBinExp, editor);
                } else {
                    PiUtils.ERROR("Operator alias only allowed in binary operator");
                }
                break;
            case AFTER_BINARY_OPERATOR:
                if (isBinaryExpression(exp)) {
                    selectedElement = { element: newBinExp, boxRoleToSelect: PI_BINARY_EXPRESSION_LEFT };
                    this.setRightExpression(exp, newBinExp, editor);
                    // const right = exp.piRight();
                    // exp.piSetRight(newBinExp);
                    // newBinExp.piSetRight(right);
                    // this.balanceTree(newBinExp, editor);
                } else {
                    PiUtils.ERROR("Operator alias only allowed in binary operator");
                }
                break;
            default:
                throw Error("Cannot insert binary expression");
        }
        return selectedElement;
    }

    insertUnaryExpression(newBinExp: PiUnaryExpression, box: Box, editor: PiEditor): Selected | null {
        // TODO Implement
        return null;
    }
        /**
     * Balances the tree according to operator precedence.
     * Works when `exp` has just been added to the tree.
     */
    balanceTree(binaryExp: PiBinaryExpression, editor: PiEditor) {
        const ownerDescriptor = binaryExp.piOwnerDescriptor();
        const left = binaryExp.piLeft();
        if (isPiBinaryExpression(left)) {
            LOGGER.log("Rule 1: prio parent <= prio left");
            if (binaryExp.piPriority() > left.piPriority()) {
                const leftRight = left.piRight();
                left.piSetRight(binaryExp);
                binaryExp.piSetLeft(leftRight);
                PiUtils.setContainer(left, ownerDescriptor, editor);
                this.balanceTree(binaryExp, editor);
                return;
            }
        }
        const right = binaryExp.piRight();
        if (isPiBinaryExpression(right)) {
            LOGGER.log("Rule 2: prio parent < prio right");
            if (binaryExp.piPriority() >= right.piPriority()) {
                const rightLeft = right.piLeft();
                right.piSetLeft(binaryExp);
                binaryExp.piSetRight(rightLeft);
                PiUtils.setContainer(right, ownerDescriptor, editor);
                this.balanceTree(binaryExp, editor);
                return;
            }
        }
        if (ownerDescriptor && isPiBinaryExpression(ownerDescriptor.owner)) {
            const parent = ownerDescriptor.owner;
            if (parent.piLeft() === binaryExp) {
                LOGGER.log("Rule 3: exp is a left child");
                if (binaryExp.piPriority() < parent.piPriority()) {
                    const parentProContainer = parent.piOwnerDescriptor();
                    const expRight = binaryExp.piRight();
                    binaryExp.piSetRight(parent);
                    parent.piSetLeft(expRight);
                    PiUtils.setContainer(binaryExp, parentProContainer, editor);
                    this.balanceTree(binaryExp, editor);
                    return;
                }
            } else {
                PiUtils.CHECK(parent.piRight() === binaryExp, "should be the right child");
                LOGGER.log("Rule 4: exp is a right child, parent is " + parent);
                if (binaryExp.piPriority() <= parent.piPriority()) {
                    const parentProContainer = parent.piOwnerDescriptor();
                    const expLeft = binaryExp.piLeft();
                    binaryExp.piSetLeft(parent);
                    parent.piSetRight(expLeft);
                    PiUtils.setContainer(binaryExp, parentProContainer, editor);
                    this.balanceTree(binaryExp, editor);
                    return;
                }
            }
        }
    }
}

export const BTREE = new BTree();
