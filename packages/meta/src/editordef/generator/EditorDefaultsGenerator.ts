import { PiElementReference } from "../../languagedef/metalanguage";
import {
    PiBinaryExpressionConcept,
    PiClassifier,
    PiConceptProperty,
    PiLimitedConcept,
    PiPrimitiveProperty,
    PiProperty
} from "../../languagedef/metalanguage";
import {
    BoolKeywords,
    ExtraClassifierInfo,
    ListInfo,
    ListJoinType,
    PiEditClassifierProjection, PiEditLimitedProjection,
    PiEditProjection,
    PiEditProjectionGroup,
    PiEditProjectionLine,
    PiEditProjectionText,
    PiEditPropertyProjection,
    PiEditUnit
} from "../metalanguage";
import { Names } from "../../utils";

export class EditorDefaultsGenerator {

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
            defaultGroup.standardBooleanProjection = new BoolKeywords();
            defaultGroup.standardReferenceSeparator = ".";
        }
        if (!defaultGroup.extras) {
            defaultGroup.extras = [];
        }

        // add defaults for binary expressions
        this.defaultsForBinaryExpressions(editor, defaultGroup);

        // add default for other classifiers, that are not limited concepts, iff they are not already present
        this.defaultsForOrdinaryClassifiers(editor, defaultGroup);

        // add defaults for limited concepts, iff they are not already present
        const limitedConceptsToDo: PiClassifier[] =
            editor.language.concepts.filter(c => (c instanceof PiLimitedConcept));

        for (const con of limitedConceptsToDo) {
            // Find or create the concept editor, and its properties
            let foundProjection: PiEditClassifierProjection = defaultGroup.findProjectionForType(con);
            if (!foundProjection) {
                // create a new projection
                // console.log("Adding default projection for " + con.unitName);
                const projection: PiEditLimitedProjection = this.defaultLimitedProjection(con as PiLimitedConcept, editor);
                defaultGroup.projections.push(projection);
            }
            let foundExtraInfo: ExtraClassifierInfo = defaultGroup.findExtrasForType(con);
            if (!foundExtraInfo) {
                const extraInfo = this.defaultExtras(con);
                extraInfo.classifier = PiElementReference.create<PiLimitedConcept>(con as PiLimitedConcept, "PiLimitedConcept");
                extraInfo.classifier.owner = editor.language;
                defaultGroup.extras.push(extraInfo);
            }
        }

    }

    private static defaultsForOrdinaryClassifiers(editor: PiEditUnit, defaultGroup: PiEditProjectionGroup) {
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
            let foundExtraInfo: ExtraClassifierInfo = defaultGroup.findExtrasForType(con);
            if (!foundExtraInfo) {
                const extraInfo = this.defaultExtras(con);
                extraInfo.classifier = PiElementReference.create<PiClassifier>(con, "PiClassifier");
                extraInfo.classifier.owner = editor.language;
                defaultGroup.extras.push(extraInfo);
            }
        }
    }

    private static defaultsForBinaryExpressions(editor: PiEditUnit, defaultGroup: PiEditProjectionGroup) {
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
            let foundExtraInfo: ExtraClassifierInfo = defaultGroup.findExtrasForType(binConcept);
            if (!foundExtraInfo) {
                const extraInfo = this.defaultExtras(binConcept);
                extraInfo.classifier = PiElementReference.create<PiBinaryExpressionConcept>(
                    binConcept as PiBinaryExpressionConcept,
                    "PiBinaryExpressionConcept"
                );
                extraInfo.classifier.owner = editor.language;
                defaultGroup.extras.push(extraInfo);
            }
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

    private static defaultLimitedProjection(con: PiLimitedConcept, editor: PiEditUnit): PiEditLimitedProjection {
        const projection = new PiEditLimitedProjection();
        projection.name = Names.defaultProjectionName;
        projection.classifier = PiElementReference.create<PiLimitedConcept>(con, "PiLimitedConcept");
        projection.classifier.owner = editor.language;

        // TODO is this really needed?
        // projection.instanceProjections

        return projection;
    }

    private static defaultExtras(con: PiClassifier): ExtraClassifierInfo {
        const result = new ExtraClassifierInfo();
        // default for referenceShortcut is not needed
        if (!result.trigger) {
            result.trigger = Names.classifier(con);
        }
        if (!result.symbol) {
            result.symbol = Names.classifier(con);
        }
        return result;
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
        sub.listInfo = new ListInfo();  // listInfo gets default values on initialization, but we change the joinType here
        sub.listInfo.joinType = ListJoinType.Separator;
        line2.items.push(sub);
        projection.lines.push(line1);
        projection.lines.push(line2);
    }

}
