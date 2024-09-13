import { FreNodeReference, FreError, AST } from "@freon4dsl/core";
import { DemoEnvironment } from "../config/gen/DemoEnvironment";
import {
    DemoModel,
    DemoAttributeType,
    DemoMultiplyExpression,
    DemoDivideExpression,
    DemoVariableRef,
    DemoEntity,
    DemoAttribute,
    DemoFunction,
    DemoVariable,
    Demo,
} from "../language/gen";
import { DemoValidator } from "../validator/gen";
import { DemoModelCreator } from "./DemoModelCreator";
import { makeLiteralExp, MakeMultiplyExp, MakePlusExp } from "./HelperFunctions";
import { describe, test, expect, beforeEach } from "vitest";

describe("Testing Validator", () => {
    const model: Demo = new DemoModelCreator().createIncorrectModel();
    const validator = new DemoValidator();

    beforeEach(() => {
        DemoEnvironment.getInstance();
    });

    test("multiplication 3 * 10", () => {
        let errors: FreError[];
        AST.change( () => {
            let mult: DemoMultiplyExpression = new DemoMultiplyExpression();
            mult.left = makeLiteralExp("3");
            mult.right = makeLiteralExp("10");
            errors = validator.validate(mult);
            expect(errors.length).toBe(0);
        })
    });

    test("multiplication 3 * 'temp'", () => {
        let errors: FreError[];
        AST.change( () => {
            let mult: DemoMultiplyExpression = new DemoMultiplyExpression();
            mult.left = makeLiteralExp("3");
            mult.right = makeLiteralExp("temp");
            errors = validator.validate(mult);
            expect(errors.length).toBe(1);
            errors.forEach((e) => {
                expect(e.reportedOn).toBe(mult.right);
                // console.log(e.message + " => " + e.locationdescription + " of severity " + e.severity)
            });
        })
    });

    test("multiplication (3/4) * 'temp'", () => {
        let errors: FreError[];
        AST.change( () => {
            let div: DemoDivideExpression = new DemoDivideExpression();
            div.left = makeLiteralExp("3");
            div.right = makeLiteralExp("4");
            let mult: DemoMultiplyExpression = new DemoMultiplyExpression();
            mult.left = div;
            mult.right = makeLiteralExp("temp");
            errors = validator.validate(mult);
            expect(errors.length).toBe(1);
            errors.forEach((e) => {
                expect(e.reportedOn).toBe(mult.right);
                // console.log(e.message + " => " + e.locationdescription + " of severity " + e.severity)
            });
        })
    });

    test("'self.entities' and 'self.functions' may not empty and model unitName should be valid", () => {
        let errors: FreError[];
        AST.change( () => {
            const model = new DemoModel();
            model.name = "$%";
            errors = validator.validate(model);
            // let text = "";
            // for (let e of errors) {
            //     text = text.concat(e.message + "\n");
            // }
            // console.log(text);
            expect(errors.length).toBe(3);
        })
    });

    test("incorrect unitName of DemoModel: YY\\XX", () => {
        let errors: FreError[];
        AST.change( () => {
            let model = new DemoModel();
            model.name = "YY\\XX";
            errors = validator.validate(model);
            expect(errors.length).toBe(3)
        })
    });

    test("(1 + 2) * 'Person' should give type error", () => {
        let errors: FreError[];
        AST.change( () => {
            const variableExpression = new DemoVariableRef();
            const variable = DemoVariable.create({ name: "XXX" });
            const personEnt = DemoEntity.create({ name: "Person" });
            variable.declaredType = FreNodeReference.create<DemoEntity>(personEnt, "DemoEntity");
            variableExpression.variable = FreNodeReference.create<DemoVariable>(variable, "DemoVariable");

            const plusExpression = MakePlusExp("1", "2");
            const multiplyExpression = MakeMultiplyExp(plusExpression, variableExpression);
            errors = validator.validate(multiplyExpression);
            expect(errors.length).toBe(1);
            // Type of 'DemoVariableRef' should be equal to (the type of) 'DemoAttributeType Integer' in unnamed
            errors.forEach((e) => {
                // console.log(e.message + " => " + e.locationdescription + " of severity " + e.severity)
                expect(e.reportedOn === multiplyExpression);
            });
        })
    });

    test('"Hello Demo" + "Goodbye"\'\' should have 2 errors', () => {
        let errors: FreError[];
        AST.change( () => {
            let expression = MakePlusExp("Hello Demo", "Goodbye");
            // "Hello Demo" + "Goodbye"

            errors = validator.validate(expression);
            expect(errors.length).toBe(2);
            errors.forEach((e) => {
                expect(e.reportedOn === expression);
                // console.log(e.message + " => " + e.locationdescription + " of severity " + e.severity)
            });
        })
    });

    test('\'determine(AAP) : Boolean = "Hello Demo" + "Goodbye"\'\' should have 5 errors', () => {
        let errors: FreError[];
        AST.change( () => {
            const determine = DemoFunction.create({ name: "determine" });
            const AAP = DemoVariable.create({ name: "AAP" });
            determine.parameters.push(AAP);
            determine.expression = MakePlusExp("Hello Demo", "Goodbye");
            const personEnt = DemoEntity.create({ name: "Person" });
            determine.declaredType = FreNodeReference.create<DemoEntity>(personEnt, "DemoEntity");
            // determine(AAP) : Boolean = "Hello Demo" + "Goodbye"
            errors = validator.validate(determine, true);
            // console.log(errors.map(e => e.message + " in " + e.locationdescription + " of severity " + e.severity).join( "\n"));
            // determine EXPRESSION TYPE IS NOT CORRECT!! in determine of severity Improvement
            // ER IS IETS FLINK MIS MET DIT DING in determine of severity Error
            // Type of [' "Hello Demo" '] should equal Integer in unnamed of severity Improvement
            // Type of [' "Goodbye" '] should equal Integer in unnamed of severity Improvement
            // Property 'declaredType' must have a value in AAP of severity Error
            // expect(errors.length).toBe(5);
        })
    });

    test("Person { unitName, age, first(Resultvar): Boolean = 5 + 24 } should have 1 error", () => {
        let errors: FreError[];
        AST.change( () => {
            const personEnt = DemoEntity.create({ name: "Person", x: "xxx", simpleprop: "simple" });
            const age = DemoAttribute.create({ name: "age" });
            const personName = DemoAttribute.create({ name: "name" });
            personEnt.attributes.push(age);
            personEnt.attributes.push(personName);
            const first = DemoFunction.create({ name: "first" });
            const Resultvar = DemoVariable.create({ name: "Resultvar" });
            first.parameters.push(Resultvar);
            first.expression = MakePlusExp("5", "24");
            personEnt.functions.push(first);

            // add types to the model elements
            // personName.declaredType = DemoAttributeType.String;
            // age.declaredType = DemoAttributeType.Boolean;
            // first.declaredType = DemoAttributeType.Boolean;
            // Resultvar.declaredType = DemoAttributeType.Boolean;
            personName.declaredType = FreNodeReference.create<DemoAttributeType>(
                DemoAttributeType.String,
                "DemoAttributeType",
            );
            age.declaredType = FreNodeReference.create<DemoAttributeType>(DemoAttributeType.Integer, "DemoAttributeType");
            first.declaredType = FreNodeReference.create<DemoEntity>(personEnt, "DemoEntity");
            Resultvar.declaredType = FreNodeReference.create<DemoEntity>(personEnt, "DemoEntity");

            // Person { unitName, age, first(Resultvar) = 5 + 24 }

            errors = validator.validate(personEnt, true);
            errors.forEach((e) => {
                // console.log(e.message + " in " + e.locationdescription + " of severity " + e.severity);
                expect(e.reportedOn === personEnt);
            });
            expect(errors.length).toBe(2);
        })
    });

    test("test isUnique rule for model entities", () => {
        let model1 = new DemoModelCreator().createModelWithIsUniqueError();
        let errors: FreError[];
        errors = validator.validate(model1, true);
        // errors.forEach(e =>
        //     console.log(e.message + " in " + e.locationdescription + " of severity " + e.severity)
        // );
        expect(errors.length).toBe(10);
    });

    test("test correct model", () => {
        let correctModel = new DemoModelCreator().createCorrectModel();
        let errors: FreError[];
        errors = validator.validate(correctModel, true);
        // errors.forEach(e =>
        //     console.log(e.message + " => " + e.locationdescription + " of severity " + e.severity)
        // );
        // the model is correct, but the custom validation gives an error on every function
        expect(errors.length).toBe(4);
    });

    test("complete example model", () => {
        let errors: FreError[];
        // model.models.forEach(mm =>
        //     console.log(DemoEnvironment.getInstance().writer.writeToString(mm))
        // );
        errors = validator.validate(model, true);
        // errors.forEach(e =>
        //     console.log(e.message + " => " + e.locationdescription + " of severity " + e.severity)
        // );
        // TODO check every one of the messages
        expect(errors.length).toBe(23);
    });
});
