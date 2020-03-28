import { DemoModel, DemoAttributeType, DemoMultiplyExpression, DemoNumberLiteralExpression, DemoStringLiteralExpression, DemoDivideExpression, DemoVariableRef, DemoEntity, DemoAttribute, AllDemoConcepts, DemoFunction, DemoVariable } from "../language";
import { DemoModelCreator } from "./DemoModelCreator";
import { DemoUnparser } from "../unparser/DemoUnparser";

describe('Testing Unparser', () => {
    describe('Unparse DemoModel Instance', () => {
        const model : DemoModel = new DemoModelCreator().model;
        const unparser = new DemoUnparser();
     
        beforeEach(done => {
          done();
        });

        test("3", () => {
            let result : string = "";
            let left = new DemoNumberLiteralExpression();
            left.value = "3";
            result = unparser.unparse(left, true);
            expect(result).toBe("3");
        });

        test("multiplication 3 * 10", () => {
            let result : string = "";
            let mult : DemoMultiplyExpression = new DemoMultiplyExpression();
            mult.left = new DemoNumberLiteralExpression();
            (mult.left as DemoNumberLiteralExpression).value = "3";
            mult.right = new DemoNumberLiteralExpression();
            (mult.right as DemoNumberLiteralExpression).value = "10"; 
            result = unparser.unparse(mult, true);
            expect(result).toBe("( 3 * 10 )");
        });

        test("multiplication 3 * 'temp'", () => {
            let result : string = "";
            let mult : DemoMultiplyExpression = new DemoMultiplyExpression();
            mult.left = new DemoNumberLiteralExpression();
            (mult.left as DemoNumberLiteralExpression).value = "3";
            mult.right = new DemoStringLiteralExpression();
            (mult.right as DemoStringLiteralExpression).value = "temp";
            result = unparser.unparse(mult, true);
            expect(result).toBe("( 3 * \"temp\" )");
        });

        test("multiplication (3/4) * 'temp'", () => {
            let result : string = "";
            let div : DemoDivideExpression = new DemoDivideExpression();
            div.left = new DemoNumberLiteralExpression();
            (div.left as DemoNumberLiteralExpression).value = "3";
            div.right = new DemoNumberLiteralExpression();
            (div.right as DemoNumberLiteralExpression).value = "4";
            let mult : DemoMultiplyExpression = new DemoMultiplyExpression();
            mult.left = div;
            mult.right = new DemoStringLiteralExpression();
            (mult.right as DemoStringLiteralExpression).value = "temp";
            result = unparser.unparse(mult, true);
            expect(result).toBe("( ( 3 / 4 ) * \"temp\" )");
        });

        test("(1 + 2) * 'Person'", () => {
            let result : string = "";
            const variableExpression = new DemoVariableRef();
            variableExpression.referredName = "Person";
            variableExpression.attribute = new DemoAttribute();
            variableExpression.attribute.name = "Person";
            variableExpression.attribute.declaredType = DemoAttributeType.String;

            const divideExpression = DemoModelCreator.MakePlusExp("1","2");
            const multiplyExpression = DemoModelCreator.MakeMultiplyExp(divideExpression, variableExpression);
            result = unparser.unparse(multiplyExpression, true);
            expect(result).toBe("( ( 1 + 2 ) * Person )");
        })

        test("'determine(AAP : Integer) : Boolean = \"Hello Demo\" + \"Goodbye\"'", () => {
            let result : string = "";
            const determine = DemoFunction.create("determine");
            const AAP = DemoVariable.create("AAP")
            determine.parameters.push(AAP);
            AAP.declaredType = DemoAttributeType.Integer;
            determine.expression = DemoModelCreator.MakePlusExp("Hello Demo","Goodbye")
            determine.declaredType = DemoAttributeType.Boolean;
            // determine(AAP) : Boolean = "Hello Demo" + "Goodbye"
            result = unparser.unparse(determine, true);
            expect(result).toBe("determine( AAP : Integer ): Boolean = ( \"Hello Demo\" + \"Goodbye\" )");
        })

        test("Person { name, age, first(Resultvar): Boolean = 5 + 24 }", () => {
            let result : string = "";
            const personEnt = DemoEntity.create("Person");
            const age = DemoAttribute.create("age");
            const personName = DemoAttribute.create("name");
            personEnt.attributes.push(age);
            personEnt.attributes.push(personName);
            const first = DemoFunction.create("first");
            const Resultvar = DemoVariable.create("Resultvar")
            first.parameters.push(Resultvar);
            first.expression = DemoModelCreator.MakePlusExp("5","24");
            personEnt.functions.push(first);

            // add types to the model elements
            personName.declaredType = DemoAttributeType.String;
            age.declaredType = DemoAttributeType.Boolean;
            first.declaredType = DemoAttributeType.Boolean;
            Resultvar.declaredType = DemoAttributeType.Boolean;    
            // Person { name, age, first(Resultvar) = 5 + 24 }
        
            result = unparser.unparse(personEnt, true);
            expect(result).toBe("Person{ age : Boolean, name : String, first( Resultvar : Boolean ): Boolean = ( 5 + 24 ), \n}");            
        });

        test.skip("complete example model with simple attribute types", () => {
            let result : string = "";
            result = unparser.unparse(model, true);
            expect(result.length).toBe(556);                
        });
    });
});

