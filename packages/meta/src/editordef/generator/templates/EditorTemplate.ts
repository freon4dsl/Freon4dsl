import { Names } from "../../../utils/Names";
import { PathProvider, PROJECTITCORE } from "../../../utils/PathProvider";
import { PiLanguageUnit } from "../../../languagedef/metalanguage/PiLanguage";
import { DefEditorLanguage } from "../../metalanguage";

export class EditorTemplate {
    constructor() {
    }

    generateEditor(language: PiLanguageUnit, editorDef: DefEditorLanguage,  relativePath: string): string {
        return `
            import { ${Names.PiActions}, ${Names.PiContext}, ${Names.PiEditor}, ${Names.PiProjection} } from "${PROJECTITCORE}";
            
            export class ${Names.editor(language)} extends PiEditor {
            
                constructor(context: PiContext, projection: PiProjection, actions?: PiActions) {
                    super(context, projection, actions)
                }


            }
        `;
    }
}
