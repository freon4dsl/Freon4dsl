import {
    DemoModel,
    DemoMultiplyExpression,
    DemoNumberLiteralExpression,
    DemoDivideExpression,
    DemoVariableRef,
    DemoEntity,
    DemoAttribute,
    DemoFunction,
    DemoVariable,
    PiElementReference
} from "../language/gen";
import { DemoModelCreator } from "./DemoModelCreator";
import { DemoUnparser } from "../unparser/gen/DemoUnparser";
import { makeLiteralExp, MakeMultiplyExp, MakePlusExp } from "./HelperFunctions";
import * as fs from "fs";

describe("Testing Unparser", () => {
    describe("Unparse DemoModel Instance", () => {
        const model: DemoModel = new DemoModelCreator().createCorrectModel();
        const unparser = new DemoUnparser();

        beforeEach(done => {
            done();
        });

        test("3", () => {
            let result: string = "";
            let left = new DemoNumberLiteralExpression();
            left.value = "3";
            result = unparser.unparse(left);
            expect(result).toBe("3");
        });

        test("multiplication 3 * 10", () => {
            let result: string = "";
            let mult: DemoMultiplyExpression = new DemoMultiplyExpression();
            mult.left = makeLiteralExp("3");
            mult.right = makeLiteralExp("10");
            result = unparser.unparse(mult);
            expect(result).toBe("3 * 10");
        });

        test("multiplication 3 * 'temp'", () => {
            let result: string = "";
            let mult: DemoMultiplyExpression = new DemoMultiplyExpression();
            mult.left = makeLiteralExp("3");
            mult.right = makeLiteralExp("temp");
            result = unparser.unparse(mult);
            expect(result).toBe("3 * ' temp '");
        });

        test("multiplication (3 / 4) * 'temp'", () => {
            let result: string = "";
            let div: DemoDivideExpression = new DemoDivideExpression();
            div.left = makeLiteralExp("3");
            div.right = makeLiteralExp("4");
            let mult: DemoMultiplyExpression = new DemoMultiplyExpression();
            mult.left = div;
            mult.right = makeLiteralExp("temp");
            result = unparser.unparse(mult);
            expect(result).toBe("3 / 4 * ' temp '");
        });

        test("(1 + 2) * 'Person'", () => {
            let result: string = "";
            const variableExpression = new DemoVariableRef();
            const variable = new DemoVariable();
            variable.name = "Person";
            // variable.declaredType = DemoAttributeType.String;
            variableExpression.variable = PiElementReference.createNamed<DemoVariable>(variable.name, "DemoVariable");

            // variableExpression.referredName = "Person";
            // variableExpression.attribute = new DemoAttribute();
            // variableExpression.attribute.name = "Person";
            // variableExpression.attribute.declaredType = DemoAttributeType.String;

            const divideExpression = MakePlusExp("1", "2");
            const multiplyExpression = MakeMultiplyExp(divideExpression, variableExpression);
            result = unparser.unparse(multiplyExpression, true);
            expect(result).toBe("1 + 2 * DemoVariableRef");
        });

        test('\'determine(AAP : Integer) : Boolean = "Hello Demo" + "Goodbye"\'', () => {
            let result: string = "";
            const determine = DemoFunction.create({name: "determine"});
            const AAP = DemoVariable.create({name: "AAP"});
            determine.parameters.push(AAP);
            // AAP.declaredType = DemoAttributeType.Integer;
            determine.expression = MakePlusExp("Hello Demo", "Goodbye");
            // determine.declaredType = DemoAttributeType.Boolean;
            // determine(AAP) : Boolean = "Hello Demo" + "Goodbye"
            result = unparser.unparse(determine);
            expect(result).toBe("DemoFunction determine");
            // expect(result).toBe("determine( AAP : Integer ): Boolean = 'Hello Demo' + 'Goodbye'");
        });

        test("Person { name, age, first(Resultvar): Boolean = 5 + 24 }", () => {
            let result: string = "";
            const personEnt = DemoEntity.create({name: "Person"});
            const age = DemoAttribute.create({name: "age"});

            const personName = DemoAttribute.create({name: "name"});
            personEnt.attributes.push(age);
            personEnt.attributes.push(personName);
            const first = DemoFunction.create({name: "first"});
            const Resultvar = DemoVariable.create({name: "Resultvar"});
            first.parameters.push(Resultvar);
            first.expression = MakePlusExp("5", "24");
            personEnt.functions.push(first);

            // add types to the model elements
            // personName.declaredType = DemoAttributeType.String;
            // age.declaredType = DemoAttributeType.Boolean;
            // first.declaredType = DemoAttributeType.Boolean;
            // Resultvar.declaredType = DemoAttributeType.Boolean;
            // Person { name, age, first(Resultvar) = 5 + 24 }

            result = unparser.unparse(personEnt, true);
            expect(result).toBe("DemoEntity Person");
            // expect(result).toBe("DemoEntity Person{ age : Boolean, name : String, first( Resultvar : Boolean ): Boolean = 5 + 24}");
        });

        test.skip("complete example model with simple attribute types", () => {
            let result: string = "";
            result = unparser.unparse(model, false);
            let path: string = "./handmade/unparsedDemoModel.txt";
            if (!fs.existsSync(path)) {
                fs.writeFileSync(path, result);
            } else {
                console.log(this, "projectit-test-unparser: user file " + path + " already exists, skipping it.");
            }

            // TODO use snapshot
            expect(result.length).toBe(1597);
        });
    });
});
