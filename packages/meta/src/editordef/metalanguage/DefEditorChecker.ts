import {
    PiLangAppliedFeatureExp,
    PiBinaryExpressionConcept,
    PiConcept, PiConceptProperty,
    PiLangSelfExp,
    PiLanguageExpressionChecker,
    PiLanguageUnit
} from "../../languagedef/metalanguage";
import { Checker } from "../../utils";
import { DefEditorConcept } from "./DefEditorConcept";
import { DefEditorLanguage } from "./DefEditorLanguage";
import {
    DefEditorProjectionText,
    DefEditorSubProjection,
    Direction,
    ListJoin,
    ListJoinType,
    MetaEditorProjection,
    MetaEditorProjectionLine
} from "./MetaEditorProjection";
import { PiLogger } from "../../../../core/src/util/PiLogging";
// The next import should be separate and the last of the imports.
// Otherwise, the run-time error 'Cannot read property 'create' of undefined' occurs.
// See: https://stackoverflow.com/questions/48123645/error-when-accessing-static-properties-when-services-include-each-other
// and: https://stackoverflow.com/questions/45986547/property-undefined-typescript
import { PiElementReference } from "../../languagedef/metalanguage/PiElementReference";

const LOGGER = new PiLogger("DefEditorChecker"); //.mute();

export class DefEditorChecker extends Checker<DefEditorLanguage> {
    myExpressionChecker: PiLanguageExpressionChecker;

    constructor(language: PiLanguageUnit) {
        super(language);
        this.myExpressionChecker = new PiLanguageExpressionChecker(this.language);
    }

    /**
     * Checks the editor definition, resolving references on the fly.
     *
     * @param editor
     */
    public check(editor: DefEditorLanguage): void {
        if (this.language === null || this.language === undefined) {
            throw new Error(`Editor definition checker does not known the language.`);
        }

        this.nestedCheck(
            {
                check: this.language.name === editor.languageName,
                error: `Language reference ('${editor.languageName}') in editor definition '${editor.name}' ` +
                    `does not match language '${this.language.name}' [line: ${editor.location?.start.line}, column: ${editor.location?.start.column}].`,
                whenOk: () => {
                    this.resolveReferences(editor);
                    this.nestedCheck(
                        {
                            check: !!editor.name,
                            error: `Editor should have a name, it is empty [line: ${editor.location?.start.line}, column: ${editor.location?.start.column}].`
                        });
                    for (let conceptEditor of editor.conceptEditors) {
                        this.checkConceptEditor(conceptEditor);
                    }
                    this.checkEditor(editor);
                    this.errors = this.errors.concat(this.myExpressionChecker.errors);
                }
            });
    }

    private checkEditor(editor: DefEditorLanguage) {
        const conceptEditorsDoubles = this.unique(editor.conceptEditors);
        conceptEditorsDoubles.forEach(ced => {
                this.errors.push(`Editor definition for concept ${ced.concept.name} is already defined earlier [line: ${ced.location?.start.line}, column: ${ced.location?.start.column}].`);
            }
        );
    }

    private checkConceptEditor(conceptEditor: DefEditorConcept) {
        // TODO maybe use
        // this.myExpressionChecker.checkConceptReference(conceptEditor.concept);
        this.nestedCheck({
            check: !!conceptEditor.concept.referred,
            error: `Concept ${conceptEditor.concept.name} is unknown [line: ${conceptEditor.location?.start.line}, column: ${conceptEditor.location?.start.column}].`,
            whenOk: () => {
                this.checkProjection(conceptEditor.projection, conceptEditor.concept.referred);
            }
        });
    }

    private checkProjection(projection: MetaEditorProjection, cls: PiConcept) {
        if (!!projection) {
            projection.lines.forEach((line) => {
                line.items.forEach((item) => {
                    if (item instanceof DefEditorSubProjection) {
                        this.myExpressionChecker.checkLangExp(item.expression, cls);
                    }
                });
            });
        }
    }

    private resolveReferences(editorDef: DefEditorLanguage) {
        for (let conceptEditor of editorDef.conceptEditors) {
            conceptEditor.languageEditor = editorDef;
            conceptEditor.concept.owner = this.language;
        }
    }

    private unique(array: DefEditorConcept[]): DefEditorConcept[] {
        var seen = new Set;
        return array.filter(function(item) {
            if (!seen.has(item.concept.referred)) {
                seen.add(item.concept.referred);
                return false;
            } else {
                return true;
            }
        });
    }

}
