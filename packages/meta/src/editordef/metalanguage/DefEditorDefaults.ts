import { PiElementReference } from "../../languagedef/metalanguage/PiElementReference";
import { PiLangAppliedFeatureExp, PiLangSelfExp } from "../../languagedef/metalanguage/PiLangExpressions";
import { PiBinaryExpressionConcept, PiConcept, PiConceptProperty } from "../../languagedef/metalanguage/PiLanguage";
import { DefEditorConcept } from "./DefEditorConcept";
import { DefEditorLanguage } from "./DefEditorLanguage";
import {
    DefEditorProjectionText,
    DefEditorSubProjection, Direction, ListJoin, ListJoinType,
    MetaEditorProjection,
    MetaEditorProjectionLine
} from "./MetaEditorProjection";

export class DefEditorDefaults {
    public static addDefaults(editor: DefEditorLanguage) {
        for (let binConcept of editor.language.concepts.filter(c => c instanceof PiBinaryExpressionConcept)) {
            let conceptEditor = editor.findConceptEditor(binConcept);
            if (conceptEditor === null || conceptEditor === undefined) {
                // console.log("Adding brand editor for " + binConcept.unitName);
                conceptEditor = new DefEditorConcept();
                conceptEditor.concept = PiElementReference.create<PiConcept>(binConcept, "PiConcept");
                conceptEditor.concept.owner = editor.language;
                editor.conceptEditors.push(conceptEditor);
            }
            if (conceptEditor.trigger === null) {
                conceptEditor.trigger = binConcept.name;
            }
            if (conceptEditor.symbol === null) {
                conceptEditor.symbol = binConcept.name;
            }
        }

        for (let con of editor.language.concepts.filter(c => !(c instanceof PiBinaryExpressionConcept))) {
            // Find or create the concept editor, and its properties
            let coneditor: DefEditorConcept = editor.conceptEditors.find(ed => ed.concept.referred === con);
            if (!coneditor) {
                coneditor = new DefEditorConcept();
                coneditor.concept = PiElementReference.create<PiConcept>(con.name, "PiConcept");
                coneditor.concept.owner = editor.language;
                coneditor.languageEditor = editor;
                editor.conceptEditors.push(coneditor);
            }
            if (!coneditor.trigger) {
                coneditor.trigger = con.name;
            }
            if (!coneditor.symbol) {
                coneditor.symbol = con.name;
            }
            if (!coneditor.projection) {
                // create a new projection
                // console.log("Adding default projection for " + con.unitName);
                coneditor.projection = new MetaEditorProjection();
                coneditor.projection.name = "default";
                coneditor.projection.conceptEditor = coneditor;
                const startLine = new MetaEditorProjectionLine();
                const text = DefEditorProjectionText.create(con.name);
                text.style = "conceptkeyword";
                startLine.items.push(text);
                // find unitName property is available
                const nameProp = con.allPrimProperties().find(p => p.name === "name" && p.primType === "string");
                if (!!nameProp) {
                    const exp = PiLangSelfExp.create(con);
                    exp.appliedfeature = PiLangAppliedFeatureExp.create(exp, nameProp.name, nameProp);
                    const sub = new DefEditorSubProjection();
                    sub.expression = exp;
                    startLine.items.push(sub);
                }
                coneditor.projection.lines.push(startLine);
                for (let prop of con.allPrimProperties().filter((p => p !== nameProp))) {
                    const line = new MetaEditorProjectionLine();
                    line.indent = 4;
                    line.items.push(DefEditorProjectionText.create(prop.name));
                    const exp = PiLangSelfExp.create(con);
                    exp.appliedfeature = PiLangAppliedFeatureExp.create(exp, prop.name, prop);
                    const sub = new DefEditorSubProjection();
                    sub.expression = exp;
                    line.items.push(sub);
                    coneditor.projection.lines.push(line);
                }
                for (let prop of con.allParts()) {
                    if (prop.isList) {
                        this.defaultListConceptProperty(con, prop, coneditor);
                    } else {
                        this.defaultSingleConceptProperty(con, prop, coneditor);
                    }
                }
                for (let prop of con.allReferences()) {
                    if (prop.isList) {
                        this.defaultListConceptProperty(con, prop, coneditor);
                    } else {
                        this.defaultSingleConceptProperty(con, prop, coneditor);
                    }
                }
            }

        }
    }

    private static defaultSingleConceptProperty(concept: PiConcept, prop: PiConceptProperty, coneditor: DefEditorConcept) {
        const line = new MetaEditorProjectionLine();
        line.indent = 4;
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

    private static defaultListConceptProperty(concept: PiConcept, prop: PiConceptProperty, coneditor: DefEditorConcept) {
        const line1 = new MetaEditorProjectionLine();
        const line2 = new MetaEditorProjectionLine();
        line1.indent = 4;
        line1.items.push(DefEditorProjectionText.create(prop.name));
        line2.indent = 8;
        const exp = PiLangSelfExp.create(concept);
        exp.appliedfeature = PiLangAppliedFeatureExp.create(exp, prop.name, prop);
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
