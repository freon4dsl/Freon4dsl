import { DemoEntity, DemoAttribute, DemoFunction, DemoVariable, 
        DemoVariableRef, DemoIfExpression, DemoComparisonExpression, 
        DemoNumberLiteralExpression, DemoOrExpression, DemoStringLiteralExpression, 
        DemoAndExpression, DemoPlusExpression, DemoPlaceholderExpression, DemoModel, 
        DemoAttributeType, DemoExpression, DemoBinaryExpression, DemoLessThenExpression, DemoMultiplyExpression, DemoDivideExpression, DemoBooleanLiteralExpression, DemoGreaterThenExpression, DemoEqualsExpression, DemoLiteralExpression } from "../language";

export class DemoModelCreator  {
    model: DemoModel;
    
    constructor() {
        this.model = this.createCorrectModel();
    }

	public createCorrectModel() : DemoModel {
        let correctModel: DemoModel = DemoModel.create("DemoModel_1");
        const entity1 = DemoEntity.create("Person");
        const attribute1 = DemoAttribute.create("name");
        const attribute2 = DemoAttribute.create("age");

        const entity2 = DemoEntity.create("Company");
        const attribute21 = DemoAttribute.create("name");
        const attribute22 = DemoAttribute.create("VAT_Number");

        const f1 = DemoFunction.create("length");
        const f2 = DemoFunction.create("first");
        const f3 = DemoFunction.create("last");
        const f4 = DemoFunction.create("determine");
        const f5 = DemoFunction.create("another");

        const var1 = DemoVariable.create("Variable1")
        const var2 = DemoVariable.create("VariableNumber2")
        const var3 = DemoVariable.create("Resultvar")
        const var4 = DemoVariable.create("AAP")
        const var5 = DemoVariable.create("NOOT")

        correctModel.entities.push(entity1);
        correctModel.entities.push(entity2);
        correctModel.functions.push(f1);
        correctModel.functions.push(f4);
        correctModel.functions.push(f5);
        entity1.attributes.push(attribute1);
        entity1.attributes.push(attribute2);
        entity2.attributes.push(attribute21);
        entity2.attributes.push(attribute22);
        entity1.functions.push(f2);
        entity2.functions.push(f3);
        f1.parameters.push(var1);
        f1.parameters.push(var2);
        f2.parameters.push(var3);
        f4.parameters.push(var4);
        f5.parameters.push(var5);
        f1.expression = this.addComplexExpression1();
        f2.expression = DemoModelCreator.MakePlusExp("5","24");
        f3.expression = DemoModelCreator.MakePlusExp("5","woord");
        f4.expression = DemoModelCreator.MakePlusExp("Hello Demo","Goodbye")
        f5.expression = this.addComplexExpression2(attribute1);

        this.addSimpleTypes(attribute21, attribute1, attribute2, attribute22, f1, f2, f3, f4, f5, var1, var2, var3, var4, var5);
        return correctModel;
    }

    private addSimpleTypes(attribute21: DemoAttribute, attribute1: DemoAttribute, attribute2: DemoAttribute, attribute22: DemoAttribute, f1: DemoFunction, f2: DemoFunction, f3: DemoFunction, f4: DemoFunction, f5: DemoFunction, var1: DemoVariable, var2: DemoVariable, var3: DemoVariable, var4: DemoVariable, var5: DemoVariable) {
        attribute21.declaredType = DemoAttributeType.String;
        attribute1.declaredType = DemoAttributeType.Boolean;
        attribute2.declaredType = DemoAttributeType.Boolean;
        attribute22.declaredType = DemoAttributeType.Integer;
        f1.declaredType = DemoAttributeType.Integer;
        f2.declaredType = DemoAttributeType.Boolean;
        f3.declaredType = DemoAttributeType.Boolean;
        f4.declaredType = DemoAttributeType.Boolean;
        f5.declaredType = DemoAttributeType.Boolean;
        var1.declaredType = DemoAttributeType.Boolean;
        var2.declaredType = DemoAttributeType.Boolean;
        var3.declaredType = DemoAttributeType.Boolean;
        var4.declaredType = DemoAttributeType.Boolean;
        var5.declaredType = DemoAttributeType.Boolean;
    }

    private addComplexTypes(entity1: DemoEntity, entity2: DemoEntity, attribute21: DemoAttribute, attribute1: DemoAttribute, attribute2: DemoAttribute, attribute22: DemoAttribute, f1: DemoFunction, f2: DemoFunction, f3: DemoFunction, f4: DemoFunction, f5: DemoFunction, var1: DemoVariable, var2: DemoVariable, var3: DemoVariable, var4: DemoVariable, var5: DemoVariable) {
        // attribute21.declaredType = entity1;
        // attribute1.declaredType = DemoAttributeType.Boolean;
        // attribute2.declaredType = DemoAttributeType.Boolean;
        // attribute22.declaredType = DemoAttributeType.Integer;
        // f1.declaredType = DemoAttributeType.Integer;
        // f2.declaredType = entity2;
        // f3.declaredType = entity1;
        // f4.declaredType = DemoAttributeType.Boolean;
        // f5.declaredType = DemoAttributeType.Boolean;
        // var1.declaredType = DemoAttributeType.Boolean;
        // var2.declaredType = DemoAttributeType.Boolean;
        // var3.declaredType = entity2;
        // var4.declaredType = DemoAttributeType.Boolean;
        // var5.declaredType = DemoAttributeType.Boolean;
    }

    private addComplexExpression1() : DemoExpression {
        // (IF (2 < 5) THEN 1 ELSE 5 ENDIF + ((1 / 2) * 'Person'))

        const ifExpression = new DemoIfExpression();
        ifExpression.condition = DemoModelCreator.MakeLessThenExp("2", "5"); //("<")
        ifExpression.whenTrue = DemoModelCreator.makeLiteralExp("1");
        ifExpression.whenFalse = DemoModelCreator.makeLiteralExp("5");
        const divideExpression = DemoModelCreator.MakeDivideExp("1","2");
        const multiplyExpression = DemoModelCreator.MakeMultiplyExp(divideExpression,"Person");
        const plusExpression = DemoModelCreator.MakePlusExp(ifExpression, multiplyExpression);

        return plusExpression;
    }

    private addComplexExpression2(attr: DemoAttribute) : DemoExpression {
        // ("Yes" or ("No" = Variable1))

        const varRef = new DemoVariableRef();
        varRef.referredName = "Variable1";
        varRef.attribute = attr;

        const equals : DemoBinaryExpression = DemoModelCreator.MakeEqualsExp("No", varRef); // ("=");
        // equals : "No" = Variable1

        const leftOr = new DemoOrExpression();
        leftOr.right = equals;
        leftOr.left = DemoModelCreator.makeLiteralExp("Yes");
        // leftOr : ("Yes" or ("No" = Variable1))

        const rightAnd : DemoBinaryExpression = DemoModelCreator.MakeLessThenExp("x", "122");        
        // rightAnd : ("x" < 122)

        const leftAnd = DemoModelCreator.MakeLessThenExp("Hello World", "Hello Universe");
        // leftAnd : ("Hello World" < "Hello Universe")

        const rightOr = new DemoAndExpression();
        rightOr.right = rightAnd;
        rightOr.left = leftAnd;
        // rightOr : ("x" < 122) AND ("Hello World" < "Hello Universe")

        const thenExpression = new DemoOrExpression();
        thenExpression.left = leftOr;
        thenExpression.right = rightOr;
        // thenExpression : ("Yes" or ("No" = Variable1)) OR ("x" < 122) AND ("Hello World" < "Hello Universe")

        const divideExpression = DemoModelCreator.MakePlusExp("1","2");
        // divideExpression : (1/2)

        const multiplyExpression = DemoModelCreator.MakeMultiplyExp(divideExpression, new DemoPlaceholderExpression());
        // multiplyExpression : (1/2) * ...

        const plusExpression = DemoModelCreator.MakePlusExp(thenExpression, multiplyExpression);
        // plusexpression : ("Yes" or ("No" = Variable1)) OR ("x" < 122) AND ("Hello World" < "Hello Universe") + (1/2) * ...

        return plusExpression;
    }

    public static MakeLessThenExp(left: any, right: any) : DemoComparisonExpression {
        const condition: DemoBinaryExpression = new DemoLessThenExpression(); // ("<");
        DemoModelCreator.addToBinaryExpression(left, condition, right);
        return condition;
    }

    public static MakeGreaterThenExp(left: any, right: any) : DemoComparisonExpression {
        const condition: DemoBinaryExpression = new DemoGreaterThenExpression(); // (">");
        DemoModelCreator.addToBinaryExpression(left, condition, right);
        return condition;
    }

    public static MakeEqualsExp(left: any, right: any) : DemoComparisonExpression {
        const condition: DemoBinaryExpression = new DemoEqualsExpression(); // ("=");
        DemoModelCreator.addToBinaryExpression(left, condition, right);
        return condition;
    }

    public static MakeMultiplyExp(left: any, right: any) : DemoMultiplyExpression {
        const multiplication: DemoMultiplyExpression = new DemoMultiplyExpression(); // ("*");
        DemoModelCreator.addToBinaryExpression(left, multiplication, right);
        return multiplication;
    }

    public static MakePlusExp(left: any, right: any) : DemoPlusExpression {
        const plusExpression: DemoBinaryExpression = new DemoPlusExpression(); // ("+");
        DemoModelCreator.addToBinaryExpression(left, plusExpression, right);
        return plusExpression;
    }

    public static MakeDivideExp(left: any, right: any) : DemoDivideExpression {
        const divideExpression: DemoBinaryExpression = new DemoDivideExpression(); // ("/");
        DemoModelCreator.addToBinaryExpression(left, divideExpression, right);
        return divideExpression;
    }

    private static addToBinaryExpression(left: any, binary: DemoBinaryExpression, right: any) {
        binary.left = DemoModelCreator.determineType(left);
        binary.right = DemoModelCreator.determineType(right);
    }

    private static determineType(incoming: any) : DemoExpression {
        if (incoming instanceof DemoExpression) {
            return incoming;
        } else {
            return DemoModelCreator.makeLiteralExp(incoming);
        }
    }

    private static makeLiteralExp(incoming: any) {
        let mine: DemoLiteralExpression;
        if (typeof incoming === "string" && /[0-9]+/.test(incoming)) {
            mine = new DemoNumberLiteralExpression();
            (mine as DemoNumberLiteralExpression).value = incoming;
        }
        else if (typeof incoming === "string" && (incoming === "true" || incoming === "false")) {
            mine = new DemoBooleanLiteralExpression();
            (mine as DemoBooleanLiteralExpression).value = incoming;
        }
        else if (typeof incoming === "string") {
            mine = new DemoStringLiteralExpression();
            (mine as DemoStringLiteralExpression).value = incoming;
        }
        return mine;
    }
}
