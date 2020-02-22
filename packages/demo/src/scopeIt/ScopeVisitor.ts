import { DefaultASTvisitor } from "../model/ASTvisitor";
import { DemoEntity, DemoAttribute, DemoFunction, DemoVariable, DemoAttributeType, DemoModel } from "..";
import { PiLogger } from "@projectit/core/src/util/PiLogging";

const LOGGER = new PiLogger("ScopeVisitor"); // .mute();

// we visit only the metamodel elements marked as namespaces
export class ScopeVisitor extends DefaultASTvisitor {
    visitDemoModelBefore(mod: DemoModel): boolean {
        LOGGER.log("Method not implemented.");
        return true;
    }
    
    visitDemoModelAfter(mod: DemoModel): boolean {
        LOGGER.log("Method not implemented.");
        return true;
    }

    visitDemoEntityBefore(ent: DemoEntity): boolean {
        // gather names in this entity
        let foo = new Map<string, Set<string>>();
        let foo2 = new Set<string>();
        foo2.add("iets");
        foo2.add("nog-iets");
        foo.set(ent.name, foo2);
        return true;
    }    

    visitDemoEntityAfter(ent: DemoEntity): boolean {
        LOGGER.log("Method not implemented.");
        return true;
    }

    visitDemoFunctionBefore(ent: DemoFunction): boolean {
        LOGGER.log("Method not implemented.");
        return true;
    }

    visitDemoFunctionAfter(ent: DemoFunction): boolean {
        LOGGER.log("Method not implemented.");
        return true;
    }
}