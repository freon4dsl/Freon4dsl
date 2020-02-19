import { PiEditor } from "@projectit/core/editor";
import { observer } from "mobx-react";
import * as React from "react";

import { MyToolbarComponent } from "./toolbars/MyToolbarComponent";
import { PiEditorWithToolbar } from "./toolbars/ToolBarDefinition";

import { ProjectionalEditor, PiLogger } from "@projectit/core";

import { DemoEditor } from "./DemoEditor";
import { TutorialProjection, DemoActions, DemoContext } from "../../editor";
import { DemoScoper } from "@projectit/demo/scopeIt/Scoper";
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
        // connect the editor to the scoper and let the editor use the Scoper API to get scoping info
        // this.demoEditor.addScoper(new DemoScoper());

        // for testing, it is done like this:
        // START keep this code in a test file!!!
        let scoper = new DemoScoper();
        LOGGER.log("Working on model " + (demoCtx.rootElement as DemoModel).name);
        let model : DemoModel = (demoCtx.rootElement as DemoModel);
        
        let vis = scoper.getVisibleElements(model);
        LOGGER.log("Scoper found visible elements in : " + model.name);
        this.logVisibleElems(vis);

        model.functions.forEach(fun => {
            let vis = scoper.getVisibleElements(fun);
            LOGGER.log("Scoper found visible elements in : " + fun.name);
            this.logVisibleElems(vis);
        });
  
        model.entities.forEach(ent => {
            let vis = scoper.getVisibleElements(ent);
            LOGGER.log("Scoper found visible elements in : " + ent.name);
            this.logVisibleElems(vis);
            
            ent.functions.forEach(fun => {
                 vis = scoper.getVisibleElements(fun);
                 LOGGER.log("Scoper found visible elements in : " + fun.name);
                 this.logVisibleElems(vis);
            });                
        });
     }

            private logVisibleElems(vis: DemoModelElement[]) {
                if (vis !== null) {
                    for (let v of vis) {
                        if (v instanceof DemoAttribute) {
                            LOGGER.log(v.name);
                        }
                        else if (v instanceof DemoEntity) {
                            LOGGER.log(v.name);
                        }
                        else if (v instanceof DemoFunction) {
                            LOGGER.log(v.name);
                        }
                        else if (v instanceof DemoVariable) {
                            LOGGER.log(v.name);
                        }
                        else if (v instanceof DemoModel) {
                            LOGGER.log(v.name);
                        }
                        else {
                            LOGGER.log(v.$id);
                        }
                    }
                }
            }

    // END keep this code as a test file!!!
}
