import { PiElementReference } from "../../languagedef/metalanguage/PiElementReference";
import {
    PiBinaryExpressionConcept,
    PiClassifier,
    PiConceptProperty, PiLimitedConcept,
    PiPrimitiveProperty,
    PiProperty
} from "../../languagedef/metalanguage";
import {
    ExtraClassifierInfo,
    ListInfo,
    ListJoinType,
    PiEditClassifierProjection,
    PiEditParsedNewline,
    PiEditParsedProjectionIndent,
    PiEditProjection,
    PiEditProjectionGroup,
    PiEditProjectionLine,
    PiEditProjectionText,
    PiEditPropertyProjection,
    PiEditUnit
} from "./PiEditDefLang";
import { Names } from "../../utils";

export class PiEditProjectionUtil {

    /**
     * Add default projections for all concepts that do not have one yet.
     * @param editor
     */
    public static addDefaults(editor: PiEditUnit): void {
        // find projection group to add defaults to, or make one if it does not exist
        let defaultGroup: PiEditProjectionGroup = editor.projectiongroups.find(group => group.name = Names.defaultProjectionName);
        if (defaultGroup === null || defaultGroup === undefined) {
            defaultGroup = new PiEditProjectionGroup();
            defaultGroup.name = Names.defaultProjectionName;
            // standardBooleanProjection and standardReferenceSeparator get default values on initialization
        }

        // add defaults for binary expressions
        for (const binConcept of editor.language.concepts.filter(c => c instanceof PiBinaryExpressionConcept)) {
            let projection: PiEditClassifierProjection = defaultGroup.findProjectionForType(binConcept);
            if (projection === null || projection === undefined) {
                // console.log("Adding brand editor for " + binConcept.unitName);
                projection = new PiEditProjection();
                projection.name = Names.defaultProjectionName;
                projection.classifier = PiElementReference.create<PiBinaryExpressionConcept>(
                    binConcept as PiBinaryExpressionConcept,
                    "PiBinaryExpressionConcept"
                );
                projection.classifier.owner = editor.language;
                defaultGroup.projections.push(projection);
            }
            let extraInfo: ExtraClassifierInfo = defaultGroup.findExtrasForType(binConcept);
            this.defaultExtras(extraInfo, binConcept, defaultGroup);
        }

        // add default for other classifiers, that are not limited concepts, iff they are not allready present
        const classifiersToDo: PiClassifier[] =
            editor.language.conceptsAndInterfaces().filter(c => !(c instanceof PiBinaryExpressionConcept))
                .filter(c => !(c instanceof PiLimitedConcept));
        classifiersToDo.push(...editor.language.units);

        for (const con of classifiersToDo) {
            // Find or create the concept editor, and its properties
            let foundProjection: PiEditClassifierProjection = defaultGroup.findProjectionForType(con);
            if (!foundProjection) {
                // create a new projection
                // console.log("Adding default projection for " + con.unitName);
                const projection: PiEditProjection = this.defaultClassifierProjection(con, editor);
                defaultGroup.projections.push(projection);
            }

            let extraInfo: ExtraClassifierInfo = defaultGroup.findExtrasForType(con);
            this.defaultExtras(extraInfo, con, defaultGroup);
        }
    }

    private static defaultClassifierProjection(con: PiClassifier, editor: PiEditUnit): PiEditProjection {
        const projection = new PiEditProjection();
        projection.name = Names.defaultProjectionName;
        projection.classifier = PiElementReference.create<PiClassifier>(con.name, "PiClassifier");
        projection.classifier.owner = editor.language;
        const startLine = new PiEditProjectionLine();
        const text = PiEditProjectionText.create(con.name);
        text.style = "conceptkeyword";
        startLine.items.push(text);
        // find name property if available
        const nameProp = con.nameProperty();
        if (!!nameProp) {
            const sub = new PiEditPropertyProjection();
            sub.property = PiElementReference.create<PiPrimitiveProperty>(nameProp, "PiPrimitiveProperty");
            sub.property.owner = con.language;
            startLine.items.push(sub);
        }
        projection.lines.push(startLine);
        for (const prop of con.allPrimProperties().filter((p => p !== nameProp))) {
            const line = new PiEditProjectionLine();
            line.indent = 4;
            line.items.push(PiEditProjectionText.create(prop.name));
            const sub = new PiEditPropertyProjection();
            sub.property = PiElementReference.create<PiProperty>(prop, "PiProperty");
            sub.property.owner = con.language;
            if (prop.isList) {
                sub.listInfo = new ListInfo();
                sub.listInfo.joinType = ListJoinType.Separator;
                sub.listInfo.joinText = ", ";
            }
            line.items.push(sub);
            projection.lines.push(line);
        }
        for (const prop of con.allParts()) {
            if (prop.isList) {
                this.defaultListConceptProperty(con, prop, projection);
            } else {
                this.defaultSingleConceptProperty(con, prop, projection);
            }
        }
        for (const prop of con.allReferences()) {
            if (prop.isList) {
                this.defaultListConceptProperty(con, prop, projection);
            } else {
                this.defaultSingleConceptProperty(con, prop, projection);
            }
        }
        return projection;
    }

    private static defaultExtras(extraInfo: ExtraClassifierInfo, con: PiClassifier, defaultGroup: PiEditProjectionGroup) {
        if (extraInfo === null || extraInfo === undefined) {
            extraInfo = new ExtraClassifierInfo();
        }
        // default for referenceShortcut is not needed
        if (!extraInfo.trigger) {
            extraInfo.trigger = Names.classifier(con);
        }
        if (!extraInfo.symbol) {
            extraInfo.symbol = Names.classifier(con);
        }
        defaultGroup.extras.push(extraInfo);
    }

    private static defaultSingleConceptProperty(concept: PiClassifier, prop: PiConceptProperty, projection: PiEditProjection): void {
        const line = new PiEditProjectionLine();
        line.indent = 4;
        line.items.push(PiEditProjectionText.create(prop.name));
        const sub = new PiEditPropertyProjection();
        sub.property = PiElementReference.create<PiProperty>(prop, "PiProperty");
        sub.property.owner = concept.language;
        line.items.push(sub);
        projection.lines.push(line);
    }

    private static defaultListConceptProperty(concept: PiClassifier, prop: PiConceptProperty, projection: PiEditProjection): void {
        const line1 = new PiEditProjectionLine();
        const line2 = new PiEditProjectionLine();
        line1.indent = 4;
        line1.items.push(PiEditProjectionText.create(prop.name));
        line2.indent = 8;
        const sub = new PiEditPropertyProjection();
        sub.property = PiElementReference.create<PiProperty>(prop, "PiProperty");
        sub.property.owner = concept.language;
        sub.listInfo = new ListInfo();  // listInfo gets default values on initialization
        line2.items.push(sub);
        projection.lines.push(line1);
        projection.lines.push(line2);
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
