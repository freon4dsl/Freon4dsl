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
            errors = validator.validateDemoMultiplyExpression(mult);
            expect(errors.length).toBe(0);
        });

        test.skip("multiplication 3 * 'temp'", () => {
            let errors : PiError[] = [];
            let mult : DemoMultiplyExpression = new DemoMultiplyExpression();
            mult.left = new DemoNumberLiteralExpression("3");
            mult.right = new DemoStringLiteralExpression("temp");
            errors = validator.validateDemoMultiplyExpression(mult);
            expect(errors.length).toBe(1);
            errors.forEach(e =>
                expect(e.reportedOn).toBe(mult.right)
            );
        });

        test.skip("multiplication (3/4) * 'temp'", () => {
            let errors : PiError[] = [];
            let div : DemoDivideExpression = new DemoDivideExpression();
            div.left = new DemoNumberLiteralExpression("3");
            div.right = new DemoNumberLiteralExpression("4");
            let mult : DemoMultiplyExpression = new DemoMultiplyExpression();
            mult.left = div;
            mult.right = new DemoStringLiteralExpression("temp");
            errors = validator.validateDemoMultiplyExpression(mult);
            expect(errors.length).toBe(1);
            errors.forEach(e =>
                expect(e.reportedOn).toBe(mult.right)
            );
        });

        test.skip("list model.entities is not empty", () => {
            let errors : PiError[] = [];
            errors = validator.validateDemoModel(new DemoModel());
            expect(errors.length).toBe(1);
            errors.forEach(e =>
                expect(e.message).toBe("List of this.entities may not be empty")
            );
            
        });
    });
});
