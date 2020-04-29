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
import { PiElementReference} from "../../languagedef/metalanguage/PiElementReference";

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
                    this.addDefaults(editor);
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

    private checkConceptEditor(conceptEditor: DefEditorConcept) {
        // TODO maybe use
        // this.myExpressionChecker.checkConceptReference(conceptEditor.concept);
        this.nestedCheck({
            check: !!conceptEditor.concept.referred,
            error: `Concept ${conceptEditor.concept.name} is unknown [line: ${conceptEditor.location?.start.line}, column: ${conceptEditor.location?.start.column}].`,
            whenOk: () => {
                this.checkProjection(conceptEditor.projection, conceptEditor.concept.referred);
            },
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

    private addDefaults(editor: DefEditorLanguage) {
        for (let con of this.language.concepts.filter(c => !(c instanceof PiBinaryExpressionConcept))) {
            if (!editor.conceptEditors.map((ce) => ce.concept.referred).includes(con)) {
                console.log("=============== adding default p0rojection for "+ con.name);
                const coneditor = new DefEditorConcept();
                coneditor.concept = PiElementReference.create<PiConcept>(con.name, "PiConcept");
                coneditor.concept.owner = this.language;
                coneditor.languageEditor = editor;
                coneditor.symbol = con.name;
                coneditor.trigger = con.name;
                coneditor.projection = new MetaEditorProjection();
                coneditor.projection.name = "default";
                coneditor.projection.conceptEditor = coneditor;
                for(let prop of con.allPrimProperties()){
                    const line = new MetaEditorProjectionLine();
                    line.indent = 0;
                    line.items.push(DefEditorProjectionText.create(prop.name));
                    const exp = PiLangSelfExp.create(con);
                    exp.appliedfeature = PiLangAppliedFeatureExp.create(exp, prop.name, prop);
                    const sub = new DefEditorSubProjection();
                    sub.expression = exp;
                    line.items.push(sub);
                    coneditor.projection.lines.push(line);
                }
                // for(let prop of con.allEnumProperties()){
                //     const line = new MetaEditorProjectionLine();
                //     line.indent = 0;
                //     line.items.push(DefEditorProjectionText.create(prop.name))
                //     const exp = new PiLangSelfExp.create(con);
                //     exp.appliedfeature = PiLangAppliedFeatureExp.create(exp, prop.name, prop);
                //     const sub = new DefEditorSubProjection();
                //     sub.expression = exp;
                //     line.items.push(sub);
                //     coneditor.projection.lines.push(line);
                // }
                for(let prop of con.allParts()){
                    if(prop.isList) {
                        this.defaultListConceptProperty(con, prop, coneditor);
                    } else {
                        this.defaultSingleConceptProperty(con, prop, coneditor);
                    }
                }
                for(let prop of con.allReferences()){
                    if(prop.isList) {
                        this.defaultListConceptProperty(con, prop, coneditor);
                    } else {
                        this.defaultSingleConceptProperty(con, prop,coneditor);
                    }
                }
                editor.conceptEditors.push(coneditor);
            }
        }
    }

    private defaultSingleConceptProperty(concept: PiConcept, prop: PiConceptProperty, coneditor: DefEditorConcept) {
        const line = new MetaEditorProjectionLine();
        line.indent = 0;
        line.items.push(DefEditorProjectionText.create(prop.name));
        const exp = PiLangSelfExp.create(concept);
        exp.appliedfeature = PiLangAppliedFeatureExp.create(exp, prop.name, prop);
        const sub = new DefEditorSubProjection();
        sub.expression = exp;
        sub.listJoin = new ListJoin();
        sub.listJoin.direction = Direction.Vertical;
        sub.listJoin.joinType = ListJoinType.Separator;
        sub.listJoin.joinText = "";
        line.items.push(sub);
        coneditor.projection.lines.push(line);
    }

    private defaultListConceptProperty(concept: PiConcept, prop: PiConceptProperty, coneditor: DefEditorConcept) {
        const line1 = new MetaEditorProjectionLine();
        const line2 = new MetaEditorProjectionLine();
        line1.indent = 0;
        line1.items.push(DefEditorProjectionText.create(prop.name));
        line2.indent = 4;
        const exp = PiLangSelfExp.create(concept);
        exp.appliedfeature = PiLangAppliedFeatureExp.create(exp, prop.name, prop);
        const sub = new DefEditorSubProjection();
        sub.expression = exp;
        sub.listJoin = new ListJoin();
        sub.listJoin.direction = Direction.Vertical;
        sub.listJoin.joinType = ListJoinType.Separator;
        sub.listJoin.joinText = "";
        return sub;
    }
}
