import { Names } from "../../../utils/Names";
import { PathProvider } from "../../../utils/PathProvider";
import { PiLanguageUnit } from "../../../languagedef/metalanguage/PiLanguage";

export class MainProjectionalEditorTemplate {
    constructor() {
    }

    generateEditor(language: PiLanguageUnit, withToolbar: boolean): string {
            // TODO use Names for MyToolbarComponent and its import statement
            return `
            import { observable } from "mobx";
            import { observer } from "mobx-react";
            import * as React from "react";
            
            import { ${Names.PiEditor}, ${Names.ProjectionalEditor}, ${Names.CompositeProjection} } from "${PathProvider.corePath}";
            
            import { ${Names.projection(language)} } from "../${Names.projection(language)}";
            import { ${Names.projectionDefault(language)} } from "./${Names.projectionDefault(language)}";
            import { ${Names.actions(language)} } from "./${Names.actions(language)}";
            import { ${Names.context(language)} } from "./${Names.context(language)}";
            import { ${Names.editor(language)} } from "./${Names.editor(language)}";
            import { MyToolbarComponent } from "../../toolbars/MyToolbarComponent";

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
                    const context = new ${Names.context(language)}();
                    const actions = new ${Names.actions(language)}();
                    const rootProjection = new CompositeProjection();
                    const projectionManual = new ${Names.projection(language)}();
                    const projectionDefault = new ${Names.projectionDefault(language)}();
                    rootProjection.addProjection("manual", projectionManual);
                    rootProjection.addProjection("default", projectionDefault);
                    this.privateEditor = new ${Names.editor((language))}(context, rootProjection, actions);
                    projectionDefault.setEditor(this.privateEditor);
                }
            }

        `;
    }
}

