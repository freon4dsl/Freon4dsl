/**
 * This uses the technique of `Module Augmentation`,
 * as described in `https://www.typescriptlang.org/docs/handbook/declaration-merging.html`.
 *
 * The syntax is a bit cumbersome and you have to take care to define all methods in ProExpression.
 * But .. after that DemoExpression can be used as a ProExpression, fully type-safe.
 */
import { PiElement, PiExpression, PiBinaryExpression, PiContainerDescriptor } from "@projectit/core";

import { DemoBinaryExpression, DemoExpression, DemoPlaceholderExpression } from "../model/index";
import { DemoModelElement } from "../model/DemoModel";
import { DemoBinaryExpressionPlaceholder } from "../model/expressions/DemoBinaryExpressionPlaceHolder";

declare module "../model/DemoModel" {
    interface DemoModelElement extends PiElement {}
}

DemoModelElement.prototype.piId = function(): string {
    return this.$id;
};

DemoModelElement.prototype.piIsExpression = function(): boolean {
    return false;
};

DemoModelElement.prototype.piContainer = function() {
    return this.container
        ? {
              container: this.container,
              propertyName: this.propertyName!,
              propertyIndex: this.propertyIndex
          }
        : null;
};

declare module "../model/expressions/DemoExpression" {
    interface DemoExpression extends PiExpression {}
}

DemoExpression.prototype.piId = function(): string {
    return this.$id;
};

DemoExpression.prototype.piContainer = function(): PiContainerDescriptor {
    return this.container
        ? {
              container: this.container,
              propertyName: this.propertyName!,
              propertyIndex: this.propertyIndex
          }
        : null;
};

DemoExpression.prototype.piIsExpression = function(): boolean {
    return true;
};

DemoExpression.prototype.piIsBinaryExpression = function(): boolean {
    return false;
};

DemoExpression.prototype.piIsExpressionPlaceHolder = function(): boolean {
    return this instanceof DemoPlaceholderExpression;
};

const priorities: object = {
    or: 1,
    and: 3,
    "==": 5,
    "<": 5,
    "<=": 5,
    ">": 5,
    ">=": 5,
    "+": 10,
    "-": 10,
    "*": 20,
    "/": 20,
    "^": 30
};

declare module "../model/expressions/DemoBinaryExpression" {
    interface DemoBinaryExpression extends PiBinaryExpression {}
}

DemoBinaryExpression.prototype.piSymbol = function(): string {
    return this.symbol;
};

DemoBinaryExpression.prototype.piLeft = function(): DemoExpression {
    return this.left;
};

DemoBinaryExpression.prototype.piRight = function(): DemoExpression {
    return this.right;
};

DemoBinaryExpression.prototype.piSetLeft = function(value: DemoExpression): void {
    this.left = value;
};

DemoBinaryExpression.prototype.piSetRight = function(value: DemoExpression): void {
    this.right = value;
};

DemoBinaryExpression.prototype.piPriority = function(): number {
    return (priorities as any)[this.symbol];
};

DemoBinaryExpression.prototype.piIsBinaryExpression = function(): boolean {
    return true;
};
