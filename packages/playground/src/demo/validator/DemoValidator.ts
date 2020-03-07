import { AllDemoConcepts, DemoAttributeType } from "../language";
import { IDemoValidator } from "../language/IDemoValidator";
import { ViError } from "../language/IDemoValidator";
import { DemoConceptType } from "../language/Demo";
import {
    DemoModel,
    DemoEntity,
    DemoAttribute,
    DemoFunction,
    DemoVariable,
    DemoExpression,
    DemoPlaceholderExpression,
    DemoLiteralExpression,
    DemoStringLiteralExpression,
    DemoNumberLiteralExpression,
    DemoBooleanLiteralExpression,
    DemoAbsExpression,
    DemoBinaryExpression,
    DemoMultiplyExpression,
    DemoPlusExpression,
    DemoDivideExpression,
    DemoAndExpression,
    DemoOrExpression,
    DemoComparisonExpression,
    DemoLessThenExpression,
    DemoGreaterThenExpression,
    DemoEqualsExpression,
    DemoFunctionCallExpression,
    DemoIfExpression,
    DemoVariableRef
} from "../language";
import { DemoTyper } from "../typer/DemoTyper";

export class DemoValidator implements IDemoValidator {
    typer = new DemoTyper();


    public validate(modelelement: AllDemoConcepts, includeChildren?: boolean): ViError[] {
        let result: ViError[] = [];

        if (modelelement instanceof DemoModel) {
            result.concat(this.validateDemoModel(modelelement, includeChildren));
        }
        if (modelelement instanceof DemoEntity) {
            result.concat(this.validateDemoEntity(modelelement, includeChildren));
        }
        if (modelelement instanceof DemoAttribute) {
            result.concat(this.validateDemoAttribute(modelelement, includeChildren));
        }
        if (modelelement instanceof DemoFunction) {
            result.concat(this.validateDemoFunction(modelelement, includeChildren));
        }
        if (modelelement instanceof DemoVariable) {
            result.concat(this.validateDemoVariable(modelelement, includeChildren));
        }
        if (modelelement instanceof DemoExpression) {
            result.concat(this.validateDemoExpression(modelelement, includeChildren));
        }
        if (modelelement instanceof DemoPlaceholderExpression) {
            result.concat(this.validateDemoPlaceholderExpression(modelelement, includeChildren));
        }
        if (modelelement instanceof DemoLiteralExpression) {
            result.concat(this.validateDemoLiteralExpression(modelelement, includeChildren));
        }
        if (modelelement instanceof DemoStringLiteralExpression) {
            result.concat(this.validateDemoStringLiteralExpression(modelelement, includeChildren));
        }
        if (modelelement instanceof DemoNumberLiteralExpression) {
            result.concat(this.validateDemoNumberLiteralExpression(modelelement, includeChildren));
        }
        if (modelelement instanceof DemoBooleanLiteralExpression) {
            result.concat(this.validateDemoBooleanLiteralExpression(modelelement, includeChildren));
        }
        if (modelelement instanceof DemoAbsExpression) {
            result.concat(this.validateDemoAbsExpression(modelelement, includeChildren));
        }
        if (modelelement instanceof DemoBinaryExpression) {
            result.concat(this.validateDemoBinaryExpression(modelelement, includeChildren));
        }
        if (modelelement instanceof DemoMultiplyExpression) {
            result.concat(this.validateDemoMultiplyExpression(modelelement, includeChildren));
        }
        if (modelelement instanceof DemoPlusExpression) {
            result.concat(this.validateDemoPlusExpression(modelelement, includeChildren));
        }
        if (modelelement instanceof DemoDivideExpression) {
            result.concat(this.validateDemoDivideExpression(modelelement, includeChildren));
        }
        if (modelelement instanceof DemoAndExpression) {
            result.concat(this.validateDemoAndExpression(modelelement, includeChildren));
        }
        if (modelelement instanceof DemoOrExpression) {
            result.concat(this.validateDemoOrExpression(modelelement, includeChildren));
        }
        if (modelelement instanceof DemoComparisonExpression) {
            result.concat(this.validateDemoComparisonExpression(modelelement, includeChildren));
        }
        if (modelelement instanceof DemoLessThenExpression) {
            result.concat(this.validateDemoLessThenExpression(modelelement, includeChildren));
        }
        if (modelelement instanceof DemoGreaterThenExpression) {
            result.concat(this.validateDemoGreaterThenExpression(modelelement, includeChildren));
        }
        if (modelelement instanceof DemoEqualsExpression) {
            result.concat(this.validateDemoEqualsExpression(modelelement, includeChildren));
        }
        if (modelelement instanceof DemoFunctionCallExpression) {
            result.concat(this.validateDemoFunctionCallExpression(modelelement, includeChildren));
        }
        if (modelelement instanceof DemoIfExpression) {
            result.concat(this.validateDemoIfExpression(modelelement, includeChildren));
        }
        if (modelelement instanceof DemoVariableRef) {
            result.concat(this.validateDemoVariableRef(modelelement, includeChildren));
        }

        return result;
    }

    validateDemoModel(modelelement: DemoModel, includeChildren?: boolean): ViError[] {
        let result: ViError[] = [];
        // include validations here

        // @notEmpty entities
        if(modelelement.entities.length == 0) {
            result.push(new ViError("List of entities may not be empty", modelelement.entities));
        }

        if (!(includeChildren === undefined) && includeChildren) {
            modelelement.entities.forEach(p => {
                result.concat(this.validateDemoEntity(p, includeChildren));
            });
            modelelement.functions.forEach(p => {
                result.concat(this.validateDemoFunction(p, includeChildren));
            });
        }

        return result;
    }

    validateDemoEntity(modelelement: DemoEntity, includeChildren?: boolean): ViError[] {
        let result: ViError[] = [];
        // include validations here

        if (!(includeChildren === undefined) && includeChildren) {
            modelelement.attributes.forEach(p => {
                result.concat(this.validateDemoAttribute(p, includeChildren));
            });
            modelelement.functions.forEach(p => {
                result.concat(this.validateDemoFunction(p, includeChildren));
            });
        }

        return result;
    }

    validateDemoAttribute(modelelement: DemoAttribute, includeChildren?: boolean): ViError[] {
        let result: ViError[] = [];
        // include validations here

        return result;
    }

    validateDemoFunction(modelelement: DemoFunction, includeChildren?: boolean): ViError[] {
        let result: ViError[] = [];
        // include validations here

        if (!(includeChildren === undefined) && includeChildren) {
            result.concat(this.validateDemoExpression(modelelement.expression, includeChildren));
            modelelement.parameters.forEach(p => {
                result.concat(this.validateDemoVariable(p, includeChildren));
            });
        }

        return result;
    }

    validateDemoVariable(modelelement: DemoVariable, includeChildren?: boolean): ViError[] {
        let result: ViError[] = [];
        // include validations here

        return result;
    }

    validateDemoExpression(modelelement: DemoExpression, includeChildren?: boolean): ViError[] {
        let result: ViError[] = [];
        // include validations here

        return result;
    }

    validateDemoPlaceholderExpression(modelelement: DemoPlaceholderExpression, includeChildren?: boolean): ViError[] {
        let result: ViError[] = [];
        // include validations here

        return result;
    }

    validateDemoLiteralExpression(modelelement: DemoLiteralExpression, includeChildren?: boolean): ViError[] {
        let result: ViError[] = [];
        // include validations here

        return result;
    }

    validateDemoStringLiteralExpression(modelelement: DemoStringLiteralExpression, includeChildren?: boolean): ViError[] {
        let result: ViError[] = [];
        // include validations here

        return result;
    }

    validateDemoNumberLiteralExpression(modelelement: DemoNumberLiteralExpression, includeChildren?: boolean): ViError[] {
        let result: ViError[] = [];
        // include validations here

        return result;
    }

    validateDemoBooleanLiteralExpression(modelelement: DemoBooleanLiteralExpression, includeChildren?: boolean): ViError[] {
        let result: ViError[] = [];
        // include validations here

        return result;
    }

    validateDemoAbsExpression(modelelement: DemoAbsExpression, includeChildren?: boolean): ViError[] {
        let result: ViError[] = [];
        // include validations here

        if (!(includeChildren === undefined) && includeChildren) {
            result.concat(this.validateDemoExpression(modelelement.expr, includeChildren));
        }

        return result;
    }

    validateDemoBinaryExpression(modelelement: DemoBinaryExpression, includeChildren?: boolean): ViError[] {
        let result: ViError[] = [];
        // include validations here

        if (!(includeChildren === undefined) && includeChildren) {
            result.concat(this.validateDemoExpression(modelelement.left, includeChildren));
            result.concat(this.validateDemoExpression(modelelement.right, includeChildren));
        }

        return result;
    }

    validateDemoMultiplyExpression(modelelement: DemoMultiplyExpression, includeChildren?: boolean): ViError[] {
        let result: ViError[] = [];
        // include validations here

        // @typecheck left.type = DemoAttributeType.Integer
        if(this.typer.inferType(modelelement.left) !== DemoAttributeType.Integer) {
            result.push(new ViError("Type should be Integer", modelelement.left));
        }

        // @typecheck right.type = DemoAttributeType.Integer
        if(this.typer.inferType(modelelement.right) !== DemoAttributeType.Integer) {
            result.push(new ViError("Type should be Integer", modelelement.right));
        }
        // check rules of baseconcept(s)
        result.concat(this.validateDemoBinaryExpression(modelelement, includeChildren));
        return result;
    }

    validateDemoPlusExpression(modelelement: DemoPlusExpression, includeChildren?: boolean): ViError[] {
        let result: ViError[] = [];
        // include validations here

        return result;
    }

    validateDemoDivideExpression(modelelement: DemoDivideExpression, includeChildren?: boolean): ViError[] {
        let result: ViError[] = [];
        // include validations here

        return result;
    }

    validateDemoAndExpression(modelelement: DemoAndExpression, includeChildren?: boolean): ViError[] {
        let result: ViError[] = [];
        // include validations here

        return result;
    }

    validateDemoOrExpression(modelelement: DemoOrExpression, includeChildren?: boolean): ViError[] {
        let result: ViError[] = [];
        // include validations here

        return result;
    }

    validateDemoComparisonExpression(modelelement: DemoComparisonExpression, includeChildren?: boolean): ViError[] {
        let result: ViError[] = [];
        // include validations here

        return result;
    }

    validateDemoLessThenExpression(modelelement: DemoLessThenExpression, includeChildren?: boolean): ViError[] {
        let result: ViError[] = [];
        // include validations here

        return result;
    }

    validateDemoGreaterThenExpression(modelelement: DemoGreaterThenExpression, includeChildren?: boolean): ViError[] {
        let result: ViError[] = [];
        // include validations here

        return result;
    }

    validateDemoEqualsExpression(modelelement: DemoEqualsExpression, includeChildren?: boolean): ViError[] {
        let result: ViError[] = [];
        // include validations here

        return result;
    }

    validateDemoFunctionCallExpression(modelelement: DemoFunctionCallExpression, includeChildren?: boolean): ViError[] {
        let result: ViError[] = [];
        // include validations here

        return result;
    }

    validateDemoIfExpression(modelelement: DemoIfExpression, includeChildren?: boolean): ViError[] {
        let result: ViError[] = [];
        // include validations here

        if (!(includeChildren === undefined) && includeChildren) {
            result.concat(this.validateDemoExpression(modelelement.condition, includeChildren));
            result.concat(this.validateDemoExpression(modelelement.whenTrue, includeChildren));
            result.concat(this.validateDemoExpression(modelelement.whenFalse, includeChildren));
        }

        return result;
    }

    validateDemoVariableRef(modelelement: DemoVariableRef, includeChildren?: boolean): ViError[] {
        let result: ViError[] = [];
        // include validations here

        return result;
    }
}
