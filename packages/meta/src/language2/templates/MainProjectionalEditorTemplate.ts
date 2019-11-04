import { Names } from "./Names";
import { PiLanguage } from "../PiLanguage";

export class MainProjectionalEditorTemplate {
    constructor() {
    }

    generateEditor(language: PiLanguage): string {
        return `
            import { observable } from "mobx";
            import { observer } from "mobx-react";
            import * as React from "react";
            
            import { PiEditor, ProjectionalEditor } from "@projectit/core";
            
            import { DemoEditor } from "./DemoEditor";
            import { ${Names.projection(language)} } from "../../editor/${Names.projection(language)}";
            import { ${Names.actions(language)} } from "../../editor/${Names.actions(language)}";
            import { ${Names.context(language)} } from "../../editor/${Names.context(language)}";

            @observer
            export class MainProjectionalEditor extends React.Component< any, {}> {
                private demoEditor: DemoEditor;
            
                constructor(props: any) {
                    super(props);
                    this.initEditors();
                }
            
                render() {
                    var editor: PiEditor = this.demoEditor;
                    return (
                        <div>
                            <ProjectionalEditor editor={editor}/>
                        </div>
                    );
                }
            
                initEditors() {
                    const demoCtx = new ${Names.context(language)}();
                    const demoActions = new ${Names.actions(language)}();
                    const demoProjection = new ${Names.projection(language)}();
                    this.demoEditor = new DemoEditor(demoCtx, demoProjection, demoActions);
                    demoProjection.setEditor(this.demoEditor);
                }
            }

        `;
    }
}

