import { observable } from "mobx";
import { observer } from "mobx-react";
import * as React from "react";

import { MyToolbarComponent } from "./toolbars/MyToolbarComponent";
import { PiEditorWithToolbar } from "./toolbars/ToolBarDefinition";
import { MyToolbarItem } from "./toolbars/MyToolbarItem";

import { PiEditor, ProjectionalEditor } from "@projectit/core";
import { MetaActions, MetaContext, MetaProjection } from "@projectit/meta";

import { DemoEditor } from "./DemoEditor";
import { MetaEditor } from "./MetaEditor";
import { TutorialProjection } from "../../editor/TutorialProjection";
import { DemoActions } from "../../editor/DemoActions";
import { DemoContext } from "../../editor/DemoContext";

type Editor = "Demo" | "Meta";

@observer
export class MainProjectionalEditor extends React.Component<any, {}> {
    toolbar = {
        mytoolbarItems: [
            { id: "1", label: "DemoT", onClick: (ed: PiEditor) => (this.editorType = "Demo") },
            { id: "2", label: "MetaT", onClick: (ed: PiEditor) => (this.editorType = "Meta") }
        ]
    };

    @observable editorType: Editor = "Demo";

    constructor(props: any) {
        super(props);
        this.initEditors();
    }

    render() {
        var editor: PiEditorWithToolbar;
        if (this.editorType === "Demo") {
            editor = this.demoEditor;
        } else {
            editor = this.metaEditor;
        }
        return (
            <div>
                {this.toolbar.mytoolbarItems && this.toolbar.mytoolbarItems.length > 0 && (
                    <MyToolbarComponent editor={editor} toolbar={this.toolbar}/>
                )}
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

    private metaEditor: MetaEditor;
    private demoEditor: DemoEditor;

    initEditors() {
        const ctx = new MetaContext();
        const actions = new MetaActions();
        const projection = new MetaProjection();
        this.metaEditor = new MetaEditor(ctx, projection, actions);
        projection.setEditor(this.metaEditor);

        const demoCtx = new DemoContext();
        const demoActions = new DemoActions();
        const demoProjection = new TutorialProjection();
        this.demoEditor = new DemoEditor(demoCtx, demoProjection, demoActions);
        demoProjection.setEditor(this.demoEditor);
    }
}
