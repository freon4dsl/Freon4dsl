import { DemoScoper } from "../scopeIt/DemoScoper";
import { DemoAttribute, DemoEntity, DemoFunction, DemoModel, DemoVariable } from "../language/index";
import { DemoModelElement } from "../scopeIt/DemoModelElement";

export class TestScoper {
    private scoper = new DemoScoper();
    private model : DemoModel;
	
	constructor(model : DemoModel) {
        console.log("Working on model " + model.name);
        this.model = model;
    }

    public TEST_SCOPER_GetFromVisibleElements() {
        let searchFor : string = "name";
        let x : DemoModelElement = this.scoper.getFromVisibleElements(this.model, searchFor);
        if (x) console.log("Typer found " + x.$id + " is a type.");
        this.model.functions.forEach(fun => {
            let x = this.scoper.getFromVisibleElements(fun, searchFor);
            if (x) console.log("Typer found " + x.$id + " is a type.");
        });
        this.model.entities.forEach(ent => {
            let x = this.scoper.getFromVisibleElements(ent, searchFor);
            if (x) console.log("Typer found " + x.$id + " is a type.");
            ent.functions.forEach(fun => {
                x = this.scoper.getFromVisibleElements(fun, searchFor);
                if (x) console.log("Typer found " + x.$id + " is a type.");
            });
        });
    }

    public TEST_SCOPER_GetVisibleElements() {
        let vi = this.scoper.getVisibleElements(this.model);
        console.log("Typer found visible elements in : " + this.model.name);
        this.logVisibleElems(vi);
        this.model.functions.forEach(fun => {
            let vis = this.scoper.getVisibleElements(fun);
            console.log("Typer found visible elements in : " + fun.name);
            this.logVisibleElems(vis);
        });
        this.model.entities.forEach(ent => {
            let vis = this.scoper.getVisibleElements(ent);
            console.log("Typer found visible elements in : " + ent.name);
            this.logVisibleElems(vis);
            ent.functions.forEach(fun => {
                vis = this.scoper.getVisibleElements(fun);
                console.log("Typer found visible elements in : " + fun.name);
                this.logVisibleElems(vis);
            });
        });
    }

    private logVisibleElems(vis: DemoModelElement[]) {
        if (vis) {
            for (let v of vis) {
                if (v instanceof DemoAttribute) {
                    console.log(v.name);
                } else if (v instanceof DemoEntity) {
                    console.log(v.name);
                } else if (v instanceof DemoFunction) {
                    console.log(v.name);
                } else if (v instanceof DemoVariable) {
                    console.log(v.name);
                } else if (v instanceof DemoModel) {
                    console.log(v.name);
                } else {
                    console.log(v.$id);
                }
            }
        }
    }

    public TEST_SCOPER_isInScope(nameToTest: string) {
        // test on model
        let result = this.scoper.isInScope(this.model,nameToTest);
        console.log("Testing " + nameToTest + " is in scope of " + this.model.name + ". Result = " + result);
        // test on model functions
        this.model.functions.forEach(fun => {
            result = this.scoper.isInScope(fun, nameToTest);
            console.log("Testing " + nameToTest + " is in scope of " + fun.name + ". Result = " + result);
        });
        // test on entities and entity functions
        this.model.entities.forEach(ent => {
            result = this.scoper.isInScope(ent, nameToTest);
            console.log("Testing " + nameToTest + " is in scope of " + ent.name + ". Result = " + result);
            ent.functions.forEach(fun => {
                result = this.scoper.isInScope(fun, nameToTest);
                console.log("Testing " + nameToTest + " is in scope of " + fun.name + ". Result = " + result);
            });
        });
    }        
}