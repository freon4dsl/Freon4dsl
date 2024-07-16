import { FreNodeReference } from "@freon4dsl/core";
import {
    DemoMultiplyExpression,
    DemoNumberLiteralExpression,
    DemoDivideExpression,
    DemoVariableRef,
    DemoEntity,
    DemoAttribute,
    DemoFunction,
    DemoVariable,
    DemoAttributeType
} from "../language/gen";
import { DemoModelCreator } from "./DemoModelCreator";
import { makeLiteralExp, MakeMultiplyExp, MakePlusExp } from "./HelperFunctions";
import { DemoValidator } from "../validator/gen";
import { DemoEnvironment } from "../config/gen/DemoEnvironment";
// import { FileHandler } from "../../utils/FileHandler";
import { describe, it, test, expect, beforeEach } from "vitest"


describe("Testing Unparser", () => {
    describe("Unparse DemoModel Instance", () => {
        // const model: DemoModel = new DemoModelCreator().createIncorrectModel().models[0];
        const unparser = DemoEnvironment.getInstance().writer;

        test("3", () => {
            let result: string;
            const left = new DemoNumberLiteralExpression();
            left.value = 3;
            result = unparser.writeToString(left, 0);
            expect(result).toBe("3");
        });

        test("multiplication 3 * 10", () => {
            let result: string;
            const mult: DemoMultiplyExpression = new DemoMultiplyExpression();
            mult.left = makeLiteralExp("3");
            mult.right = makeLiteralExp("10");
            result = unparser.writeToString(mult, 0);
            expect(result).toBe("3 * 10");
        });

        test("multiplication 3 * 'temp'", () => {
            let result: string;
            const mult: DemoMultiplyExpression = new DemoMultiplyExpression();
            mult.left = makeLiteralExp("3");
            mult.right = makeLiteralExp("temp");
            result = unparser.writeToString(mult, 0);
            expect(result).toBe("3 * ' \"temp\" '");
        });

        test("multiplication 3 / 4 * 'temp'", () => {
            let result: string;
            const div: DemoDivideExpression = new DemoDivideExpression();
            div.left = makeLiteralExp("3");
            div.right = makeLiteralExp("4");
            const mult: DemoMultiplyExpression = new DemoMultiplyExpression();
            mult.left = div;
            mult.right = makeLiteralExp("temp");
            result = unparser.writeToString(mult, 0);
            expect(result).toBe("3 / 4 * ' \"temp\" '");
        });

        test("1 + 2 * 'Person'", () => {
            let result: string;
            const variableExpression = new DemoVariableRef();
            const variable = new DemoVariable();
            variable.name = "Person";
            // variable.declaredType = DemoAttributeType.String;
            variableExpression.variable = FreNodeReference.create<DemoVariable>(variable.name, "DemoVariable");

            const divideExpression = MakePlusExp("1", "2");
            const multiplyExpression = MakeMultiplyExp(divideExpression, variableExpression);
            result = unparser.writeToString(multiplyExpression, 0, false);
            result = result.replace(new RegExp("\\s+","gm"), " ");
            expect(result).toBe("1 + 2 * Person");
        });

        test('\'determine(AAP : TEST1) : TEST2 = "Hello Demo" + "Goodbye"\'', () => {
            let result: string;
            const determine = DemoFunction.create({ name: "determine" });
            const AAP = DemoVariable.create({ name: "AAP" });
            determine.parameters.push(AAP);
            AAP.declaredType = FreNodeReference.create<DemoEntity>(DemoEntity.create({name: "TEST1"}), "DemoEntity");
            determine.expression = MakePlusExp("Hello Demo", "Goodbye");
            determine.declaredType = FreNodeReference.create<DemoEntity>(DemoEntity.create({name: "TEST2"}), "DemoEntity");
            // determine(AAP: TEST1) : TEST2 = "Hello Demo" + "Goodbye" has been created
            // unparse using a short notation
            result = unparser.writeToString(determine, 0, true);
            expect(result).toBe("DemoFunction determine {");
            // unparse using a long notation
            result = unparser.writeToString(determine);
            expect(result).toMatchSnapshot();
        });

        test("Person { unitName, age, first(Resultvar): Boolean = 5 + 24 }", () => {
            let result: string;
            let myType = FreNodeReference.create<DemoAttributeType>(DemoAttributeType.Boolean, "DemoAttributeType");
            const personEnt = DemoEntity.create({ name: "Person" });
            const age = DemoAttribute.create({ name: "age", declaredType: myType });

            myType = FreNodeReference.create<DemoAttributeType>(DemoAttributeType.String, "DemoAttributeType");
            const personName = DemoAttribute.create({ name: "name", declaredType: myType });
            personEnt.attributes.push(age);
            personEnt.attributes.push(personName);
            myType = FreNodeReference.create<DemoAttributeType>(DemoAttributeType.Boolean, "DemoAttributeType");
            const first = DemoFunction.create({ name: "first", declaredType: myType });
            const myEntType = FreNodeReference.create<DemoEntity>("someOtherEntity", "DemoEntity");
            const resultvar = DemoVariable.create({ name: "Resultvar", declaredType: myEntType });
            first.parameters.push(resultvar);
            first.expression = MakePlusExp("5", "24");
            personEnt.functions.push(first);

            result = unparser.writeToString(personEnt, 0, false);
            // console.log(result)
            expect(result).toBe("DemoEntity Person {\n" +
                "    baseInterface_attr 0\n" +
                "    simpleprop \"\"\n" +
                "    x \"\"\n" +
                "    attributes\n" +
                "        age : Boolean\n" +
                "        name : String\n" +
                "    entAttributes\n" +
                "\n" +
                "    functions\n" +
                "        DemoFunction first {\n" +
                "            expression 5 + 24\n" +
                "            parameters\n" +
                "                Resultvar : someOtherEntity\n" +
                "            declaredType Boolean\n" +
                "        }\n" +
                "    int_attrs\n" +
                "\n" +
                "    int_functions\n" +
                "\n" +
                "}");
        });

        test("complete example model with simple attribute types", () => {
            let result: string = "";
            const testmodel = new DemoModelCreator().createModelWithMultipleUnits();
            // const fileHandler = new FileHandler();

            const validator = new DemoValidator();
            const errors = validator.validate(testmodel, true);
            // errors.forEach(err =>{
            //    console.log((err.message + " in " + err.locationdescription))
            // });
            // the custom validation adds error message to an otherwise correct model
            expect(errors.length).toBe(9);

            for (const unit of testmodel.models) {
                result = unparser.writeToString(unit, 0, false);
                // fileHandler.stringToFile(`src/demo/__tests__/unparsed${unit.name}.txt`, result);

                // console.log(result);
                expect(result).toMatchSnapshot();
            }
        });
    });
});
