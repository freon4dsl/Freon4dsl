import { PiLanguageUnit } from "../../languagedef/metalanguage";
import { Checker } from "../../utils";
import { DefEditorConcept } from "./DefEditorConcept";
import { DefEditorLanguage } from "./DefEditorLanguage";

export class PiDefEditorChecker extends Checker<DefEditorLanguage> {

    constructor(language: PiLanguageUnit) {
        super(language);
    }

    public check(editor: DefEditorLanguage): void {
        this.resolveReferences(editor)
        this.nestedCheck(
            {
                check: !!editor.name,
                error: "Editor should have a name, it is empty"
            });
        for(let conceptEditor of editor.conceptEditors){
            this.checkConceptEditor(conceptEditor);
        }
    }

    private checkConceptEditor(conceptEditor: DefEditorConcept){
        this.nestedCheck({
            check: !!conceptEditor.concept.referedElement(),
            error: `Concept ${conceptEditor.concept.name} is unknown`
        });
    }

    resolveReferences(editorDef: DefEditorLanguage) {
        for(let conceptEditor of editorDef.conceptEditors) {
            conceptEditor.languageEditor = editorDef;
            conceptEditor.concept.language = this.language;
        }
    }

}

