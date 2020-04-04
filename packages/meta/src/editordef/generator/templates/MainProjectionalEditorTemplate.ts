import { Names } from "../../../utils/Names";
import { ENVIRONMENT_GEN_FOLDER, PathProvider, PROJECTITCORE } from "../../../utils/PathProvider";
import { PiLanguageUnit } from "../../../languagedef/metalanguage/PiLanguage";
import { DefEditorLanguage } from "../../metalanguage";

export class MainProjectionalEditorTemplate {
    constructor() {
    }

    generateMainProjectionalEditor(language: PiLanguageUnit, editorDef: DefEditorLanguage, withToolbar: boolean, relativePath: string): string {
            // TODO use Names and PathProvider for MyToolbarComponent and its import statement
            return `
            
            import { observer } from "mobx-react";
            import * as React from "react";
            
            import { ${Names.PiEditor}, ${Names.ProjectionalEditor} } from "${PROJECTITCORE}";
            import { ${Names.environment(language)} } from "${relativePath}${ENVIRONMENT_GEN_FOLDER}/${Names.environment(language)}";
            
            @observer
            export class MainProjectionalEditor extends React.Component<any, {}> {
            
                constructor(props: any) {
                    super(props);
                }
            
                render() {
                    var editor: PiEditor = ${Names.environment(language)}.getInstance().editor;
                    return (
                        <div>
                            <div>
                                {(${Names.environment(language)}.getInstance() as ${Names.environment(language)}).projectionalEditorComponent}
                            </div>
                        </div>
                    );
                }
            }

        `;
    }
}

