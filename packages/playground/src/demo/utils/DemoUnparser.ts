import { AllDemoConcepts, DemoAttributeType } from "../language/gen";
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

enum SeparatorType {
    NONE = "NONE",
    Terminator = "Terminator",
    Separator = "Separator"
}

export class DemoUnparser {

    public unparseDemoEntity(modelelement: DemoEntity): string {
        let result: string = modelelement.name + "{ ";

        // adding the unparse string of children in the model tree
        modelelement.attributes.forEach(p => {
            result = result.concat(this.unparse(p)).concat(", ");
        });
        modelelement.functions.forEach(p => {
            result = result.concat(this.unparse(p)).concat(", ");
        });

        return result + "\n}";
    }

    public unparseDemoFunction(modelelement: DemoFunction): string {
        let result: string = modelelement.name;

        result = result.concat("( ");
        modelelement.parameters.forEach(p => {
            result = result.concat(this.unparseList(modelelement.parameters, ", ", SeparatorType.Separator, false));
        });
        result = result.concat(" )");
        result = result.concat(": " + this.unparse(modelelement.declaredType));
        result = result.concat(" = " + this.unparse(modelelement.expression));
        return result;
    }

    public unparseDemoVariable(modelelement: DemoVariable): string {
        let result: string = modelelement.name;
        result = result.concat(" : " + modelelement.declaredType.name);
        return result;
    }

    public unparseDemoAttributeType(modelelement: DemoAttributeType) : string {
        let result : string = modelelement.asString();
        return result;
    }

    public unparseDemoPlaceholderExpression(modelelement: DemoPlaceholderExpression): string {
        return "placeHolderExpression";
    }

    public unparseDemoNumberLiteralExpression(modelelement: DemoNumberLiteralExpression): string {
        return modelelement.value;
    }

    public unparseDemoBooleanLiteralExpression(modelelement: DemoBooleanLiteralExpression): string {
        return modelelement.value;
    }

    public unparseDemoAbsExpression(modelelement: DemoAbsExpression): string {
        return "abs( " + this.unparseDemoExpression(modelelement.expr) + " )";
    }

    public unparseDemoVariableRef(modelelement: DemoVariableRef): string {
        return modelelement.attribute.name;
    }

    // below is copied from the generated unparser

    public unparse(modelelement: AllDemoConcepts): string {
        if (modelelement instanceof DemoVariableRef) {
            console.log("found a DemoVariableRef");
            return this.unparseDemoVariableRef(modelelement);
        }
        if (modelelement instanceof DemoIfExpression) {
            console.log("found a DemoIfExpression");
            return this.unparseDemoIfExpression(modelelement);
        }
        if (modelelement instanceof DemoFunctionCallExpression) {
            console.log("found a DemoFunctionCallExpression");
            return this.unparseDemoFunctionCallExpression(modelelement);
        }
        if (modelelement instanceof DemoEqualsExpression) {
            console.log("found a DemoEqualsExpression");
            return this.unparseDemoEqualsExpression(modelelement);
        }
        if (modelelement instanceof DemoGreaterThenExpression) {
            console.log("found a DemoGreaterThenExpression");
            return this.unparseDemoGreaterThenExpression(modelelement);
        }
        if (modelelement instanceof DemoLessThenExpression) {
            console.log("found a DemoLessThenExpression");
            return this.unparseDemoLessThenExpression(modelelement);
        }
        if (modelelement instanceof DemoComparisonExpression) {
            console.log("found a DemoComparisonExpression");
            return this.unparseDemoComparisonExpression(modelelement);
        }
        if (modelelement instanceof DemoOrExpression) {
            console.log("found a DemoOrExpression");
            return this.unparseDemoOrExpression(modelelement);
        }
        if (modelelement instanceof DemoAndExpression) {
            console.log("found a DemoAndExpression");
            return this.unparseDemoAndExpression(modelelement);
        }
        if (modelelement instanceof DemoDivideExpression) {
            console.log("found a DemoDivideExpression");
            return this.unparseDemoDivideExpression(modelelement);
        }
        if (modelelement instanceof DemoPlusExpression) {
            console.log("found a DemoPlusExpression");
            return this.unparseDemoPlusExpression(modelelement);
        }
        if (modelelement instanceof DemoMultiplyExpression) {
            console.log("found a DemoMultiplyExpression");
            return this.unparseDemoMultiplyExpression(modelelement);
        }
        if (modelelement instanceof DemoBinaryExpression) {
            console.log("found a DemoBinaryExpression");
            return this.unparseDemoBinaryExpression(modelelement);
        }
        if (modelelement instanceof DemoAbsExpression) {
            console.log("found a DemoAbsExpression");
            return this.unparseDemoAbsExpression(modelelement);
        }
        if (modelelement instanceof DemoBooleanLiteralExpression) {
            console.log("found a DemoBooleanLiteralExpression");
            return this.unparseDemoBooleanLiteralExpression(modelelement);
        }
        if (modelelement instanceof DemoNumberLiteralExpression) {
            console.log("found a DemoNumberLiteralExpression");
            return this.unparseDemoNumberLiteralExpression(modelelement);
        }
        if (modelelement instanceof DemoStringLiteralExpression) {
            console.log("found a DemoStringLiteralExpression");
            return this.unparseDemoStringLiteralExpression(modelelement);
        }
        if (modelelement instanceof DemoLiteralExpression) {
            console.log("found a DemoLiteralExpression");
            return this.unparseDemoLiteralExpression(modelelement);
        }
        if (modelelement instanceof DemoModel) {
            console.log("found a DemoModel");
            return this.unparseDemoModel(modelelement);
        }
        if (modelelement instanceof DemoEntity) {
            console.log("found a DemoEntity");
            return this.unparseDemoEntity(modelelement);
        }
        if (modelelement instanceof DemoAttribute) {
            console.log("found a DemoAttribute");
            return this.unparseDemoAttribute(modelelement);
        }
        if (modelelement instanceof DemoFunction) {
            console.log("found a DemoFunction");
            return this.unparseDemoFunction(modelelement);
        }
        if (modelelement instanceof DemoVariable) {
            console.log("found a DemoVariable");
            return this.unparseDemoVariable(modelelement);
        }
        if (modelelement instanceof DemoExpression) {
            console.log("found a DemoExpression");
            return this.unparseDemoExpression(modelelement);
        }
        if (modelelement instanceof DemoPlaceholderExpression) {
            console.log("found a DemoPlaceholderExpression");
            return this.unparseDemoPlaceholderExpression(modelelement);
        }

        if (modelelement instanceof DemoAttributeType) {
            return this.unparseDemoAttributeType(modelelement);
        }
    }

    private unparseDemoAttribute(modelelement: DemoAttribute): string {
        return "" + modelelement.name + ": " + this.unparse(modelelement.declaredType) + "";
    }

    private unparseDemoStringLiteralExpression(modelelement: DemoStringLiteralExpression): string {
        return "		'" + modelelement.value + "'";
    }

    private unparseDemoIfExpression(modelelement: DemoIfExpression): string {
        return (
            "if (" +
            this.unparse(modelelement.condition) +
            ") then\n          " +
            this.unparse(modelelement.whenTrue) +
            "\nelse\n   " +
            this.unparse(modelelement.whenFalse) +
            "\nendif"
        );
    }
    private unparseDemoPlusExpression(modelelement: DemoPlusExpression): string {
        return this.unparse(modelelement.left) + "+" + this.unparse(modelelement.right);
    }
    private unparseDemoMultiplyExpression(modelelement: DemoMultiplyExpression): string {
        return this.unparse(modelelement.left) + "*" + this.unparse(modelelement.right);
    }
    private unparseDemoDivideExpression(modelelement: DemoDivideExpression): string {
        return this.unparse(modelelement.left) + "/" + this.unparse(modelelement.right);
    }
    private unparseDemoLessThenExpression(modelelement: DemoLessThenExpression): string {
        return this.unparse(modelelement.left) + "<" + this.unparse(modelelement.right);
    }
    private unparseDemoOrExpression(modelelement: DemoOrExpression): string {
        return this.unparse(modelelement.left) + "or" + this.unparse(modelelement.right);
    }


    private unparseDemoFunctionCallExpression(modelelement: DemoFunctionCallExpression): string {
        return "CALL " + this.unparse(modelelement.functionDefinition.referred) + "(  )";
    }

    private unparseDemoModel(modelelement: DemoModel): string {
        return (
            "model " +
            modelelement.name +
            "{\nentities:\n    " +
            this.unparseList(modelelement.entities, "\n\n", SeparatorType.Terminator, true) +
            "\nmodel wide functions:\n    " +
            this.unparseList(modelelement.functions, "\n", SeparatorType.Separator, false) +
            "\n}"
        );
    }

    private unparseDemoExpression(modelelement: DemoExpression): string {
        return "'unparse' should be implemented by subclasses of DemoExpression";
    }

    private unparseDemoLiteralExpression(modelelement: DemoLiteralExpression): string {
        return "'unparse' should be implemented by subclasses of DemoLiteralExpression";
    }

    private unparseDemoBinaryExpression(modelelement: DemoBinaryExpression): string {
        return this.unparse(modelelement.left) + "DemoBinaryExpression" + this.unparse(modelelement.right);
    }
    private unparseDemoAndExpression(modelelement: DemoAndExpression): string {
        return this.unparse(modelelement.left) + "DemoAndExpression" + this.unparse(modelelement.right);
    }
    private unparseDemoComparisonExpression(modelelement: DemoComparisonExpression): string {
        return this.unparse(modelelement.left) + "DemoComparisonExpression" + this.unparse(modelelement.right);
    }
    private unparseDemoGreaterThenExpression(modelelement: DemoGreaterThenExpression): string {
        return this.unparse(modelelement.left) + "DemoGreaterThenExpression" + this.unparse(modelelement.right);
    }
    private unparseDemoEqualsExpression(modelelement: DemoEqualsExpression): string {
        return this.unparse(modelelement.left) + "DemoEqualsExpression" + this.unparse(modelelement.right);
    }

    private unparseList(list: AllDemoConcepts[], sepText: string, sepType: SeparatorType, vertical: boolean): string {
        let result: string = "";
        list.forEach(listElem => {
            result = result.concat(this.unparse(listElem));
            if (sepType === SeparatorType.Separator) {
                if (list.indexOf(listElem) !== list.length - 1) result = result.concat(sepText);
            }
            if (sepType === SeparatorType.Terminator) {
                result = result.concat(sepText);
            }
            if (vertical) result = result.concat("\n");
        });
        return result;
    }

}
