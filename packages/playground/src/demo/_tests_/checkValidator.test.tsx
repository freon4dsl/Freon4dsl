import { PiError } from "@projectit/core";
import { DemoModel, DemoAttributeType, DemoMultiplyExpression, DemoNumberLiteralExpression, DemoStringLiteralExpression, DemoDivideExpression } from "../language";
import { DemoTyper } from "../typer/DemoTyper";
import { DemoValidator } from "../validator/DemoValidator";
import { DemoModelCreator } from "./DemoModelCreator";

describe('Testing Validator', () => {
    describe('Validate DemoModel Instance', () => {
        let model : DemoModel = new DemoModelCreator().model;
        let validator = new DemoValidator();
     
        beforeEach(done => {
          done();
        });

        test("multiplication 3 * 10", () => {
            let errors : PiError[] = [];
            let mult : DemoMultiplyExpression = new DemoMultiplyExpression();
            mult.left = new DemoNumberLiteralExpression("3");
            mult.right = new DemoNumberLiteralExpression("10");
            errors = validator.validateDemoMultiplyExpression(mult);
            // expect(errors.length).toBe(0);
        });

        test.skip("multiplication 3 * 'temp'", () => {
            let errors : PiError[] = [];
            let mult : DemoMultiplyExpression = new DemoMultiplyExpression();
            mult.left = new DemoNumberLiteralExpression("3");
            mult.right = new DemoStringLiteralExpression("temp");
            errors = validator.validateDemoMultiplyExpression(mult);
            expect(errors.length).toBe(1);
            // TODO use expect for under
            errors.forEach(e =>
                console.dir("'" + e.message + "' reported on [" + e.reportedOn + "]")
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
                console.log("'" + e.message + "' reported on [" + e.reportedOn + "]")
            );
        });

    });
});
