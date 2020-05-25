import { action, observable } from "mobx";
import { PiBinaryExpression, PiExpression } from "../../language";
// tslint:disable-next-line:no-unused-variable
// import * as expressionExtensions from "./CoreTestExpression"; // Workaround to compile the tests
import {
    CoreTestAndExpression,
    CoretestComparisonExpression,
    // CoreTestExpression,
    CoreTestIfExpression,
    CoreTestNumberLiteralExpression,
    CoreTestOrExpression,
    CoreTestPlusExpression,
    CoreTestStringLiteralExpression,
    CoreTestVariableRefExpression,
    // CoreTestAttributeType
} from "../testmodel";
import { CoreTestModel, CoreTestModelElement } from "../testmodel/CoreTestModel";
import { CoreTestEntity } from "../testmodel/domain/CoreTestEntity";
import { CoreTestAttribute } from "../testmodel/domain/CoreTestAttribute";
import { CoreTestFunction } from "../testmodel/domain/CoreTestFunction";
import { CoreTestVariable } from "../testmodel/domain/CoreTestVariable";

require("./CoreTestExpression");

export class CoreTestContext {
    @observable private _rootElement: CoreTestModelElement;

    model: CoreTestModel = CoreTestModel.create("CoreTestModel");

    constructor(initialExpression?: CoreTestModelElement) {
        this.initialize();
        this.rootElement = initialExpression ? initialExpression : this.model;
    }

    set rootElement(exp: CoreTestModelElement) {
        this._rootElement = exp;
        this._rootElement.container = null;
        exp.container = this;
        exp.propertyIndex = undefined;
        exp.propertyName = "rootElement";
    }

    get rootElement(): CoreTestModelElement {
        return this._rootElement;
    }

    toString(): string {
        return "CoreTestContext";
    }

    function1: CoreTestFunction;

    @action
    private initialize() {
        const entity1 = CoreTestEntity.create("Person");
        const attribute1 = CoreTestAttribute.create("name");
        const attribute2 = CoreTestAttribute.create("age");
        entity1.attributes.push(attribute1);
        entity1.attributes.push(attribute2);

        const entity2 = CoreTestEntity.create("Company");
        const attribute21 = CoreTestAttribute.create("name");
        const attribute22 = CoreTestAttribute.create("VAT_Number");
        entity2.attributes.push(attribute21);
        entity2.attributes.push(attribute22);

        const f1 = CoreTestFunction.create("length");
        const f2 = CoreTestFunction.create("first");
        const f3 = CoreTestFunction.create("last");

        const var1 = CoreTestVariable.create("Variable1", entity1);
        const var2 = CoreTestVariable.create("VariableNumber2", entity2);
        const var3 = CoreTestVariable.create("Resultvar", entity1);
        const var4 = CoreTestVariable.create("Param", entity1);

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

        const ifExpression = new CoreTestIfExpression();
        const condition = CoretestComparisonExpression.create("<");
        condition.left = CoreTestNumberLiteralExpression.create("2");
        condition.right = CoreTestNumberLiteralExpression.create("5");
        ifExpression.condition = condition;
        const thenExpression = new CoreTestOrExpression();
        const leftOr = new CoreTestOrExpression();

        const varRef = new CoreTestVariableRefExpression();
        varRef.referredName = "Variable1";
        varRef.attribute = "Name";
        const equals = CoretestComparisonExpression.create("=");
        equals.left = CoreTestStringLiteralExpression.create("No");
        equals.right = varRef;
        leftOr.right = equals;

        leftOr.left = CoreTestStringLiteralExpression.create("Yes");
        thenExpression.left = leftOr;
        const rightOr = new CoreTestAndExpression();
        thenExpression.right = rightOr;
        const rightAnd = CoretestComparisonExpression.create("<");
        rightAnd.left = CoreTestNumberLiteralExpression.create("122");
        rightAnd.right = CoreTestNumberLiteralExpression.create("42");
        const leftAnd = CoretestComparisonExpression.create("<");
        leftAnd.left = CoreTestStringLiteralExpression.create("Hello World");
        leftAnd.right = CoreTestStringLiteralExpression.create("Hello Universe");
        rightOr.right = rightAnd;
        rightOr.left = leftAnd;

        ifExpression.thenExpression = thenExpression;

        const divideExpression = new CoreTestPlusExpression();
        divideExpression.left = CoreTestNumberLiteralExpression.create("1");
        divideExpression.right = CoreTestNumberLiteralExpression.create("2");

        // const attribute = new CoreTestAttributeRef();
        // attribute.attributeName = "Salary";
        // const variableExpression = new CoreTestVariableRefExpression();
        // variableExpression.refVariable = "Person";
        // variableExpression.member = attribute;

        const multiplyExpression = new CoreTestPlusExpression();
        multiplyExpression.left = divideExpression;
        multiplyExpression.right = null;

        const plusExpression = new CoreTestPlusExpression();
        plusExpression.left = CoreTestStringLiteralExpression.create("Maybe");
        plusExpression.right = multiplyExpression;

        ifExpression.elseExpression = plusExpression;
        // return ifExpression;
        // return thenExpression;
        return rightAnd;
        const s1 = CoreTestStringLiteralExpression.create("Hello CoreTest");
        const s2 = CoreTestStringLiteralExpression.create("Goodbye");
        const plus = new CoreTestPlusExpression();
        plus.left = s1;
        plus.right = s2;
        // return plus;
        // return new CoreTestPlaceholderExpression();
    }
}
