import {
    PiLangAppliedFeatureExp,
    PiLangBinaryExpressionConcept,
    PiLangClassReference,
    PiLangConcept, PiLangConceptProperty,
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
        this.resolveReferences(editor);
        this.addDefaults(editor);
        this.nestedCheck({
            check: !!editor.name,
            error: `Editor should have a name, it is empty [line: ${editor.location?.start.line}, column: ${editor.location?.start.column}].`,
        });
        for (let conceptEditor of editor.conceptEditors) {
            this.checkConceptEditor(conceptEditor);
        }
        this.errors = this.errors.concat(this.myExpressionChecker.errors);
    }

    private checkConceptEditor(conceptEditor: DefEditorConcept) {
        // TODO maybe use
        // this.myExpressionChecker.checkConceptReference(conceptEditor.concept);
        this.nestedCheck({
            check: !!conceptEditor.concept.referedElement(),
            error: `Concept ${conceptEditor.concept.name} is unknown [line: ${conceptEditor.location?.start.line}, column: ${conceptEditor.location?.start.column}].`,
            whenOk: () => {
                this.checkProjection(conceptEditor.projection, conceptEditor.concept.referedElement());
            },
        });
    }

    private checkProjection(projection: MetaEditorProjection, cls: PiLangConcept) {
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
            conceptEditor.concept.language = this.language;
        }
    }

    private addDefaults(editor: DefEditorLanguage) {
        for (let con of this.language.classes.filter(c => !(c instanceof PiLangBinaryExpressionConcept))) {
            if (!editor.conceptEditors.map((ce) => ce.concept.referedElement()).includes(con)) {
                console.log("=============== adding default p0rojection for "+ con.name);
                const coneditor = new DefEditorConcept();
                coneditor.concept = PiLangClassReference.create(con.name, this.language);
                coneditor.languageEditor = editor;
                coneditor.symbol = con.name;
                coneditor.trigger = con.name;
                coneditor.projection = new MetaEditorProjection();
                coneditor.projection.name = "default";
                coneditor.projection.conceptEditor = coneditor;
                for(let prop of con.allPrimProperties()){
                    const line = new MetaEditorProjectionLine();
                    line.indent = 0;
                    line.items.push(DefEditorProjectionText.create(prop.name))
                    const exp = new PiLangSelfExp();
                    exp.sourceName = "self";
                    exp.appliedfeature = PiLangAppliedFeatureExp.create(prop.name, prop);
                    const sub = new DefEditorSubProjection();
                    sub.expression = exp;
                    line.items.push(sub);
                    coneditor.projection.lines.push(line);
                }
                for(let prop of con.allEnumProperties()){
                    const line = new MetaEditorProjectionLine();
                    line.indent = 0;
                    line.items.push(DefEditorProjectionText.create(prop.name))
                    const exp = new PiLangSelfExp();
                    exp.sourceName = "self";
                    exp.appliedfeature = PiLangAppliedFeatureExp.create(prop.name, prop);
                    const sub = new DefEditorSubProjection();
                    sub.expression = exp;
                    line.items.push(sub);
                    coneditor.projection.lines.push(line);
                }
                for(let prop of con.allParts()){
                    if(prop.isList) {
                        this.defaultListConceptProperty(prop, coneditor);
                    } else {
                        this.defaultSingleConceptProperty(prop, coneditor);
                    }
                }
                for(let prop of con.allPReferences()){
                    if(prop.isList) {
                        this.defaultListConceptProperty(prop, coneditor);
                    } else {
                        this.defaultSingleConceptProperty(prop,coneditor);
                    }
                }
                editor.conceptEditors.push(coneditor);
            }
        }
    }

    private defaultSingleConceptProperty(prop: PiLangConceptProperty, coneditor: DefEditorConcept) {
        const line = new MetaEditorProjectionLine();
        line.indent = 0;
        line.items.push(DefEditorProjectionText.create(prop.name));
        const exp = new PiLangSelfExp();
        exp.sourceName = "self";
        exp.appliedfeature = PiLangAppliedFeatureExp.create(prop.name, prop);
        const sub = new DefEditorSubProjection();
        sub.expression = exp;
        sub.listJoin = new ListJoin();
        sub.listJoin.direction = Direction.Vertical;
        sub.listJoin.joinType = ListJoinType.Separator;
        sub.listJoin.joinText = "";
        line.items.push(sub);
        coneditor.projection.lines.push(line);
    }

    private defaultListConceptProperty(prop: PiLangConceptProperty, coneditor: DefEditorConcept) {
        const line1 = new MetaEditorProjectionLine();
        const line2 = new MetaEditorProjectionLine();
        line1.indent = 0;
        line1.items.push(DefEditorProjectionText.create(prop.name));
        line2.indent = 4;
        const exp = new PiLangSelfExp();
        exp.sourceName = "self";
        exp.appliedfeature = PiLangAppliedFeatureExp.create(prop.name, prop);
        const sub = new DefEditorSubProjection();
        sub.expression = exp;
        sub.listJoin = new ListJoin();
        sub.listJoin.direction = Direction.Vertical;
        sub.listJoin.joinType = ListJoinType.Separator;
        sub.listJoin.joinText = "";
        line2.items.push(sub);
        coneditor.projection.lines.push(line1);
        coneditor.projection.lines.push(line2);
    }
}
