import { Names } from "../../../utils/Names";
import { PathProvider } from "../../../utils/PathProvider";
import { PiLanguageUnit } from "../../../languagedef/metalanguage/PiLanguage";
import { DefEditorLanguage } from "../../metalanguage";

export class EditorTemplate {
    constructor() {
    }

    generateEditor(language: PiLanguageUnit, editorDef: DefEditorLanguage,  withToolbar: boolean, relativePath: string): string {
        return `
            import { ${Names.PiActions}, ${Names.PiContext}, ${Names.PiEditor}, ${Names.PiProjection} } from "${PathProvider.corePath}";
            ${withToolbar ? `
            import { PiEditorWithToolbar } from "../../toolbars/ToolBarDefinition";
            import { MyToolbarItem } from "../../toolbars/MyToolbarItem";
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
