import { TutorialProjection } from "../../editor/TutorialProjection";
import { observable } from "mobx";

import { PiEditor, ProjectionalEditor, STYLES } from "@projectit/core";
import { MetaActions, MetaContext, MetaProjection } from "@projectit/meta";
import { MainToolbarComponent, MainToolbarItem } from "./MainToolbarComponent";
import * as React from "react";
import { observer } from "mobx-react";

import { DemoActions, DemoContext, DemoProjection } from "../../";

type Editor = "Demo" | "Meta";

@observer
export class MainProjectionalEditor extends React.Component<any, {}> {
    toolbarItems: MainToolbarItem[] = [
        { id: "1", label: "Demo", onClick: () => (this.editorType = "Demo") },
        { id: "2", label: "Meta", onClick: () => (this.editorType = "Meta") }
    ];

    @observable editorType: Editor = "Demo";

    constructor(props: any) {
        super(props);
        this.initEditors();
    }

    render() {
        return (
            <div>
                {this.toolbarItems && this.toolbarItems.length > 0 && (
                    <MainToolbarComponent toolbarItems={this.toolbarItems} />
                )}
                <div>
                    {this.editorType === "Demo" && <ProjectionalEditor editor={this.demoEditor} />}
                    {this.editorType === "Meta" && <ProjectionalEditor editor={this.metaEditor} />}
                </div>
            </div>
        );
    }

    private metaEditor: PiEditor;
    private demoEditor: PiEditor;

    initEditors() {
        const ctx = new MetaContext();
        const actions = new MetaActions();
        const projection = new MetaProjection();
        this.metaEditor = new PiEditor(ctx, projection, actions);
        projection.setEditor(this.metaEditor);

        const demoCtx = new DemoContext();
        const demoActions = new DemoActions();
        const demoProjection = new TutorialProjection();
        this.demoEditor = new PiEditor(demoCtx, demoProjection, demoActions);
        demoProjection.setEditor(this.demoEditor);
    }
}
