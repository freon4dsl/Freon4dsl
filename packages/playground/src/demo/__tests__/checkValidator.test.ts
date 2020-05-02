import { PiError, PiElement } from "@projectit/core";
import {
    DemoModel,
    DemoAttributeType,
    DemoMultiplyExpression,
    DemoNumberLiteralExpression,
    DemoStringLiteralExpression,
    DemoDivideExpression,
    DemoVariableRef,
    DemoEntity,
    DemoAttribute,
    DemoEveryConcept,
    DemoFunction,
    DemoVariable,
    PiElementReference,
    DemoLiteralExpression,
    DemoBooleanLiteralExpression
} from "../language/gen";
import { DemoTyper } from "../typer/gen/DemoTyper";
import { DemoValidator } from "../validator/gen/DemoValidator";
import { DemoModelCreator } from "./DemoModelCreator";
import { makeLiteralExp, MakeMultiplyExp, MakePlusExp } from "./HelperFunctions";

describe("Testing Validator", () => {
    describe("Validate DemoModel Instance", () => {
        const model: DemoModel = new DemoModelCreator().createCorrectModel();
        const validator = new DemoValidator();
        validator.myTyper = new DemoTyper();

        beforeEach(done => {
            done();
        });

        test("multiplication 3 * 10", () => {
            let errors: PiError[] = [];
            let mult: DemoMultiplyExpression = new DemoMultiplyExpression();
            mult.left = makeLiteralExp("3");
            mult.right = makeLiteralExp("10");
            errors = validator.validate(mult);
            expect(errors.length).toBe(0);
        });

        test("multiplication 3 * 'temp'", () => {
            let errors: PiError[] = [];
            let mult: DemoMultiplyExpression = new DemoMultiplyExpression();
            mult.left = makeLiteralExp("3");
            mult.right = makeLiteralExp("temp");
            errors = validator.validate(mult);
            expect(errors.length).toBe(1);
            errors.forEach(e => {
                expect(e.reportedOn).toBe(mult.right);
                // console.log(e.message);
            });
        });

        test("multiplication (3/4) * 'temp'", () => {
            let errors: PiError[] = [];
            let div: DemoDivideExpression = new DemoDivideExpression();
            div.left = makeLiteralExp("3");
            div.right = makeLiteralExp("4");
            let mult: DemoMultiplyExpression = new DemoMultiplyExpression();
            mult.left = div;
            mult.right = makeLiteralExp("temp");
            errors = validator.validate(mult);
            expect(errors.length).toBe(1);
            errors.forEach(e => {
                expect(e.reportedOn).toBe(mult.right);
                // console.log(e.message);
            });
        });

        test("'self.entities' and 'self.functions' may not empty and model name should be valid", () => {
            let errors: PiError[] = [];
            errors = validator.validate(new DemoModel());
            // let text = "";
            // for (let e of errors) {
            //     text = text.concat(e.message + "\n");
            // }
            // console.log(text);
            // TODO this number should be 3 instead of 2, error on valid name is faulty
            expect(errors.length).toBe(2);
        });

        test("incorrect name of DemoModel: YY\\XX", () => {
            let errors: PiError[] = [];
            let model = new DemoModel();
            model.name = "YY\\XX";
            errors = validator.validate(model);
            expect(errors.length).toBe(3);
        });

        test("(1 + 2) * 'Person' should give type error", () => {
            let errors: PiError[] = [];
            const variableExpression = new DemoVariableRef();
            const variable = DemoVariable.create({name: "PersonVar"});
            const personEnt = DemoEntity.create({name: "Person"});
            variable.declaredType = PiElementReference.create<DemoEntity>(personEnt, "DemoEntity");
            variableExpression.variable = PiElementReference.create<DemoVariable>(variable, "DemoVariable");

            const plusExpression = MakePlusExp("1", "2");
            const multiplyExpression = MakeMultiplyExp(plusExpression, variableExpression);
            errors = validator.validate(multiplyExpression);
            expect(errors.length).toBe(1);
            errors.forEach(e => expect(e.reportedOn === multiplyExpression));
        });

        test('"Hello Demo" + "Goodbye"\'\' should have 2 errors', () => {
            let errors: PiError[] = [];
            let expression = MakePlusExp("Hello Demo", "Goodbye");
            // "Hello Demo" + "Goodbye"

            errors = validator.validate(expression);
            expect(errors.length).toBe(2);
            errors.forEach(e => {
                expect(e.reportedOn === expression);
                // console.log(e.message);
            });
        });

        // TODO error in reference
        test('\'determine(AAP) : Boolean = "Hello Demo" + "Goodbye"\'\' should have 3 errors', () => {
            let errors: PiError[] = [];
            const determine = DemoFunction.create({name: "determine"});
            const AAP = DemoVariable.create({name: "AAP"});
            determine.parameters.push(AAP);
            determine.expression = MakePlusExp("Hello Demo", "Goodbye");
            const personEnt = DemoEntity.create({name: "Person"});
            determine.declaredType = PiElementReference.create<DemoEntity>(personEnt, "DemoEntity");
            // determine(AAP) : Boolean = "Hello Demo" + "Goodbye"
            errors = validator.validate(determine, true);
            errors.forEach(e => {
                console.log(e.message);
                // expect(e.reportedOn === determine);
            });
            expect(errors.length).toBe(3);
        });

        // TODO error in reference
        test("Person { name, age, first(Resultvar): Boolean = 5 + 24 } should have 1 error", () => {
            let errors: PiError[] = [];
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
            personName.declaredType = PiElementReference.create<DemoAttributeType>(DemoAttributeType.String, "DemoAttributeType");
            age.declaredType = PiElementReference.create<DemoAttributeType>(DemoAttributeType.Integer, "DemoAttributeType");
            first.declaredType = PiElementReference.create<DemoEntity>(personEnt, "DemoEntity");
            Resultvar.declaredType = PiElementReference.create<DemoEntity>(personEnt, "DemoEntity");

            // Person { name, age, first(Resultvar) = 5 + 24 }

            errors = validator.validate(personEnt, true);
            errors.forEach(e => {
                console.log(e.message)
                // expect(e.reportedOn === personEnt);
            });
            expect(errors.length).toBe(1);
        });

        test("complete example model with simple attribute types", () => {
            let errors: PiError[] = [];
            errors = validator.validate(model, true);
            // errors.forEach(e =>
            //     console.log(e.message)
            // );
            expect(errors.length).toBe(17);
        });
    });
});
