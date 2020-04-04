import { PiElementReference, DemoEntity, DemoAttribute, DemoFunction, DemoVariable,
        DemoVariableRef, DemoIfExpression, DemoComparisonExpression, 
        DemoNumberLiteralExpression, DemoOrExpression, DemoStringLiteralExpression, 
        DemoAndExpression, DemoPlusExpression, DemoPlaceholderExpression, DemoModel, 
        DemoAttributeType, DemoExpression, DemoBinaryExpression, DemoLessThenExpression, DemoMultiplyExpression,
    DemoDivideExpression, DemoBooleanLiteralExpression, DemoGreaterThenExpression, DemoEqualsExpression, DemoLiteralExpression } from "../language/gen";
import { makeLiteralExp } from "./HelperFunctions";

export class DemoModelCreator  {
    model: DemoModel;
    
    constructor() {
        this.model = this.createCorrectModel();
    }

	public createCorrectModel() : DemoModel {
        let correctModel: DemoModel = DemoModel.create("DemoModel_1");

        const length = DemoFunction.create("length");
        const Variable1 = DemoVariable.create("Variable1")
        const VariableNumber2 = DemoVariable.create("VariableNumber2")
        length.parameters.push(Variable1);
        length.parameters.push(VariableNumber2);
        length.expression = this.addComplexExpression1(); 
        // length(Variable1, VariableNumber2): (IF (2 < 5) THEN 1 ELSE 5 ENDIF + ((1 / 2) * 'Person'))

        const determine = DemoFunction.create("determine");
        const AAP = DemoVariable.create("AAP")
        determine.parameters.push(AAP);
        determine.expression = DemoModelCreator.MakePlusExp("Hello Demo","Goodbye")
        // determine(AAP) = "Hello Demo" + "Goodbye"

        const last = DemoFunction.create("last");
        last.expression = DemoModelCreator.MakePlusExp("5","woord");
        // last() = 5 + "woord"
        
        correctModel.functions.push(length);
        correctModel.functions.push(determine);
        correctModel.functions.push(last);
 
        const personEnt = DemoEntity.create("Person");
        const age = DemoAttribute.create("age");
        const personName = DemoAttribute.create("name");
        personEnt.attributes.push(age);
        personEnt.attributes.push(personName);
        const first = DemoFunction.create("first");
        const Resultvar = DemoVariable.create("Resultvar");
        first.parameters.push(Resultvar);
        first.expression = DemoModelCreator.MakePlusExp("5","24");
        personEnt.functions.push(first);
        // Person { age, first(Resultvar) = 5 + 24 }

        const companyEnt = DemoEntity.create("Company");
        const companyName = DemoAttribute.create("name");
        const VAT_Number = DemoAttribute.create("VAT_Number");
        companyEnt.attributes.push(companyName);
        companyEnt.attributes.push(VAT_Number);

        const another = DemoFunction.create("another");
        const NOOT = DemoVariable.create("NOOT")
        another.parameters.push(NOOT);
        another.expression = this.addComplexExpression2(companyName);
        // another(NOOT) = ("Yes" or ("No" = Variable1)) OR ("x" < 122) AND ("Hello World" < "Hello Universe") + (1/2) * ...

        companyEnt.functions.push(another);
        // Company { name, VAT_Number, another(NOOT) = ... }

        correctModel.entities.push(personEnt);
        correctModel.entities.push(companyEnt);

        this.addSimpleTypes(personName, companyName, age, VAT_Number, length, first, last, determine, 
            another, Variable1, VariableNumber2, Resultvar, AAP, NOOT);
        return correctModel;
    }

    private addSimpleTypes(personName: DemoAttribute, companyName: DemoAttribute, age: DemoAttribute, VAT_Number: DemoAttribute, 
            length: DemoFunction, first: DemoFunction, last: DemoFunction, determine: DemoFunction, another: DemoFunction, 
            Variable1: DemoVariable, VariableNumber2: DemoVariable, Resultvar: DemoVariable, AAP: DemoVariable, NOOT: DemoVariable) {
        personName.declaredType = DemoAttributeType.String;
        companyName.declaredType = DemoAttributeType.Boolean;
        age.declaredType = DemoAttributeType.Boolean;
        VAT_Number.declaredType = DemoAttributeType.Integer;
        length.declaredType = DemoAttributeType.String;
        first.declaredType = DemoAttributeType.Boolean;
        last.declaredType = DemoAttributeType.Boolean;
        determine.declaredType = DemoAttributeType.Boolean;
        another.declaredType = DemoAttributeType.Boolean;
        Variable1.declaredType = DemoAttributeType.Boolean;
        VariableNumber2.declaredType = DemoAttributeType.Boolean;
        Resultvar.declaredType = DemoAttributeType.Boolean;
        AAP.declaredType = DemoAttributeType.Boolean;
        NOOT.declaredType = DemoAttributeType.Boolean;
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
        ifExpression.whenTrue = makeLiteralExp("1");
        ifExpression.whenFalse = makeLiteralExp("5");
        const divideExpression = DemoModelCreator.MakeDivideExp("1","2");
        const multiplyExpression = DemoModelCreator.MakeMultiplyExp(divideExpression,"Person");
        const plusExpression = DemoModelCreator.MakePlusExp(ifExpression, multiplyExpression);

        return plusExpression;
    }

    private addComplexExpression2(attr: DemoAttribute) : DemoExpression {
        // ("Yes" or ("No" = Variable1)) OR ("x" < 122) AND ("Hello World" < "Hello Universe") + (1/2) * ...

        const varRef = new DemoVariableRef();
        // varRef.referredName = "Variable1";
        varRef.attribute = new PiElementReference<DemoAttribute>(attr, "DemoAttribute");

        const equals : DemoBinaryExpression = DemoModelCreator.MakeEqualsExp("No", varRef); // ("=");
        // equals : "No" = Variable1

        const leftOr = new DemoOrExpression();
        leftOr.right = equals;
        leftOr.left = makeLiteralExp("Yes");
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
            return makeLiteralExp(incoming);
        }
    }

}
