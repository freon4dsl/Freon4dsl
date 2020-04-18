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
    AllDemoConcepts,
    DemoFunction,
    DemoVariable,
    PiElementReference,
    DemoLiteralExpression,
    DemoBooleanLiteralExpression,
    DemoPlaceholderExpression
} from "../language/gen";
import { DemoTyper } from "../typer/gen/DemoTyper";
import { DemoValidator } from "../validator/gen/DemoValidator";
import { DemoModelCreator } from "./DemoModelCreator";
import { makeLiteralExp } from "./HelperFunctions";

describe('Testing Validator', () => {
    describe('Validate DemoModel Instance', () => {
        const model : DemoModel = new DemoModelCreator().model;
        const validator = new DemoValidator();
        validator.myTyper = new DemoTyper();
     
        beforeEach(done => {
          done();
        });

        test("multiplication 3 * 10", () => {
            let errors : PiError[] = [];
            let mult : DemoMultiplyExpression = new DemoMultiplyExpression();
            mult.left = makeLiteralExp("3");
            mult.right = makeLiteralExp("10"); 
            errors = validator.validate(mult);
            expect(errors.length).toBe(0);
        });

        test("multiplication 3 * 'temp'", () => {
            let errors : PiError[] = [];
            let mult : DemoMultiplyExpression = new DemoMultiplyExpression();
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
            let errors : PiError[] = [];
            let div : DemoDivideExpression = new DemoDivideExpression();
            div.left = makeLiteralExp("3");
            div.right = makeLiteralExp("4");
            let mult : DemoMultiplyExpression = new DemoMultiplyExpression();
            mult.left = div;
            mult.right = makeLiteralExp("temp");
            errors = validator.validate(mult);
            expect(errors.length).toBe(1);
            errors.forEach(e => {
                expect(e.reportedOn).toBe(mult.right);
                // console.log(e.message);
            });
        });

        test("list is not empty", () => {
            let errors : PiError[] = [];
            errors = validator.validate(new DemoModel());
            expect(errors.length).toBe(3);
        });

        test("incorrect name of DemoModel: YY\\XX", () => {
            let errors : PiError[] = [];
            let model = new DemoModel();
            model.name = "YY\\XX"
            errors = validator.validate(model);
            expect(errors.length).toBe(3);            
        });

        test("(1 + 2) * 'Person' should give type error", () => {
            let errors : PiError[] = [];
            const variableExpression = new DemoVariableRef();
            const attribute = DemoAttribute.create("Person");
            const personEnt = DemoEntity.create("Person");
            attribute.declaredType = new PiElementReference<DemoEntity>(personEnt, "DemoEntity");
            // attribute.declaredType = DemoAttributeType.String;
            variableExpression.attribute = new PiElementReference<DemoAttribute>(attribute, "DemoAttribute");

            const plusExpression = DemoModelCreator.MakePlusExp("1","2");
            const multiplyExpression = DemoModelCreator.MakeMultiplyExp(plusExpression, variableExpression);
            errors = validator.validate(multiplyExpression);
            expect(errors.length).toBe(1);
            errors.forEach(e =>
                expect(e.reportedOn === multiplyExpression)
            );
        })

        test("\"Hello Demo\" + \"Goodbye\"'' should have 2 errors", () => {
            let errors : PiError[] = [];
            let expression = DemoModelCreator.MakePlusExp("Hello Demo","Goodbye")
            // "Hello Demo" + "Goodbye"

            errors = validator.validate(expression);
            expect(errors.length).toBe(2);
            errors.forEach(e => {
                expect(e.reportedOn === expression);
                // console.log(e.message);
            });
        })

        test("'determine(AAP) : Boolean = \"Hello Demo\" + \"Goodbye\"'' should have 3 errors", () => {
            let errors : PiError[] = [];
            const determine = DemoFunction.create("determine");
            const AAP = DemoVariable.create("AAP");
            determine.parameters.push(AAP);
            determine.expression = DemoModelCreator.MakePlusExp("Hello Demo","Goodbye");
            const personEnt = DemoEntity.create("Person");
            determine.declaredType = new PiElementReference<DemoEntity>(personEnt, "DemoEntity");
            // determine(AAP) : Boolean = "Hello Demo" + "Goodbye"
            errors = validator.validate(determine, true);
            expect(errors.length).toBe(3);
            errors.forEach(e => {
                expect(e.reportedOn === determine);
                // console.log(e.message);
            });
        })

        test("Person { name, age, first(Resultvar): Boolean = 5 + 24 } should have 1 error", () => {
            let errors : PiError[] = [];
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
            // personName.declaredType = DemoAttributeType.String;
            // age.declaredType = DemoAttributeType.Boolean;
            // first.declaredType = DemoAttributeType.Boolean;
            // Resultvar.declaredType = DemoAttributeType.Boolean;
            personName.declaredType = new PiElementReference<DemoEntity>(personEnt, "DemoEntity");
            age.declaredType = new PiElementReference<DemoEntity>(personEnt, "DemoEntity");
            first.declaredType = new PiElementReference<DemoEntity>(personEnt, "DemoEntity");
            Resultvar.declaredType = new PiElementReference<DemoEntity>(personEnt, "DemoEntity");

            // Person { name, age, first(Resultvar) = 5 + 24 }
        
            errors = validator.validate(personEnt, true);
            errors.forEach(e => {
                expect(e.reportedOn === personEnt);
                // console.log(e.message)
            });
            expect(errors.length).toBe(1);            
        });

        test("complete example model with simple attribute types", () => {
            let errors : PiError[] = [];
            errors =validator.validate(model, true);
            // errors.forEach(e =>
            //     console.log(e.message)
            // );
            expect(errors.length).toBe(17);                
        });
    });
});



