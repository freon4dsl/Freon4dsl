import {
    DemoAbsExpression,
    DemoAndExpression,
    DemoAppliedFeature,
    DemoAssociationRef,
    DemoAttributeRef,
    DemoComparisonExpression,
    DemoDivideExpression,
    DemoEqualExpression,
    DemoFunctionCallExpression,
    DemoFunctionDeclaration,
    DemoIfExpression,
    DemoMember,
    DemoModel,
    DemoModelElement,
    DemoMultiplyExpression,
    DemoNumberLiteralExpression,
    DemoOrExpression,
    DemoPlaceholderExpression,
    DemoPlusExpression,
    DemoPowerExpression,
    DemoStringLiteralExpression,
    DemoThisExpression,
    DemoVariableRefExpression
} from ".";
import { DemoAttribute } from "./domain/DemoAttribute";
import { DemoEntity } from "./domain/DemoEntity";
import { DemoFunction } from "./domain/DemoFunction";
import { DemoVariable } from "./domain/DemoVariable";
import { DemoBinaryExpressionPlaceholder } from "./expressions/DemoBinaryExpressionPlaceHolder";

export var constructors: { [name: string]: Function } = {
    DemoModel: DemoModel,
    DemoModelElement: DemoModelElement,
    DemoNumberLiteralExpression: DemoNumberLiteralExpression,
    DemoIfExpression: DemoIfExpression,
    DemoVariableRefExpression: DemoVariableRefExpression,
    DemoAbsExpression: DemoAbsExpression,
    DemoStringLiteralExpression: DemoStringLiteralExpression,
    DemoAndExpression: DemoAndExpression,
    DemoAssociationRef: DemoAssociationRef,
    DemoAttribute: DemoAttribute,
    DemoAttributeRef: DemoAttributeRef,
    DemoEntity: DemoEntity,
    DemoFunction: DemoFunction,
    DemoFunctionCallExpression: DemoFunctionCallExpression,
    DemoAppliedFeature: DemoAppliedFeature,
    // "DemoAttributeType": DemoAttributeType,
    DemoBinaryExpressionPlaceholder: DemoBinaryExpressionPlaceholder,
    DemoDivideExpression: DemoDivideExpression,
    DemoPlusExpression: DemoPlusExpression,
    DemoMultiplyExpression: DemoMultiplyExpression,
    DemoPowerExpression: DemoPowerExpression,
    DemoEqualExpression: DemoEqualExpression,
    DemoFunctionDeclaration: DemoFunctionDeclaration,
    DemoMember: DemoMember,
    DemoOrExpression: DemoOrExpression,
    DemoPlaceholderExpression: DemoPlaceholderExpression,
    DemoThisExpression: DemoThisExpression,
    DemoVariable: DemoVariable,
    DemoComparisonExpression: DemoComparisonExpression
};
