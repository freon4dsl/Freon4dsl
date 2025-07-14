import { FreNodeReference, FreError, AST, FreNode, isNullOrUndefined } from "@freon4dsl/core";
import { DemoEnvironment } from "../config/gen/DemoEnvironment.js";
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
} from "../language/gen/index.js";
import { DemoValidator } from "../validator/gen/index.js";
import { DemoModelCreator } from "./DemoModelCreator.js";
import { makeLiteralExp, MakeMultiplyExp, MakePlusExp } from "./HelperFunctions.js";
import { describe, test, expect, beforeEach } from "vitest";

describe("Testing Validator", () => {
    DemoEnvironment.getInstance();
    const model: Demo = new DemoModelCreator().createIncorrectModel();
    const validator = new DemoValidator();

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
            expect(errors.length).toBe(5);
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
                console.log(e.message + " in " + e.locationdescription + " of severity " + e.severity);
                expect(e.reportedOn === personEnt);
            });
            console.log(personEnt.attributes.map(att => att.name))
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
        expect(errors.length).toBe(13);
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
        const reports: string[] = [];
        errors.forEach(e => {
            reports.push(e.message + " => " + e.locationdescription + " prop: " + e.propertyName + " node: " + p(e.reportedOn) + " of severity " + e.severity);
            // console.log(e.message + " => " + e.locationdescription + " prop: " + e.propertyName + " node: " + p(e.reportedOn) + " of severity " + e.severity);
            console.log(e.message);
        });
        // two extra errors because the validations on interfaces are taken into account
        expect(errors.length).toBe(26);
        expect(reports.includes("length EXPRESSION TYPE IS NOT CORRECT!! => length prop: Improvement node: ID-60 of severity TODO")).toBeTruthy();
        expect(reports.includes("ER IS IETS FLINK MIS MET DIT DING => length prop: Error node: ID-46 of severity TODO")).toBeTruthy();
        expect(reports.includes("Type of ' \"Person\" ' (String) should equal the type of Integer (Integer) => unnamed prop: TODO node: ID-59 of severity TODO")).toBeTruthy();
        expect(reports.includes("determine EXPRESSION TYPE IS NOT CORRECT!! => determine prop: Improvement node: ID-63 of severity TODO")).toBeTruthy();
        expect(reports.includes("ER IS IETS FLINK MIS MET DIT DING => determine prop: Error node: ID-61 of severity TODO")).toBeTruthy();
        expect(reports.includes("Type of ' \"Hello Demo\" ' (String) should equal the type of Integer (Integer) => unnamed prop: Improvement node: ID-64 of severity TODO")).toBeTruthy();
        expect(reports.includes("Type of ' \"Goodbye\" ' (String) should equal the type of Integer (Integer) => unnamed prop: Improvement node: ID-65 of severity TODO")).toBeTruthy();
        expect(reports.includes("last EXPRESSION TYPE IS NOT CORRECT!! => last prop: Improvement node: ID-67 of severity TODO")).toBeTruthy();
        expect(reports.includes("ER IS IETS FLINK MIS MET DIT DING => last prop: Error node: ID-66 of severity TODO")).toBeTruthy();
        expect(reports.includes("Type of ' \"woord\" ' (String) should equal the type of Integer (Integer) => unnamed prop: Improvement node: ID-69 of severity TODO")).toBeTruthy();
        expect(reports.includes("WAT IS DIT LEUK!! => unnamed prop: Info node: ID-68 of severity TODO")).toBeTruthy();
        expect(reports.includes("ER IS IETS FLINK MIS MET DIT DING => manyParams prop: Error node: ID-23 of severity TODO")).toBeTruthy();
        expect(reports.includes("Type of ' \"Person\" ' (String) should equal the type of Integer (Integer) => unnamed prop: TODO node: ID-44 of severity TODO")).toBeTruthy();
        expect(reports.includes("first EXPRESSION TYPE IS NOT CORRECT!! => first prop: Improvement node: ID-75 of severity TODO")).toBeTruthy();
        expect(reports.includes("ER IS IETS FLINK MIS MET DIT DING => first prop: Error node: ID-73 of severity TODO")).toBeTruthy();
        expect(reports.includes("another EXPRESSION TYPE IS NOT CORRECT!! => another prop: Improvement node: ID-100 of severity TODO")).toBeTruthy();
        expect(reports.includes("ER IS IETS FLINK MIS MET DIT DING => another prop: Error node: ID-81 of severity TODO")).toBeTruthy();
        expect(reports.includes(`Type of ' "Yes" ' or ' "No" ' == \`NOOT\` or ' "Hello World" ' < ' "Hello Universe" ' and ' "x" ' < 122 (Boolean) should equal the type of Integer (Integer) => unnamed prop: Improvement node: ID-95 of severity TODO`)).toBeTruthy();
        expect(reports.includes("WAT IS DIT LEUK!! => unnamed prop: Info node: ID-95 of severity TODO")).toBeTruthy();
        expect(reports.includes("Type of ' \"Yes\" ' (String) should equal the type of Boolean (Boolean) => unnamed prop: TODO node: ID-87 of severity TODO")).toBeTruthy();
        expect(reports.includes("Type of ' \"No\" ' (String) should equal the type of `NOOT` (Company2) => unnamed prop: TODO node: ID-85 of severity TODO")).toBeTruthy();
        expect(reports.includes("Type of ' \"x\" ' (String) should equal the type of 122 (Integer) => unnamed prop: TODO node: ID-89 of severity TODO")).toBeTruthy();
        expect(reports.includes("Property 'right' must have a value => unnamed prop: right node: ID-99 of severity Error")).toBeTruthy();
        expect(reports.includes("Type of  (undefined) should equal the type of Integer (Integer) => unnamed prop: TODO node: null-undefined of severity TODO")).toBeTruthy();
        expect(reports.includes("ER IS IETS FLINK MIS MET DIT DING => doClean prop: Error node: ID-10 of severity TODO")).toBeTruthy();
        expect(reports.includes("ER IS IETS FLINK MIS MET DIT DING => requestClean prop: Error node: ID-18 of severity TODO")).toBeTruthy();
    });
});

function p(n: FreNode | FreNode[]): string {
    if (isNullOrUndefined(n)) {
        return "null-undefined"
    } else if (Array.isArray(p)) {
        return(n as FreNode[]).map(f => f.freId()).join(", ")
    } else  {
        return (n as FreNode).freId()
    }
}
