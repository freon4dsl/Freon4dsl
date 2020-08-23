import { PiElementReference } from "../../languagedef/metalanguage/PiElementReference";
import { PiLangAppliedFeatureExp,
    PiLangSelfExp,
    PiBinaryExpressionConcept,
    PiConcept,
    PiConceptProperty } from "../../languagedef/metalanguage";
import { PiEditUnit, PiEditConcept, PiEditParsedProjectionIndent, PiEditParsedNewline } from "./PiEditDefLang";
import {
    PiEditProjectionText,
    PiEditSubProjection, PiEditProjectionDirection, ListJoin, ListJoinType,
    PiEditProjection,
    PiEditProjectionLine
} from "./PiEditDefLang";

export class PiEditProjectionUtil {

    /**
     * Add default projections for all concepts that do not have one yet.
     * @param editor
     */
    public static addDefaults(editor: PiEditUnit): void {
        for (const binConcept of editor.language.concepts.filter(c => c instanceof PiBinaryExpressionConcept)) {
            let conceptEditor = editor.findConceptEditor(binConcept);
            if (conceptEditor === null || conceptEditor === undefined) {
                // console.log("Adding brand editor for " + binConcept.unitName);
                conceptEditor = new PiEditConcept();
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

        for (const con of editor.language.concepts.filter(c => !(c instanceof PiBinaryExpressionConcept))) {
            // Find or create the concept editor, and its properties
            let coneditor: PiEditConcept = editor.conceptEditors.find(ed => ed.concept.referred === con);
            if (!coneditor) {
                coneditor = new PiEditConcept();
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
                coneditor.projection = new PiEditProjection();
                coneditor.projection.name = "default";
                coneditor.projection.conceptEditor = coneditor;
                const startLine = new PiEditProjectionLine();
                const text = PiEditProjectionText.create(con.name);
                text.style = "conceptkeyword";
                startLine.items.push(text);
                // find unitName property is available
                const nameProp = con.allPrimProperties().find(p => p.name === "name" && p.primType === "string");
                if (!!nameProp) {
                    const exp = PiLangSelfExp.create(con);
                    exp.appliedfeature = PiLangAppliedFeatureExp.create(exp, nameProp.name, nameProp);
                    const sub = new PiEditSubProjection();
                    sub.expression = exp;
                    startLine.items.push(sub);
                }
                coneditor.projection.lines.push(startLine);
                for (const prop of con.allPrimProperties().filter((p => p !== nameProp))) {
                    const line = new PiEditProjectionLine();
                    line.indent = 4;
                    line.items.push(PiEditProjectionText.create(prop.name));
                    const exp = PiLangSelfExp.create(con);
                    exp.appliedfeature = PiLangAppliedFeatureExp.create(exp, prop.name, prop);
                    const sub = new PiEditSubProjection();
                    sub.expression = exp;
                    line.items.push(sub);
                    coneditor.projection.lines.push(line);
                }
                for (const prop of con.allParts()) {
                    if (prop.isList) {
                        this.defaultListConceptProperty(con, prop, coneditor);
                    } else {
                        this.defaultSingleConceptProperty(con, prop, coneditor);
                    }
                }
                for (const prop of con.allReferences()) {
                    if (prop.isList) {
                        this.defaultListConceptProperty(con, prop, coneditor);
                    } else {
                        this.defaultSingleConceptProperty(con, prop, coneditor);
                    }
                }
            }

        }
    }

    private static defaultSingleConceptProperty(concept: PiConcept, prop: PiConceptProperty, coneditor: PiEditConcept): void {
        const line = new PiEditProjectionLine();
        line.indent = 4;
        line.items.push(PiEditProjectionText.create(prop.name));
        const exp = PiLangSelfExp.create(concept);
        exp.appliedfeature = PiLangAppliedFeatureExp.create(exp, prop.name, prop);
        const sub = new PiEditSubProjection();
        sub.expression = exp;
        sub.listJoin = new ListJoin();
        sub.listJoin.direction = PiEditProjectionDirection.Vertical;
        sub.listJoin.joinType = ListJoinType.Separator;
        sub.listJoin.joinText = "";
        line.items.push(sub);
        coneditor.projection.lines.push(line);
    }

    private static defaultListConceptProperty(concept: PiConcept, prop: PiConceptProperty, coneditor: PiEditConcept): void {
        const line1 = new PiEditProjectionLine();
        const line2 = new PiEditProjectionLine();
        line1.indent = 4;
        line1.items.push(PiEditProjectionText.create(prop.name));
        line2.indent = 8;
        const exp = PiLangSelfExp.create(concept);
        exp.appliedfeature = PiLangAppliedFeatureExp.create(exp, prop.name, prop);
        const sub = new PiEditSubProjection();
        sub.expression = exp;
        sub.listJoin = new ListJoin();
        sub.listJoin.direction = PiEditProjectionDirection.Vertical;
        sub.listJoin.joinType = ListJoinType.Separator;
        sub.listJoin.joinText = "";
        line2.items.push(sub);
        coneditor.projection.lines.push(line1);
        coneditor.projection.lines.push(line2);
    }

    /** Normalizing means:
     * - break lines at newline,
     * - remove empty lines
     * - set indent property per line and then remove all indent items
     * - All PiEditParseNewline and PiEditParseProjectionIndent instances are removed.
     */
    public static normalize(projection: PiEditProjection): void {
        const result: PiEditProjectionLine[] = [];
        let currentLine = new PiEditProjectionLine();
        const lastItemIndex = projection.lines[0].items.length - 1;
        // TODO Empty lines are discarded now, decide how to handle them in general
        projection.lines[0].items.forEach((item, index) => {
            if (item instanceof PiEditParsedProjectionIndent) {
                item.normalize();
            }
            if (item instanceof PiEditParsedNewline) {
                if (currentLine.isEmpty()) {
                    currentLine = new PiEditProjectionLine();
                } else {
                    result.push(currentLine);
                    currentLine = new PiEditProjectionLine();
                }
            } else {
                currentLine.items.push(item);
            }
            if (lastItemIndex === index) {
                // push last line if not empty
                if (!currentLine.isEmpty()) {
                    result.push(currentLine);
                }
            }
        });
        projection.lines = result;

        let ignoredIndent = 0;
        // find the ignored indent value
        projection.lines.forEach(line => {
            const firstItem = line.items[0];
            if (firstItem instanceof PiEditParsedProjectionIndent) {
                ignoredIndent = ignoredIndent === 0 ? firstItem.amount : Math.min(ignoredIndent, firstItem.amount);
            }
        });
        // find indent of first line and substract that from all other lines
        // set indent of each line to the remainder
        projection.lines.forEach(line => {
            const firstItem = line.items[0];
            if (firstItem instanceof PiEditParsedProjectionIndent) {
                // const indent = firstItem.amount - ignoredIndent;
                line.indent = firstItem.amount - ignoredIndent;
                line.items.splice(0, 1);
            }
        });
        // remove all indent items, as they are not needed anymore
        projection.lines.forEach(line => {
            line.items = line.items.filter(item => !(item instanceof PiEditParsedProjectionIndent));
        });
    }

}
