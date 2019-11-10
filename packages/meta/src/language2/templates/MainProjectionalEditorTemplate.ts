import { Names } from "./Names";
import { PiLanguage } from "../PiLanguage";

export class MainProjectionalEditorTemplate {
    constructor() {
    }

    generateEditor(language: PiLanguage, withToolbar: boolean): string {
        return `
            import { observable } from "mobx";
            import { observer } from "mobx-react";
            import * as React from "react";
            
            import { PiEditor, ProjectionalEditor } from "@projectit/core";
            
            import { ${Names.projection(language)} } from "./${Names.projection(language)}";
            import { ${Names.actions(language)} } from "./${Names.actions(language)}";
            import { ${Names.context(language)} } from "./${Names.context(language)}";
            import { ${Names.editor(language)} } from "./${Names.editor(language)}";
            import { MyToolbarComponent } from "../toolbars/MyToolbarComponent";

            @observer
            export class MainProjectionalEditor extends React.Component< any, {}> {
                private privateEditor: ${Names.editor((language))};
            
                constructor(props: any) {
                    super(props);
                    this.initEditors();
                }
                
                render() {
                    var editor: ${Names.editor((language))} = this.privateEditor;
                    return (
                    ${ withToolbar ? `
                        < div>
                            {editor.mytoolbarItems && (editor.mytoolbarItems.length > 0 && (
                                <MyToolbarComponent editor={editor} toolbar={editor}/>
                            ))}
                            <div>
                                <ProjectionalEditor editor={editor}/>
                            </div>
                        </div>
                    ` : `
                        < div>
                            <ProjectionalEditor editor={editor}/>
                        </div>
                    `}       
                    );
                }
            
                initEditors() {
                    const demoCtx = new ${Names.context(language)}();
                    const demoActions = new ${Names.actions(language)}();
                    const demoProjection = new ${Names.projection(language)}();
                    this.privateEditor = new ${Names.editor((language))}(demoCtx, demoProjection, demoActions);
                    demoProjection.setEditor(this.privateEditor);
                }
            }

        `;
    }
}

