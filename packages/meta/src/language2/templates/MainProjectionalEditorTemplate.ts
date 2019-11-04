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
            
            import { ${Names.projection(language)} } from "./${Names.projection(language)}";
            import { ${Names.actions(language)} } from "./${Names.actions(language)}";
            import { ${Names.context(language)} } from "./${Names.context(language)}";

            @observer
            export class MainProjectionalEditor extends React.Component< any, {}> {
                private privateEditor: PiEditor;
            
                constructor(props: any) {
                    super(props);
                    this.initEditors();
                }
            
                render() {
                    var editor: PiEditor = this.privateEditor;
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
                    this.privateEditor = new PiEditor(demoCtx, demoProjection, demoActions);
                    demoProjection.setEditor(this.privateEditor);
                }
            }

        `;
    }
}

