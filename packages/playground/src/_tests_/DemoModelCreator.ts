import { DemoEntity, DemoAttribute, DemoFunction, DemoVariable, 
        DemoVariableRef, DemoIfExpression, DemoComparisonExpression, 
        DemoNumberLiteralExpression, DemoOrExpression, DemoStringLiteralExpression, 
        DemoAndExpression, DemoPlusExpression, DemoPlaceholderExpression, DemoModel, 
        DemoAttributeType, DemoExpression, DemoBinaryExpression } from "../language";

export class DemoModelCreator  {
    model: DemoModel = DemoModel.create("DemoModel_1");
    
    constructor() {
        this.initializeModel();
    }

	private initializeModel() {
        const entity1 = DemoEntity.create("Person");
        const attribute1 = DemoAttribute.create("name");
        attribute1.type = DemoAttributeType.Boolean;
        const attribute2 = DemoAttribute.create("age");
        attribute2.type = DemoAttributeType.Boolean;
        entity1.attributes.push(attribute1);
        entity1.attributes.push(attribute2);

        const entity2 = DemoEntity.create("Company");
        const attribute21 = DemoAttribute.create("name");
        attribute21.type = DemoAttributeType.String;
        const attribute22 = DemoAttribute.create("VAT_Number");
        attribute22.type = DemoAttributeType.Integer;
        entity2.attributes.push(attribute21);
        entity2.attributes.push(attribute22);

        const f1 = DemoFunction.create("length");
        // f1.type = DemoAttributeType.Integer;
        const f2 = DemoFunction.create("first");
        // f2.type = DemoAttributeType.Boolean;
        const f3 = DemoFunction.create("last");
        // f3.type = entity1;
        const f4 = DemoFunction.create("determine");
        // f4.type = entity1;
        const f5 = DemoFunction.create("another");
        // f5.type = entity1;

        const var1 = DemoVariable.create("Variable1")
        // var1.type = entity1;
        const var2 = DemoVariable.create("VariableNumber2")
        // var2.type = entity2;
        const var3 = DemoVariable.create("Resultvar")
        // var3.type = entity1;
        const var4 = DemoVariable.create("AAP")
        // var4.type = entity1;
        const var5 = DemoVariable.create("NOOT")
        // var5.type = entity1;

        this.model.entities.push(entity1);
        this.model.entities.push(entity2);
        this.model.functions.push(f1);
        this.model.functions.push(f4);
        this.model.functions.push(f5);
        entity1.functions.push(f2);
        entity2.functions.push(f3);
        f1.parameters.push(var1);
        f1.parameters.push(var2);
        f2.parameters.push(var3);
        f4.parameters.push(var4);
        f5.parameters.push(var5);
        f1.expression = this.getSampleExpression();
    }

    private getSampleExpression() : DemoExpression {
        // (IF (2 > 5) THEN 1 ELSE 5 ENDIF + ((1 / 2) * $Person))

        const ifExpression = new DemoIfExpression();
        const condition: DemoBinaryExpression = this.MakeComparisonExp("2", "5"); //("<")
        ifExpression.condition = condition;
        const thenExpression = new DemoOrExpression();
        const leftOr = new DemoOrExpression();

        const varRef = new DemoVariableRef();
        varRef.referredName = "Variable1";
        varRef.attribute = "Name";
        const equals : DemoBinaryExpression = this.MakeComparisonExp("No", varRef); // ("=");
        //equals.right = varRef;
        leftOr.right = equals;

        leftOr.left = new DemoStringLiteralExpression();
        (leftOr.left as DemoStringLiteralExpression).value ="Yes";
        thenExpression.left = leftOr;
        const rightOr = new DemoAndExpression();
        thenExpression.right = rightOr;
        const rightAnd : DemoBinaryExpression = this.MakeComparisonExp(new DemoNumberLiteralExpression(), "122");
        
        rightAnd.left = new DemoNumberLiteralExpression();
        (rightAnd.left as DemoNumberLiteralExpression).value = "42";

        const leftAnd = this.MakeComparisonExp("Hello World", "Hello Universe");
        rightOr.right = rightAnd;
        rightOr.left = leftAnd;

        ifExpression.whenTrue = thenExpression;

        const divideExpression = this.MakePlusExp("1","2");

        const attribute = new DemoVariableRef();
        attribute.referredName = "Salary";
        const variableExpression = new DemoVariableRef();
        variableExpression.referredName = "Person";
        // variableExpression.member = attribute;

        const multiplyExpression = new DemoPlusExpression();
        multiplyExpression.left = divideExpression;
        multiplyExpression.right = new DemoPlaceholderExpression();

        const plusExpression = this.MakePlusExp("Maybe", multiplyExpression);

        ifExpression.whenFalse = plusExpression;
        
        
        const plus = this.MakePlusExp("Hello Demo","Goodbye")
        return plus;
        // return new DemoPlaceholderExpression();
        // return ifExpression;
        // return thenExpression;
        // return rightAnd;
    }


    private MakeComparisonExp(left: any, right: any) : DemoComparisonExpression {
        const condition: DemoBinaryExpression = new DemoComparisonExpression(); // ("<");
        condition.left = new DemoNumberLiteralExpression();
        (condition.left as DemoNumberLiteralExpression).value = left;
        condition.right = new DemoNumberLiteralExpression();
        (condition.right as DemoNumberLiteralExpression).value = right;
        return condition;
    }

    private MakePlusExp(left: any, right: any) : DemoPlusExpression {
        const result: DemoBinaryExpression = new DemoPlusExpression(); // ("+");
        result.left = new DemoNumberLiteralExpression();
        (result.left as DemoNumberLiteralExpression).value = left;
        result.right = new DemoNumberLiteralExpression();
        (result.right as DemoNumberLiteralExpression).value = right;
        return result;
    }
}