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
import { makeLiteralExp, MakeMultiplyExp, MakePlusExp } from "./HelperFunctions";
import * as fs from "fs";
import { DemoValidator } from "../validator/gen";
import { DemoEnvironment } from "../environment/gen/DemoEnvironment";

describe("Testing Unparser", () => {
    describe("Unparse DemoModel Instance", () => {
        const model: DemoModel = new DemoModelCreator().createIncorrectModel().models[0];
        const unparser = DemoEnvironment.getInstance().writer;

        beforeEach(done => {
            done();
        });

        test("3", () => {
            let result: string = "";
            const left = new DemoNumberLiteralExpression();
            left.value = 3;
            result = unparser.writeToString(left, 0);
            expect(result).toBe("3");
        });

        test("multiplication 3 * 10", () => {
            let result: string = "";
            const mult: DemoMultiplyExpression = new DemoMultiplyExpression();
            mult.left = makeLiteralExp("3");
            mult.right = makeLiteralExp("10");
            result = unparser.writeToString(mult, 0);
            expect(result).toBe("( 3 * 10 )");
        });

        test("multiplication 3 * 'temp'", () => {
            let result: string = "";
            const mult: DemoMultiplyExpression = new DemoMultiplyExpression();
            mult.left = makeLiteralExp("3");
            mult.right = makeLiteralExp("temp");
            result = unparser.writeToString(mult, 0);
            expect(result).toBe("( 3 * ' \"temp\" ' )");
        });

        test("multiplication (3 / 4) * 'temp'", () => {
            let result: string = "";
            const div: DemoDivideExpression = new DemoDivideExpression();
            div.left = makeLiteralExp("3");
            div.right = makeLiteralExp("4");
            const mult: DemoMultiplyExpression = new DemoMultiplyExpression();
            mult.left = div;
            mult.right = makeLiteralExp("temp");
            result = unparser.writeToString(mult, 0);
            expect(result).toBe("( ( 3 / 4 ) * ' \"temp\" ' )");
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
            // variableExpression.attribute.unitName = "Person";
            // variableExpression.attribute.declaredType = DemoAttributeType.String;

            const divideExpression = MakePlusExp("1", "2");
            const multiplyExpression = MakeMultiplyExp(divideExpression, variableExpression);
            result = unparser.writeToString(multiplyExpression, 0, true);
            expect(result).toBe("( ( 1 + 2 ) * DemoVariableRef )");
        });

        test('\'determine(AAP : Integer) : Boolean = "Hello Demo" + "Goodbye"\'', () => {
            let result: string = "";
            const determine = DemoFunction.create({ name: "determine" });
            const AAP = DemoVariable.create({ name: "AAP" });
            determine.parameters.push(AAP);
            // AAP.declaredType = DemoAttributeType.Integer;
            determine.expression = MakePlusExp("Hello Demo", "Goodbye");
            // determine.declaredType = DemoAttributeType.Boolean;
            // determine(AAP) : Boolean = "Hello Demo" + "Goodbye"
            result = unparser.writeToString(determine, 0);
            expect(result).toBe("DemoFunction determine");
            // expect(result).toBe("determine( AAP : Integer ): Boolean = 'Hello Demo' + 'Goodbye'");
        });

        test("Person { unitName, age, first(Resultvar): Boolean = 5 + 24 }", () => {
            let result: string = "";
            const personEnt = DemoEntity.create({ name: "Person" });
            const age = DemoAttribute.create({ name: "age" });

            const personName = DemoAttribute.create({ name: "name" });
            personEnt.attributes.push(age);
            personEnt.attributes.push(personName);
            const first = DemoFunction.create({ name: "first" });
            const resultvar = DemoVariable.create({ name: "Resultvar" });
            first.parameters.push(resultvar);
            first.expression = MakePlusExp("5", "24");
            personEnt.functions.push(first);

            // add types to the model elements
            // personName.declaredType = DemoAttributeType.String;
            // age.declaredType = DemoAttributeType.Boolean;
            // first.declaredType = DemoAttributeType.Boolean;
            // Resultvar.declaredType = DemoAttributeType.Boolean;
            // Person { unitName, age, first(Resultvar) = 5 + 24 }

            result = unparser.writeToString(personEnt, 0, true);
            expect(result).toBe("DemoEntity Person");
            // expect(result).toBe("DemoEntity Person{ age : Boolean, unitName : String, first( Resultvar : Boolean ): Boolean = 5 + 24}");
        });

        test("complete example model with simple attribute types", () => {
            let result: string = "";
            const testmodel = new DemoModelCreator().createModelWithMultipleUnits();

            const validator = new DemoValidator();
            const errors = validator.validate(testmodel, true);
            // errors.forEach(err =>{
            //    console.log((err.message + " in " + err.locationdescription))
            // });
            // the custom validation adds error message to an otherwise correct model
            expect(errors.length).toBe(9);

            result = unparser.writeToString(testmodel, 0, false);
            const path: string = "./unparsedDemoModel.txt";
            if (!fs.existsSync(path)) {
                fs.writeFileSync(path, result);
            } else {
                console.log("checkUnparser.test: projectit-test-unparser: user file " + path + " already exists, skipping it.");
            }

            // console.log(result);
            expect(result).toMatchSnapshot();
        });
    });
});
