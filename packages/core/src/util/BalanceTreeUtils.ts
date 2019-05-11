import { action } from "mobx";
import { isPiExpression } from "../language/PiModel";
import { PiLogger } from "./PiLogging";
import { Box } from "../boxes/Box";
import {
  isPiBinaryExpression,
  PiBinaryExpression,
  PiElement,
  PiExpression
} from "../language/PiModel";
import { PiEditor } from "../editor/PiEditor";
import { PiUtils } from "./PiUtils";

// reserved role names for expressions, use with care.
export const BEFORE_BINARY_OPERATOR = "binary-pre";
export const AFTER_BINARY_OPERATOR = "binary-post";
export const LEFT_MOST = "exp-left";
export const RIGHT_MOST = "exp-right";
export const EXPRESSION_PLACEHOLDER = "expression-placeholder";
export const BINARY_OPERATOR = "binary-operator";
export const BINARY_EXPRESSION = "binary-expression";
export const EXPRESSION = "expression";
export const EXPRESSION_SYMBOL = "symbol";

const LOGGER = new PiLogger("BalanceTree");

class BTree {
  isRightMostChild(exp: PiExpression): boolean {
    PiUtils.CHECK(
      !exp.piIsBinaryExpression(),
      "isRightMostChild expects a non-binary expression"
    );
    var currentExp = exp;
    let expContainer = currentExp.piContainer();
    while (expContainer && isPiBinaryExpression(expContainer.container)) {
      if (expContainer.container.piRight() === currentExp) {
        currentExp = expContainer.container;
        expContainer = expContainer.container.piContainer();
      } else {
        return false;
      }
    }
    return true;
  }

  isLeftMostChild(exp: PiExpression): boolean {
    PiUtils.CHECK(
      !exp.piIsBinaryExpression(),
      "isLeftMostChild expects a non-binary expression"
    );
    var currentExp = exp;
    let expContainer = currentExp.piContainer();
    while (expContainer && isPiBinaryExpression(expContainer.container)) {
      if (expContainer.container.piLeft() === currentExp) {
        currentExp = expContainer.container;
        expContainer = expContainer.container.piContainer();
      } else {
        return false;
      }
    }
    return true;
  }

  @action
  setRightExpression(
    exp: PiBinaryExpression,
    newExp: PiBinaryExpression,
    editor: PiEditor
  ) {
    const right = exp.piRight();
    exp.piSetRight(newExp);
    newExp.piSetRight(right);
    this.balanceTree(newExp, editor);
  }

  @action
  setLeftExpression(
    exp: PiBinaryExpression,
    newExp: PiBinaryExpression,
    editor: PiEditor
  ) {
    const left = exp.piLeft();
    exp.piSetLeft(newExp);
    newExp.piSetLeft(left);
    this.balanceTree(newExp, editor);
  }

  @action
  insertBinaryExpression(
    newBinExp: PiBinaryExpression,
    box: Box,
    editor: PiEditor
  ): PiElement | null {
    LOGGER.log("insertBinaryExpression for " + box.element);
    let selectedElement: PiElement | null = null;
    PiUtils.CHECK(
      isPiExpression(box.element),
      "insertBinaryExpression: current element should be a ProExpression, but it isn't"
    );
    const exp = box.element as PiExpression;
    switch (box.role) {
      case LEFT_MOST:
        selectedElement = newBinExp.piLeft();
        PiUtils.replaceExpression(exp, newBinExp, editor);
        newBinExp.piSetRight(exp);
        this.balanceTree(newBinExp, editor);
        break;
      case RIGHT_MOST:
        selectedElement = newBinExp.piRight();
        PiUtils.replaceExpression(exp, newBinExp, editor);
        newBinExp.piSetLeft(exp);
        this.balanceTree(newBinExp, editor);
        break;
      case BEFORE_BINARY_OPERATOR:
        PiUtils.CHECK(
          isPiBinaryExpression(exp),
          "Operator alias only allowed in binary operator"
        );
        selectedElement = newBinExp.piRight();
        const left = (exp as PiBinaryExpression).piLeft();
        PiUtils.replaceExpression(left as PiExpression, newBinExp, editor);
        newBinExp.piSetLeft(left);
        this.balanceTree(newBinExp, editor);
        break;
      case AFTER_BINARY_OPERATOR:
        PiUtils.CHECK(
          isPiBinaryExpression(exp),
          "Operator alias only allowed in binary operator"
        );
        selectedElement = newBinExp.piLeft();
        const right = (exp as PiBinaryExpression).piRight();
        PiUtils.replaceExpression(right, newBinExp, editor);
        newBinExp.piSetRight(right);
        this.balanceTree(newBinExp, editor);
        break;
      case EXPRESSION_PLACEHOLDER:
        PiUtils.replaceExpression(exp, newBinExp, editor);
        selectedElement = newBinExp.piLeft();
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
  balanceTree(exp: PiBinaryExpression, editor: PiEditor) {
    const expContainer = exp.piContainer();
    const left = exp.piLeft();
    if (isPiBinaryExpression(left)) {
      LOGGER.log("Rule 1: prio parent <= prio left");
      if (exp.piPriority() > left.piPriority()) {
        const leftRight = left.piRight();
        left.piSetRight(exp);
        exp.piSetLeft(leftRight);
        PiUtils.setContainer(left, expContainer, editor);
        this.balanceTree(exp, editor);
        return;
      }
    }
    const right = exp.piRight();
    if (isPiBinaryExpression(right)) {
      LOGGER.log("Rule 2: prio parent < prio right");
      if (exp.piPriority() >= right.piPriority()) {
        const rightLeft = right.piLeft();
        right.piSetLeft(exp);
        exp.piSetRight(rightLeft);
        PiUtils.setContainer(right, expContainer, editor);
        this.balanceTree(exp, editor);
        return;
      }
    }
    if (expContainer && isPiBinaryExpression(expContainer.container)) {
      const parent = expContainer.container;
      if (parent.piLeft() === exp) {
        LOGGER.log("Rule 3: exp is a left child");
        if (exp.piPriority() < parent.piPriority()) {
          const parentProContainer = parent.piContainer();
          const expRight = exp.piRight();
          exp.piSetRight(parent);
          parent.piSetLeft(expRight);
          PiUtils.setContainer(exp, parentProContainer, editor);
          this.balanceTree(exp, editor);
          return;
        }
      } else {
        PiUtils.CHECK(parent.piRight() === exp, "should be the right child");
        LOGGER.log("Rule 4: exp is a right child, parent is " + parent);
        if (exp.piPriority() <= parent.piPriority()) {
          const parentProContainer = parent.piContainer();
          const expLeft = exp.piLeft();
          exp.piSetLeft(parent);
          parent.piSetRight(expLeft);
          PiUtils.setContainer(exp, parentProContainer, editor);
          this.balanceTree(exp, editor);
          return;
        }
      }
    }
  }
}

export const BTREE = new BTree();
