import { action, observable } from "mobx";
import { PiBinaryExpression, PiExpression } from "@projectit/core";
// tslint:disable-next-line:no-unused-variable
import * as expressionExtensions from "./DemoExpression"; // Workaround to compile the tests
import {
    DemoAndExpression,
    DemoComparisonExpression,
    DemoExpression,
    DemoIfExpression,
    DemoNumberLiteralExpression,
    DemoOrExpression,
    DemoPlaceholderExpression,
    DemoPlusExpression,
    DemoStringLiteralExpression,
    DemoVariableRefExpression,
    DemoAttributeType
} from "../model/index";
import { DemoModel, DemoModelElement } from "../model/DemoModel";
import { DemoEntity } from "../model/domain/DemoEntity";
import { DemoAttribute } from "../model/domain/DemoAttribute";
import { DemoFunction } from "../model/domain/DemoFunction";
import { DemoVariable } from "../model/domain/DemoVariable";
import { DemoBinaryExpressionPlaceholder } from "../model/expressions/DemoBinaryExpressionPlaceHolder";

require("./DemoExpression");

export class DemoContext {
    @observable private _rootElement: DemoModelElement;

    model: DemoModel = DemoModel.create("DemoModel");

    constructor(initialExpression?: DemoModelElement) {
        this.initialize();
        this.rootElement = initialExpression ? initialExpression : this.model;
    }

    set rootElement(exp: DemoModelElement) {
        this._rootElement = exp;
        this._rootElement.container = null;
        exp.container = this;
        exp.propertyIndex = undefined;
        exp.propertyName = "rootElement";
    }

    get rootElement(): DemoModelElement {
        return this._rootElement;
    }

    toString(): string {
        return "DemoContext";
    }

    getPlaceHolderExpression(): PiExpression {
        return new DemoPlaceholderExpression();
    }

    function1: DemoFunction;

    @action
    private initialize() {
        const entity1 = DemoEntity.create("Person");
        const attribute1 = DemoAttribute.create("name");
        const attribute2 = DemoAttribute.create("age");
        entity1.attributes.push(attribute1);
        entity1.attributes.push(attribute2);

        const entity2 = DemoEntity.create("Company");
        const attribute21 = DemoAttribute.create("name");
        const attribute22 = DemoAttribute.create("VAT_Number");
        entity2.attributes.push(attribute21);
        entity2.attributes.push(attribute22);

        const f1 = DemoFunction.create("length");
        const f2 = DemoFunction.create("first");
        const f3 = DemoFunction.create("last");

        const var1 = DemoVariable.create("Variable1", entity1);
        const var2 = DemoVariable.create("VariableNumber2", entity2);
        const var3 = DemoVariable.create("Resultvar", entity1);
        const var4 = DemoVariable.create("Param", entity1);

        this.model.entities.push(entity1);
        this.model.entities.push(entity2);
        entity1.functions.push(f1);
        entity1.functions.push(f2);
        entity2.functions.push(f3);
        f1.parameters.push(var1);
        f1.parameters.push(var2);
        f2.parameters.push(var3);
        f3.parameters.push(var4);
        f1.expression = this.getSampleExpression();
    }

    private getSampleExpression() {
        // (IF (2 > 5) THEN 1 ELSE 5 ENDIF + ((1 / 2) * $Person))

        const ifExpression = new DemoIfExpression();
        const condition = DemoComparisonExpression.create("<");
        condition.left = DemoNumberLiteralExpression.create("2");
        condition.right = DemoNumberLiteralExpression.create("5");
        ifExpression.condition = condition;
        const thenExpression = new DemoOrExpression();
        const leftOr = new DemoOrExpression();

        const varRef = new DemoVariableRefExpression();
        varRef.referredName = "Variable1";
        varRef.attribute = "Name";
        const equals = DemoComparisonExpression.create("=");
        equals.left = DemoStringLiteralExpression.create("No");
        equals.right = varRef;
        leftOr.right = equals;

        leftOr.left = DemoStringLiteralExpression.create("Yes");
        thenExpression.left = leftOr;
        const rightOr = new DemoAndExpression();
        thenExpression.right = rightOr;
        const rightAnd = DemoComparisonExpression.create("<");
        rightAnd.left = DemoNumberLiteralExpression.create("122");
        rightAnd.right = DemoNumberLiteralExpression.create("42");
        const leftAnd = DemoComparisonExpression.create("<");
        leftAnd.left = DemoStringLiteralExpression.create("Hello World");
        leftAnd.right = DemoStringLiteralExpression.create("Hello Universe");
        rightOr.right = rightAnd;
        rightOr.left = leftAnd;

        ifExpression.thenExpression = thenExpression;

        const divideExpression = new DemoPlusExpression();
        divideExpression.left = DemoNumberLiteralExpression.create("1");
        divideExpression.right = DemoNumberLiteralExpression.create("2");

        // const attribute = new DemoAttributeRef();
        // attribute.attributeName = "Salary";
        // const variableExpression = new DemoVariableRefExpression();
        // variableExpression.refVariable = "Person";
        // variableExpression.member = attribute;

        const multiplyExpression = new DemoPlusExpression();
        multiplyExpression.left = divideExpression;
        multiplyExpression.right = new DemoPlaceholderExpression();

        const plusExpression = new DemoPlusExpression();
        plusExpression.left = DemoStringLiteralExpression.create("Maybe");
        plusExpression.right = multiplyExpression;

        ifExpression.elseExpression = plusExpression;
        // return ifExpression;
        // return thenExpression;
        return rightAnd;
        const s1 = DemoStringLiteralExpression.create("Hello Demo");
        const s2 = DemoStringLiteralExpression.create("Goodbye");
        const plus = new DemoPlusExpression();
        plus.left = s1;
        plus.right = s2;
        // return plus;
        // return new DemoPlaceholderExpression();
    }
}
