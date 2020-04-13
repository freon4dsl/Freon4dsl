import { PiLangClass, PiLangConcept, PiLanguageExpressionChecker, PiLanguageUnit } from "../../languagedef/metalanguage";
import { Checker } from "../../utils";
import { DefEditorConcept } from "./DefEditorConcept";
import { DefEditorLanguage } from "./DefEditorLanguage";
import { MetaEditorProjection, DefEditorSubProjection } from "./MetaEditorProjection";

export class DefEditorChecker extends Checker<DefEditorLanguage> {
    myExpressionChecker: PiLanguageExpressionChecker;

    constructor(language: PiLanguageUnit) {
        super(language);
        this.myExpressionChecker = new PiLanguageExpressionChecker(this.language);
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
        this.errors = this.errors.concat(this.myExpressionChecker.errors);
    }

    private checkConceptEditor(conceptEditor: DefEditorConcept){
        this.nestedCheck({
            check: !!conceptEditor.concept.referedElement(),
            error: `Concept ${conceptEditor.concept.name} is unknown`,
            whenOk: () => { this.checkProjection(conceptEditor.projection, conceptEditor.concept.referedElement()); }
        });
    }

    private checkProjection(projection: MetaEditorProjection, cls: PiLangConcept){
        if(!!projection) {
            projection.lines.forEach(line => {
                line.items.forEach(item => {
                    if (item instanceof DefEditorSubProjection) {
                        this.myExpressionChecker.checkLangExp(item.expression, cls);
                    }
                })
            });
        }
    }

    resolveReferences(editorDef: DefEditorLanguage) {
        for(let conceptEditor of editorDef.conceptEditors) {
            conceptEditor.languageEditor = editorDef;
            conceptEditor.concept.language = this.language;
        }
    }

}

