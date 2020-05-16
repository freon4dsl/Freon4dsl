/**
 * This uses the technique of `Module Augmentation`,
 * as described in `https://www.typescriptlang.org/docs/handbook/declaration-merging.html`.
 *
 * The syntax is a bit cumbersome and you have to take care to define all methods in ProExpression.
 * But .. after that CoreTestExpression can be used as a ProExpression, fully type-safe.
 */
import { PiElement, PiExpression, PiBinaryExpression, PiContainerDescriptor } from "../../language";
import { symbol } from "../testmodel/expressions/CoreTestUtil";

import { CoreTestBinaryExpression, CoreTestExpression, CoreTestPlaceholderExpression } from "../testmodel";
import { CoreTestModelElement } from "../testmodel/CoreTestModel";
import { CoreTestBinaryExpressionPlaceHolder } from "../testmodel/expressions/CoreTestBinaryExpressionPlaceHolder";

declare module "../testmodel/CoreTestModel" {
    interface CoreTestModelElement extends PiElement {}
}

CoreTestModelElement.prototype.piId = function(): string {
    return this.$id;
};

CoreTestModelElement.prototype.piIsExpression = function(): boolean {
    return false;
};

CoreTestModelElement.prototype.piContainer = function() {
    return this.container
        ? {
            container: this.container,
            propertyName: this.propertyName!,
            propertyIndex: this.propertyIndex
        }
        : null;
};

CoreTestModelElement.prototype.piLanguageConcept = function() {
    return this.$typename
};

declare module "../testmodel/expressions/CoreTestExpression" {
    interface CoreTestExpression extends PiExpression {}
}

CoreTestExpression.prototype.piId = function(): string {
    return this.$id;
};

CoreTestExpression.prototype.piContainer = function(): PiContainerDescriptor {
    return this.container
        ? {
              container: this.container,
              propertyName: this.propertyName!,
              propertyIndex: this.propertyIndex
          }
        : null;
};

CoreTestExpression.prototype.piIsExpression = function(): boolean {
    return true;
};

CoreTestExpression.prototype.piIsBinaryExpression = function(): boolean {
    return false;
};

CoreTestExpression.prototype.piIsExpressionPlaceHolder = function(): boolean {
    return this instanceof CoreTestPlaceholderExpression;
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

declare module "../testmodel/expressions/CoreTestBinaryExpression" {
    interface CoreTestBinaryExpression extends PiBinaryExpression {}
}

CoreTestBinaryExpression.prototype.piLeft = function(): CoreTestExpression {
    return this.left;
};

CoreTestBinaryExpression.prototype.piRight = function(): CoreTestExpression {
    return this.right;
};

CoreTestBinaryExpression.prototype.piSetLeft = function(value: CoreTestExpression): void {
    this.left = value;
};

CoreTestBinaryExpression.prototype.piSetRight = function(value: CoreTestExpression): void {
    this.right = value;
};

CoreTestBinaryExpression.prototype.piPriority = function(): number {
    return (priorities as any)[symbol(this)];
};

CoreTestBinaryExpression.prototype.piIsBinaryExpression = function(): boolean {
    return true;
};
