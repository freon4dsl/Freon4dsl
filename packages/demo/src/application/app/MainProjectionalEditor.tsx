import { PiEditor } from "@projectit/core";
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
    }
}
