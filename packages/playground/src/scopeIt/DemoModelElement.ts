import { DemoEntity, DemoModel, DemoAttribute, DemoFunction, DemoVariable, DemoExpression, DemoPlaceholderExpression, DemoLiteralExpression, DemoStringLiteralExpression, DemoNumberLiteralExpression, DemoAbsExpression, DemoBinaryExpression, DemoMultiplyExpression, DemoPlusExpression, DemoDivideExpression, DemoAndExpression, DemoOrExpression, DemoComparisonExpression, DemoLessThenExpression, DemoGreaterThenExpression, DemoEqualsExpression, DemoFunctionCallExpression, DemoIfExpression, DemoVariableRef, DemoAttributeType } from "language";

export type DemoModelElement = // alle concepten uit DemoLanguage
DemoEntity 
| DemoModel
| DemoEntity
| DemoAttribute
| DemoFunction
| DemoVariable
| DemoExpression
| DemoPlaceholderExpression
| DemoLiteralExpression
| DemoStringLiteralExpression
| DemoNumberLiteralExpression
| DemoAbsExpression
| DemoBinaryExpression
| DemoMultiplyExpression
| DemoPlusExpression
| DemoDivideExpression
| DemoAndExpression
| DemoOrExpression
| DemoComparisonExpression
| DemoLessThenExpression
| DemoGreaterThenExpression
| DemoEqualsExpression
| DemoFunctionCallExpression
| DemoIfExpression
| DemoVariableRef
| DemoAttributeType;