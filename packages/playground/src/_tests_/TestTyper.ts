import { DemoTyper, Typer, DemoType } from "../typeIt/DemoTyper";
import { DemoModel, DemoFunction, DemoAttributeType } from "language";
import { DemoModelElement } from "scopeIt/DemoModelElement";

export class TestTyper {
	TEST_TYPER_inferType(typer : DemoTyper, model : DemoModel) {
        model.functions.forEach(fun => {
            this.testFunResultAndExpTypes(fun, typer);
        });
        model.entities.forEach(ent => {
            ent.functions.forEach(fun => {
                this.testFunResultAndExpTypes(fun, typer);
            });
        });
    }

    private testFunResultAndExpTypes(fun: DemoFunction, typer: DemoTyper) {
        if (fun.expression !== null) {
            let expType = typer.inferType(fun.expression);
            console.log("Found type " + expType.toString() + " for expression " + fun.expression.toString());
            // this.test_base_to_testType(typer, expType, fun.type);
        }
    }

    public TEST_TYPER_conform(typer : DemoTyper, model : DemoModel) {
        this.test_base_to_testType(typer, DemoAttributeType.String, DemoAttributeType.String);
        this.test_base_to_testType(typer, DemoAttributeType.String, DemoAttributeType.Integer);
        this.test_base_to_testType(typer, DemoAttributeType.String, DemoAttributeType.Boolean);
        this.testPrimTypes(typer, model); 
        model.functions.forEach(fun => {
            this.testPrimTypes(typer, fun); 
        });
        model.entities.forEach(ent => {
            this.testPrimTypes(typer, ent); 
            model.entities.forEach(second => {
                this.testEntityTypes(typer, ent, second);
            });
            ent.functions.forEach(fun => {
                this.testPrimTypes(typer, fun); 
            });
            ent.attributes.forEach(fun => {
                this.testPrimTypes(typer, fun); 
                // this.testPrimTypes(typer, fun.type); 
            });
        });
    }
    
    private testEntityTypes(typer: Typer, first: DemoModelElement, second: DemoModelElement) {
        if (typer.isType(first) && typer.isType(second)) {
            this.test_base_to_testType(typer, (first as DemoType), (second as DemoType));
        }
    }

    private testPrimTypes(typer: Typer, elem: DemoModelElement) {
        if (typer.isType(elem)) {
            this.test_base_to_testType(typer, (elem as DemoType), DemoAttributeType.Boolean);
            this.test_base_to_testType(typer, (elem as DemoType), DemoAttributeType.String);
            this.test_base_to_testType(typer, (elem as DemoType), DemoAttributeType.Integer);
        } else {
            console.log(elem.$id + " is not a DemoType");
        }
    }

    private test_base_to_testType(typer: Typer, basetype: DemoType, testType: DemoType) {
        let result = typer.conform(basetype, testType);
        if (result)
            console.log(basetype.toString() + " conforms to " + testType.toString());
        if (!result)
            console.log(basetype.toString() + " does NOT conform to " + testType.toString());
    }

    public TEST_TYPER_isType(typer: DemoTyper, model: DemoModel) {
        let x : boolean = typer.isType(model);
        if (x) console.log("Typer found " + model.$id + "(" + model.name + ") is a type.");
        model.functions.forEach(fun => {
            let x = typer.isType(fun);
            if (x) console.log("Typer found " + fun.$id + "(" + fun.name + ") is a type.");
        });
        model.entities.forEach(ent => {
            let x = typer.isType(ent);
            if (x) console.log("Typer found " + ent.$id + "(" + ent.name + ") is a type.");
            ent.functions.forEach(fun => {
                x = typer.isType(fun);
                if (x) console.log("Typer found " + fun.$id + "(" + fun.name + ") is a type.");
            });
            ent.attributes.forEach(fun => {
                x = typer.isType(fun);
                if (x) console.log("Typer found " + fun.$id + "(" + fun.name + ") is a type.");
                // x = typer.isType(fun.type);
                //     if (x) console.log("Typer found " + fun.type.$id + "(" + fun.type.toString() + ") is a type.");
            });
        });
    }

}