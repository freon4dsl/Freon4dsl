import { PiEditor } from "@projectit/core/editor";
import { observer } from "mobx-react";
import * as React from "react";

import { MyToolbarComponent } from "./toolbars/MyToolbarComponent";
import { PiEditorWithToolbar } from "./toolbars/ToolBarDefinition";

import { ProjectionalEditor, PiLogger } from "@projectit/core";

import { DemoEditor } from "./DemoEditor";
import { TutorialProjection, DemoActions, DemoContext } from "../../editor";
import { DemoScoper } from "@projectit/demo/scopeIt/Scoper";
import { DemoTyper, DemoType, Typer } from "@projectit/demo/typeIt/DemoTypeChecker";
import { DemoModel, DemoAttribute, DemoAttributeType, DemoEntity, DemoFunction, DemoVariable, DemoModelElement } from "@projectit/demo/model";

const LOGGER = new PiLogger("MainProjectionalEditor"); //.mute();

export type MainProjectionalEditorProps = {
    editor: PiEditor;
};

@observer
export class MainProjectionalEditor extends React.Component<MainProjectionalEditorProps, {}> {

    constructor(props: any) {
        super(props);
        this.initEditors();
    }

    render() {
        var editor: PiEditorWithToolbar;
        editor = this.demoEditor;
        return (
            <div>
                {editor.mytoolbarItems &&
                (editor.mytoolbarItems.length > 0 && (
                    <MyToolbarComponent editor={editor} toolbar={editor}/>
                ))}
                <div>
                    <ProjectionalEditor editor={editor}/>
                </div>
            </div>
        );
    }

    private demoEditor: DemoEditor;

    initEditors() {
        const demoCtx = new DemoContext();
        const demoActions = new DemoActions();
        const demoProjection = new TutorialProjection();
        this.demoEditor = new DemoEditor(demoCtx, demoProjection, demoActions);
        demoProjection.setEditor(this.demoEditor);
        // finally, it should be done like this:
        // connect the editor to the Typer and let the editor use the Typer API to get scoping info
        // this.demoEditor.addScoper(new DemoScoper());
        // connect the editor to the typer and let the editor use the Typer API to get type info
        // this.demoeditor.addTyper(New DemoTyper());

        // for testing, it is done like this:
        let model : DemoModel = (demoCtx.rootElement as DemoModel);
        LOGGER.log("Working on model " + model.name);

        let typer = new DemoTyper();
        //this.TEST_TYPER_isType(typer, model); 
        //this.TEST_TYPER_conform(typer, model); 
        this.TEST_TYPER_inferType(typer, model); 

        // START Typer TEST keep this code in a test file!!!
        // Set up test
        let scoper = new DemoScoper();          
        
        // TEST for isInScope!!!
        //this.TEST_SCOPER_isInScope(scoper, model); //TODO

        // TEST for getVisibleElements!!!
        //this.TEST_SCOPER_GetVisibleElements(scoper, model);

        // TEST for getFromVisibleElements!!!
        //this.TEST_SCOPER_GetFromVisibleElements(scoper, model);

        // TEST for getFromVisibleNames!!!
        //this.TEST_SCOPER_GetFromVisibleNames(scoper, model);  //TODO
        
        // TEST for getVisibleTypes!!!
        //this.TEST_SCOPER_getVisibleTypes(scoper, model);  //TODO
       
    }

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
            LOGGER.log("Found type " + expType.asString() + " for expression " + fun.expression.asString());
            this.test_base_to_testType(typer, expType, fun.type);
        }
    }

    TEST_TYPER_conform(typer : DemoTyper, model : DemoModel) {
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
                this.testPrimTypes(typer, fun.type); 
            });
        });
    }
    testEntityTypes(typer: Typer, first: DemoModelElement, second: DemoModelElement) {
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
            LOGGER.log(elem.$id + " is not a DemoType");
        }
    }

    private test_base_to_testType(typer: Typer, basetype: DemoType, testType: DemoType) {
        let result = typer.conform(basetype, testType);
        if (result)
            LOGGER.log(basetype.asString() + " conforms to " + testType.asString());
        if (!result)
            LOGGER.log(basetype.asString() + " does NOT conform to " + testType.asString());
    }

    TEST_TYPER_isType(typer: DemoTyper, model: DemoModel) {
        let x : boolean = typer.isType(model);
        if (x) LOGGER.log("Typer found " + model.$id + "(" + model.name + ") is a type.");
        model.functions.forEach(fun => {
            let x = typer.isType(fun);
            if (x) LOGGER.log("Typer found " + fun.$id + "(" + fun.name + ") is a type.");
        });
        model.entities.forEach(ent => {
            let x = typer.isType(ent);
            if (x) LOGGER.log("Typer found " + ent.$id + "(" + ent.name + ") is a type.");
            ent.functions.forEach(fun => {
                x = typer.isType(fun);
                if (x) LOGGER.log("Typer found " + fun.$id + "(" + fun.name + ") is a type.");
            });
            ent.attributes.forEach(fun => {
                x = typer.isType(fun);
                if (x) LOGGER.log("Typer found " + fun.$id + "(" + fun.name + ") is a type.");
                x = typer.isType(fun.type);
                    if (x) LOGGER.log("Typer found " + fun.type.$id + "(" + fun.type.asString() + ") is a type.");
            });
        });
    }

    private TEST_SCOPER_GetFromVisibleElements(scoper: DemoScoper, model: DemoModel) {
        let searchFor : string = "name";
        let x : DemoModelElement = scoper.getFromVisibleElements(model, searchFor);
        if (x) LOGGER.log("Typer found " + x.$id + " is a type.");
        model.functions.forEach(fun => {
            let x = scoper.getFromVisibleElements(fun, searchFor);
            if (x) LOGGER.log("Typer found " + x.$id + " is a type.");
        });
        model.entities.forEach(ent => {
            let x = scoper.getFromVisibleElements(ent, searchFor);
            if (x) LOGGER.log("Typer found " + x.$id + " is a type.");
            ent.functions.forEach(fun => {
                x = scoper.getFromVisibleElements(fun, searchFor);
                if (x) LOGGER.log("Typer found " + x.$id + " is a type.");
            });
        });
    }

    private TEST_SCOPER_GetVisibleElements(scoper: DemoScoper, model: DemoModel) {
        let vi = scoper.getVisibleElements(model);
        LOGGER.log("Typer found visible elements in : " + model.name);
        this.logVisibleElems(vi);
        model.functions.forEach(fun => {
            let vis = scoper.getVisibleElements(fun);
            LOGGER.log("Typer found visible elements in : " + fun.name);
            this.logVisibleElems(vis);
        });
        model.entities.forEach(ent => {
            let vis = scoper.getVisibleElements(ent);
            LOGGER.log("Typer found visible elements in : " + ent.name);
            this.logVisibleElems(vis);
            ent.functions.forEach(fun => {
                vis = scoper.getVisibleElements(fun);
                LOGGER.log("Typer found visible elements in : " + fun.name);
                this.logVisibleElems(vis);
            });
        });
    }

    private logVisibleElems(vis: DemoModelElement[]) {
        if (vis) {
            for (let v of vis) {
                if (v instanceof DemoAttribute) {
                    LOGGER.log(v.name);
                } else if (v instanceof DemoEntity) {
                    LOGGER.log(v.name);
                } else if (v instanceof DemoFunction) {
                    LOGGER.log(v.name);
                } else if (v instanceof DemoVariable) {
                    LOGGER.log(v.name);
                } else if (v instanceof DemoModel) {
                    LOGGER.log(v.name);
                } else {
                    LOGGER.log(v.$id);
                }
            }
        }
    }        

    // END keep this code as a test file!!!
}
