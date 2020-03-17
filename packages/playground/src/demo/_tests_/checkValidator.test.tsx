import { PiError } from "@projectit/core";
import { DemoModel, DemoAttributeType, DemoMultiplyExpression, DemoNumberLiteralExpression, DemoStringLiteralExpression, DemoDivideExpression } from "../language";
import { DemoTyper } from "../typer/DemoTyper";
import { DemoValidator } from "../validator/gen/DemoValidator";
import { DemoModelCreator } from "./DemoModelCreator";

describe('Testing Validator', () => {
    describe('Validate DemoModel Instance', () => {
        let model : DemoModel = new DemoModelCreator().model;
        let validator = new DemoValidator();
        validator.myTyper = new DemoTyper();
     
        beforeEach(done => {
          done();
        });

        test("multiplication 3 * 10", () => {
            let errors : PiError[] = [];
            let mult : DemoMultiplyExpression = new DemoMultiplyExpression();
            mult.left = new DemoNumberLiteralExpression("3");
            mult.right = new DemoNumberLiteralExpression("10"); 
            validator.validateDemoMultiplyExpression(mult, errors);
            expect(errors.length).toBe(0);
        });

        test("multiplication 3 * 'temp'", () => {
            let errors : PiError[] = [];
            let mult : DemoMultiplyExpression = new DemoMultiplyExpression();
            mult.left = new DemoNumberLiteralExpression("3");
            mult.right = new DemoStringLiteralExpression("temp");
            validator.validateDemoMultiplyExpression(mult, errors);
            expect(errors.length).toBe(1);
            errors.forEach(e =>
                expect(e.reportedOn).toBe(mult.right)
            );
        });

        test("multiplication (3/4) * 'temp'", () => {
            let errors : PiError[] = [];
            let div : DemoDivideExpression = new DemoDivideExpression();
            div.left = new DemoNumberLiteralExpression("3");
            div.right = new DemoNumberLiteralExpression("4");
            let mult : DemoMultiplyExpression = new DemoMultiplyExpression();
            mult.left = div;
            mult.right = new DemoStringLiteralExpression("temp");
            validator.validateDemoMultiplyExpression(mult,errors);
            expect(errors.length).toBe(1);
            errors.forEach(e =>
                expect(e.reportedOn).toBe(mult.right)
            );
        });

        test("list is not empty", () => {
            let errors : PiError[] = [];
            validator.validateDemoModel(new DemoModel(),errors);
            expect(errors.length).toBe(3);
        });

        test("name of DemoModel: YY\\XX", () => {
            let errors : PiError[] = [];
            let model = new DemoModel();
            model.name = "YY\\XX"
            validator.validateDemoModel(model,errors);
            expect(errors.length).toBe(3);            
        });
    });
});
