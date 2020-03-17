import { DemoMultiplyExpression, DemoAttributeType, DemoModel } from "../language";
import { PiError, PiTyper } from "@projectit/core";
import { DemoTyper } from "demo/typer/DemoTyper";

export class DemoValidationChecker { 
    checkMultiplyExpression(modelelement: DemoMultiplyExpression, typer: PiTyper) : PiError[] {
        let result: PiError[] = [];
    
        // @typecheck left.type = DemoAttributeType.Integer
        if(!typer.equalsType(modelelement.left, DemoAttributeType.Integer)) {
            result.push(new PiError("Type should be Integer", modelelement.left));
        }
    
        // @typecheck right.type = DemoAttributeType.Integer
        if(typer.equalsType(modelelement.right, DemoAttributeType.Integer)) {
            result.push(new PiError("Type should be Integer", modelelement.right));
        }
    
        if(!typer.conformsTo(modelelement.left, modelelement.right)) {
            result.push(new PiError("Types do not conform", modelelement));
        }
        return result;
    }
    
    checkDemoModel(modelelement: DemoModel, typer: DemoTyper) : PiError[] {
        let result: PiError[] = [];
        // @notEmpty entities
        if(modelelement.entities.length == 0) {
            result.push(new PiError("List of entities may not be empty", modelelement.entities));
        }
        return result;
    }
    }