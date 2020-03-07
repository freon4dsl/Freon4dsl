import { observer } from "mobx-react";
import * as React from "react";

import { MyToolbarComponent } from "./toolbars/MyToolbarComponent";
import { PiEditorWithToolbar } from "./toolbars/ToolBarDefinition";

import { ProjectionalEditor, PiLogger, PiEditor } from "@projectit/core";

import { DemoEditor } from "./DemoEditor";
import { TutorialProjection, DemoActions, DemoContext } from "../../editor";

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
        // this.demoEditor.addTyper(New DemoTyper());
    }
}
