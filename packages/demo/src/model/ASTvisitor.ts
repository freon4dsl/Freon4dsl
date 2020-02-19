import { DemoEntity } from "./domain/DemoEntity";
import { DemoAttribute } from "./domain/DemoAttribute";
import { DemoFunction } from "./domain/DemoFunction";
import { DemoVariable } from "./domain/DemoVariable";
import { DemoAttributeType } from "./domain/DemoAttributeType";
import { DemoModel } from "../model/DemoModel";
import { PiLogger } from "@projectit/core/src/util/PiLogging";

const LOGGER = new PiLogger("ASTvisitor"); // .mute();

export interface ASTvisitor {
    visitDemoModelBefore(mod: DemoModel) : boolean;
    visitDemoModelAfter(mod: DemoModel) : boolean;
    visitDemoEntityBefore(ent: DemoEntity) : boolean;
    visitDemoAttributeBefore(ent: DemoAttribute) : boolean;
    visitDemoFunctionBefore(ent: DemoFunction) : boolean;
    visitDemoVariableBefore(ent: DemoVariable) : boolean;
    visitAttributeTypeBefore(ent: DemoAttributeType) : boolean;
    visitDemoEntityAfter(ent: DemoEntity) : boolean;
    visitDemoAttributeAfter(ent: DemoAttribute) : boolean;
    visitDemoFunctionAfter(ent: DemoFunction) : boolean;
    visitDemoVariableAfter(ent: DemoVariable) : boolean;
    visitAttributeTypeAfter(ent: DemoAttributeType) : boolean;
     // should add all elements, expressions also
}

export class DefaultASTvisitor implements ASTvisitor{
    visitDemoModelBefore(mod: DemoModel): boolean {
        LOGGER.log("Method visitDemoModelBefore not implemented.");
        return true;
    }
    visitDemoModelAfter(mod: DemoModel): boolean {
        LOGGER.log("Method not implemented.");
        return true;
    }
    visitDemoEntityAfter(ent: DemoEntity): boolean {
        LOGGER.log("Method not implemented.");
        return true;
    }
    visitDemoAttributeAfter(ent: DemoAttribute): boolean {
        LOGGER.log("Method not implemented.");
        return true;
    }
    visitDemoFunctionAfter(ent: DemoFunction): boolean {
        LOGGER.log("Method not implemented.");
        return true;
    }
    visitDemoVariableAfter(ent: DemoVariable): boolean {
        LOGGER.log("Method not implemented.");
        return true;
    }
    visitAttributeTypeAfter(ent: DemoAttributeType): boolean {
        LOGGER.log("Method not implemented.");
        return true;
    }
    visitDemoEntityBefore(ent: DemoEntity): boolean {
        LOGGER.log("Method not implemented.");
        return true;
    }    
    visitDemoAttributeBefore(ent: DemoAttribute): boolean {
        LOGGER.log("Method not implemented.");
        return true;
    }
    visitDemoFunctionBefore(ent: DemoFunction): boolean {
        LOGGER.log("Method not implemented.");
        return true;
    }
    visitDemoVariableBefore(ent: DemoVariable): boolean {
        LOGGER.log("Method not implemented.");
        return true;
    }
    visitAttributeTypeBefore(ent: DemoAttributeType): boolean {
        LOGGER.log("Method not implemented.");
        return true;
    }
}