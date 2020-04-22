import { PiLangClass, PiLangConcept, PiLanguageExpressionChecker, PiLanguageUnit } from "../../languagedef/metalanguage";
import { Checker } from "../../utils";
import { DefEditorConcept } from "./DefEditorConcept";
import { DefEditorLanguage } from "./DefEditorLanguage";
import { MetaEditorProjection, DefEditorSubProjection } from "./MetaEditorProjection";
import { PiLogger } from "../../../../core/src/util/PiLogging";

const LOGGER = new PiLogger("DefEditorChecker"); //.mute();

export class DefEditorChecker extends Checker<DefEditorLanguage> {
    myExpressionChecker: PiLanguageExpressionChecker;

    constructor(language: PiLanguageUnit) {
        super(language);
        this.myExpressionChecker = new PiLanguageExpressionChecker(this.language);
    }

    public check(editor: DefEditorLanguage): void {
        if ( this.language === null || this.language === undefined ) {
            throw new Error(`Editor definition checker does not known the language.`);
        }

        this.nestedCheck(
            {
                check: this.language.name === editor.languageName,
                error:  `Language reference ('${editor.languageName}') in editor definition '${editor.name}' `+
                    `does not match language '${this.language.name}' [line: ${editor.location?.start.line}, column: ${editor.location?.start.column}].`,
                whenOk: () => {
                    this.resolveReferences(editor);
                    this.nestedCheck(
                        {
                            check: !!editor.name,
                            error: `Editor should have a name, it is empty [line: ${editor.location?.start.line}, column: ${editor.location?.start.column}].`
                        });
                    for(let conceptEditor of editor.conceptEditors){
                        this.checkConceptEditor(conceptEditor);
                    }
                    this.errors = this.errors.concat(this.myExpressionChecker.errors);
                }
            });
    }

    private checkConceptEditor(conceptEditor: DefEditorConcept){
        // maybe use
        // this.myExpressionChecker.checkConceptReference(conceptEditor.concept);
        this.nestedCheck({
            check: !!conceptEditor.concept.referedElement(),
            error: `Concept ${conceptEditor.concept.name} is unknown [line: ${conceptEditor.location?.start.line}, column: ${conceptEditor.location?.start.column}].`,
            whenOk: () => { this.checkProjection(conceptEditor.projection, conceptEditor.concept.referedElement()); }
        });
    }

    private checkProjection(projection: MetaEditorProjection, cls: PiLangConcept){
        if (!!projection) {
            projection.lines.forEach(line => {
                line.items.forEach(item => {
                    if (item instanceof DefEditorSubProjection) {
                        this.myExpressionChecker.checkLangExp(item.expression, cls);
                    }
                })
            });
        }
    }

    private resolveReferences(editorDef: DefEditorLanguage) {
        for (let conceptEditor of editorDef.conceptEditors) {
            conceptEditor.languageEditor = editorDef;
            conceptEditor.concept.language = this.language;
        }
    }
}

