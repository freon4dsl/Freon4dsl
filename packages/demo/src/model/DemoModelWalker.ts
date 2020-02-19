import { DemoModel, DemoAttribute, DemoFunction, DemoExpression, DemoVariable } from ".";
import { ASTvisitor } from "./ASTvisitor";
import { DemoEntity } from "./domain/DemoEntity";

export class DemoModelWalker {

    constructor() {
    }

    walkDemoModel(ast: DemoModel, visitor: ASTvisitor) {
        visitor.visitDemoModelBefore(ast);
        ast.entities.forEach( ent =>
            this.walkDemoEntity(ent, visitor)
            );
        ast.functions.forEach( fun =>
            this.walkDemoFunction(fun, visitor)
            );
        visitor.visitDemoModelAfter(ast);
    }

    walkDemoEntity(ent: DemoEntity, visitor: ASTvisitor) {
        visitor.visitDemoEntityBefore(ent);
        ent.attributes.forEach( att =>
            this.walkDemoAttribute(att, visitor)
        );
        visitor.visitDemoEntityAfter(ent);
    }

    // we only walk further when the model element is marked as part
    walkDemoAttribute(att: DemoAttribute, visitor: ASTvisitor) {
        visitor.visitDemoAttributeBefore(att);
        visitor.visitDemoAttributeAfter(att);
     }

     walkDemoFunction(fun: DemoFunction, visitor: ASTvisitor) {
        visitor.visitDemoFunctionBefore(fun);
        fun.parameters.forEach( att =>
            this.walkDemoVariable(att, visitor)
        );
        this.walkDemoExpression(fun.expression, visitor);
        visitor.visitDemoFunctionAfter(fun);
    }
    
    walkDemoVariable(vb: DemoVariable, visitor: ASTvisitor): void {
        visitor.visitDemoVariableBefore(vb);
        visitor.visitDemoVariableAfter(vb);
    }

    walkDemoExpression(exp: DemoExpression, visitor: ASTvisitor) {
        console.log("walkDemoExpression Method not implemented.");
    }

}
