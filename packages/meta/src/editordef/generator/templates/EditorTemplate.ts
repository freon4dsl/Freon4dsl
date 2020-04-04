import { Names } from "../../../utils/Names";
import { PathProvider, PROJECTITCORE, TOOLBARS_FOLDER } from "../../../utils/PathProvider";
import { PiLanguageUnit } from "../../../languagedef/metalanguage/PiLanguage";
import { DefEditorLanguage } from "../../metalanguage";

export class EditorTemplate {
    constructor() {
    }

    generateEditor(language: PiLanguageUnit, editorDef: DefEditorLanguage,  withToolbar: boolean, relativePath: string): string {
        // TODO use Names and PathProvider for PiEditorWithToolbar and MyToolbarItem and their imports
        return `
            import { ${Names.PiActions}, ${Names.PiContext}, ${Names.PiEditor}, ${Names.PiProjection} } from "${PROJECTITCORE}";
            ${withToolbar ? `
            import { PiEditorWithToolbar } from "${relativePath}${TOOLBARS_FOLDER}/ToolBarDefinition";
            import { MyToolbarItem } from "${relativePath}${TOOLBARS_FOLDER}/MyToolbarItem";
            `: ""}
            
            export class ${Names.editor(language)} extends ${ withToolbar? `PiEditorWithToolbar` : `PiEditor`} {
            
                constructor(context: PiContext, projection: PiProjection, actions?: PiActions) {
                    super(context, projection, actions)
                }
                
                ${ withToolbar ? `
                mytoolbarItems: MyToolbarItem[] = [];
                ` : ""}

            }
        `;
    }
}
