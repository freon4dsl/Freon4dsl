import { observable } from "mobx";

import { PiEditor, ProjectionalEditor, STYLES } from "projectit";
import { MetaActions } from "../../../../projectit-meta/src/editor/MetaActions";
import { MetaContext } from "../../../../projectit-meta/src/editor/MetaContext";
import { MetaProjection } from "../../../../projectit-meta/src/editor/MetaProjection";
import { MainToolbarComponent, MainToolbarItem } from "./MainToolbarComponent";
import * as React from "react";
import { observer } from "mobx-react";

import { DemoActions, DemoContext, DemoProjection } from "projectit-demo";

type Editor = "Demo" | "Meta" ;

@observer
export class MainProjectionalEditor extends React.Component<any, {}> {
    toolbarItems: MainToolbarItem[] = [
        {id: "1", label: "Demo", onClick: () => this.editorType = "Demo" },
        {id: "2", label: "Meta", onClick: () => this.editorType = "Meta" },
    ];

    @observable editorType: Editor = "Demo";

    constructor(props: any) {
        super(props);
        this.initEditors();
    }

    render() {
        return (
            <div>
                {this.toolbarItems &&
                this.toolbarItems.length > 0 && (
                    <MainToolbarComponent
                        toolbarItems={this.toolbarItems}
                    />
                )}
                <div>
                    { this.editorType === "Demo" && (<ProjectionalEditor editor={this.demoEditor}/>) }
                    { this.editorType === "Meta" && (<ProjectionalEditor editor={this.metaEditor}/>) }
                </div>
            </div>
        );
    }

    private metaEditor: PiEditor;
    private demoEditor: PiEditor;

    initEditors() {
        let ctx = new MetaContext();
        let  actions = new MetaActions();
        let projection = new MetaProjection();
        this.metaEditor = new PiEditor(ctx, projection, actions);
        projection.setEditor(this.metaEditor);

        let demoCtx = new DemoContext();
        let  demoActions = new DemoActions();
        let demoProjection = new DemoProjection();
        this.demoEditor = new PiEditor(demoCtx, demoProjection, demoActions);
        demoProjection.setEditor(this.demoEditor);
    }

}
