import { AllDemoConcepts, AppliedFeature, DemoAttributeType } from "../language/gen";
import { PiValidator, PiError, PiTyper } from "@projectit/core";
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
} from "../language/gen";

export class DemoUnparser {
    public unparse(modelelement: AllDemoConcepts, includeChildren?: boolean): string {
        if (modelelement instanceof DemoModel) {
            return this.unparseDemoModel(modelelement, includeChildren);
        }
        if (modelelement instanceof DemoEntity) {
            return this.unparseDemoEntity(modelelement, includeChildren);
        }
        if (modelelement instanceof DemoAttribute) {
            return this.unparseDemoAttribute(modelelement, includeChildren);
        }
        if (modelelement instanceof DemoFunction) {
            return this.unparseDemoFunction(modelelement, includeChildren);
        }
        if (modelelement instanceof DemoVariable) {
            return this.unparseDemoVariable(modelelement, includeChildren);
        }
        if (modelelement instanceof DemoExpression) {
            return this.unparseDemoExpression(modelelement, includeChildren);
        }
        if (modelelement instanceof DemoPlaceholderExpression) {
            return this.unparseDemoPlaceholderExpression(modelelement, includeChildren);
        }
        if (modelelement instanceof DemoLiteralExpression) {
            return this.unparseDemoLiteralExpression(modelelement, includeChildren);
        }
        if (modelelement instanceof DemoStringLiteralExpression) {
            return this.unparseDemoStringLiteralExpression(modelelement, includeChildren);
        }
        if (modelelement instanceof DemoNumberLiteralExpression) {
            return this.unparseDemoNumberLiteralExpression(modelelement, includeChildren);
        }
        if (modelelement instanceof DemoBooleanLiteralExpression) {
            return this.unparseDemoBooleanLiteralExpression(modelelement, includeChildren);
        }
        if (modelelement instanceof DemoAbsExpression) {
            return this.unparseDemoAbsExpression(modelelement, includeChildren);
        }
        if (modelelement instanceof DemoBinaryExpression) {
            return this.unparseDemoBinaryExpression(modelelement, includeChildren);
        }
        if (modelelement instanceof DemoFunctionCallExpression) {
            return this.unparseDemoFunctionCallExpression(modelelement, includeChildren);
        }
        if (modelelement instanceof DemoIfExpression) {
            return this.unparseDemoIfExpression(modelelement, includeChildren);
        }
        if (modelelement instanceof DemoVariableRef) {
            return this.unparseDemoVariableRef(modelelement, includeChildren);
        }
        if (modelelement instanceof DemoAttributeType) {
            return this.unparseDemoAttributeType(modelelement, includeChildren);
        }
        if (modelelement instanceof AppliedFeature) {
            return this.unparseAppliedFeature(modelelement, includeChildren);
        }
        return "";
    }

    public unparseAppliedFeature(modelelement: AppliedFeature, includeChildren?: boolean): string {
        return "." + modelelement.value + (!!modelelement.appliedfeature ? this.unparse(modelelement.appliedfeature) : "");
    }

    public unparseDemoModel(modelelement: DemoModel, includeChildren?: boolean): string {
        let result: string = modelelement.name + "{ ";

        // adding the unparse string of children in the model tree
        if (!(includeChildren === undefined) && includeChildren) {
            modelelement.entities.forEach(p => {
                result = result.concat(this.unparseDemoEntity(p, includeChildren) + "\n");
            });
            modelelement.functions.forEach(p => {
                result = result.concat(this.unparseDemoFunction(p, includeChildren) + "\n");
            });
        }
        return result + "\n}";
    }

    public unparseDemoEntity(modelelement: DemoEntity, includeChildren?: boolean): string {
        let result: string = modelelement.name + "{ ";

        // adding the unparse string of children in the model tree
        if (!(includeChildren === undefined) && includeChildren) {
            modelelement.attributes.forEach(p => {
                result = result.concat(this.unparse(p, includeChildren)).concat(", ");
            });
            modelelement.functions.forEach(p => {
                result = result.concat(this.unparse(p, includeChildren)).concat(", ");
            });
        }
        return result + "\n}";
    }

    public unparseDemoAttribute(modelelement: DemoAttribute, includeChildren?: boolean): string {
        let result: string = modelelement.name;
        if (!(includeChildren === undefined) && includeChildren) {
            result = result.concat(" : " + this.unparse(modelelement.declaredType.referred, false));
        }
        return result;
    }

    public unparseDemoAttributeType(modelelement: DemoAttributeType, includeChildren?: boolean): string {
        let result: string = modelelement.asString();
        return result;
    }

    public unparseDemoFunction(modelelement: DemoFunction, includeChildren?: boolean): string {
        let result: string = modelelement.name;

        // adding the unparse string of children in the model tree
        if (!(includeChildren === undefined) && includeChildren) {
            result = result.concat("( ");
            modelelement.parameters.forEach(p => {
                result = result.concat(this.unparse(p, includeChildren));
            });
            result = result.concat(" )");
            result = result.concat(": " + this.unparse(modelelement.declaredType.referred, false));
            result = result.concat(" = " + this.unparse(modelelement.expression, includeChildren));
        } else {
            result.concat("()");
        }
        return result;
    }

    public unparseDemoVariable(modelelement: DemoVariable, includeChildren?: boolean): string {
        let result: string = modelelement.name;
        if (!(includeChildren === undefined) && includeChildren) {
            result = result.concat(" : " + modelelement.declaredType.name);
        }
        return result;
    }

    public unparseDemoExpression(modelelement: DemoExpression, includeChildren?: boolean): string {
        let result = "";
        if (modelelement instanceof DemoPlaceholderExpression) {
            result = result + result.concat(this.unparseDemoPlaceholderExpression(modelelement, includeChildren));
        }
        if (modelelement instanceof DemoLiteralExpression) {
            result = result + result.concat(this.unparseDemoLiteralExpression(modelelement, includeChildren));
        }
        if (modelelement instanceof DemoAbsExpression) {
            result = result + result.concat(this.unparseDemoAbsExpression(modelelement, includeChildren));
        }
        if (modelelement instanceof DemoBinaryExpression) {
            result = result + result.concat(this.unparseDemoBinaryExpression(modelelement, includeChildren));
        }
        if (modelelement instanceof DemoFunctionCallExpression) {
            result = result + result.concat(this.unparseDemoFunctionCallExpression(modelelement, includeChildren));
        }
        if (modelelement instanceof DemoIfExpression) {
            result = result + result.concat(this.unparseDemoIfExpression(modelelement, includeChildren));
        }
        if (modelelement instanceof DemoVariableRef) {
            result = result + result.concat(this.unparseDemoVariableRef(modelelement, includeChildren));
        }
        if (!!modelelement.appliedfeature) {
            result = result + result.concat(this.unparse(modelelement.appliedfeature));
        }
        return result;
    }

    public unparseDemoPlaceholderExpression(modelelement: DemoPlaceholderExpression, includeChildren?: boolean): string {
        return "placeHolderExpression";
    }

    public unparseDemoLiteralExpression(modelelement: DemoLiteralExpression, includeChildren?: boolean): string {
        if (modelelement instanceof DemoStringLiteralExpression) {
            return this.unparseDemoStringLiteralExpression(modelelement, includeChildren);
        }
        if (modelelement instanceof DemoNumberLiteralExpression) {
            return this.unparseDemoNumberLiteralExpression(modelelement, includeChildren);
        }
        if (modelelement instanceof DemoBooleanLiteralExpression) {
            return this.unparseDemoBooleanLiteralExpression(modelelement, includeChildren);
        }
        return "";
    }

    public unparseDemoStringLiteralExpression(modelelement: DemoStringLiteralExpression, includeChildren?: boolean): string {
        return '"' + modelelement.value + '"';
    }

    public unparseDemoNumberLiteralExpression(modelelement: DemoNumberLiteralExpression, includeChildren?: boolean): string {
        return modelelement.value;
    }

    public unparseDemoBooleanLiteralExpression(modelelement: DemoBooleanLiteralExpression, includeChildren?: boolean): string {
        return modelelement.value;
    }

    public unparseDemoAbsExpression(modelelement: DemoAbsExpression, includeChildren?: boolean): string {
        return "abs( " + this.unparseDemoExpression(modelelement.expr, includeChildren) + " )";
    }

    public unparseDemoBinaryExpression(modelelement: DemoBinaryExpression, includeChildren?: boolean): string {
        let symbol = "SYMBOL";
        // TODO This should be taken from the editor definition.
        switch (modelelement.$typename) {
            case "DemoPlusExpression":
                symbol = "+";
                break;
            case "DemoDivideExpression":
                symbol = "/";
                break;
            case "DemoMultiplyExpression":
                symbol = "*";
                break;
        }
        return "( " + this.unparseDemoExpression(modelelement.left) + " " + symbol + " " + this.unparseDemoExpression(modelelement.right) + " )";
    }

    public unparseDemoFunctionCallExpression(modelelement: DemoFunctionCallExpression, includeChildren?: boolean): string {
        return modelelement.functionDefinition.name + "()";
    }

    public unparseDemoIfExpression(modelelement: DemoIfExpression, includeChildren?: boolean): string {
        return (
            "if ( " +
            this.unparseDemoExpression(modelelement.condition) +
            " ) { " +
            this.unparseDemoExpression(modelelement.whenTrue, includeChildren) +
            " } else { " +
            this.unparseDemoExpression(modelelement.whenFalse, includeChildren) +
            " }"
        );
    }

    public unparseDemoVariableRef(modelelement: DemoVariableRef, includeChildren?: boolean): string {
        return modelelement.variable.name;
    }
}
