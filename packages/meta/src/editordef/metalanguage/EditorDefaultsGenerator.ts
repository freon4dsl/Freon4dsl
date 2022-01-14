import { PiElementReference } from "../../languagedef/metalanguage";
import {
    PiBinaryExpressionConcept,
    PiClassifier,
    PiLimitedConcept,
    PiPrimitiveProperty,
    PiProperty
} from "../../languagedef/metalanguage";
import {
    BoolKeywords,
    ExtraClassifierInfo,
    ListInfo,
    ListJoinType,
    PiEditClassifierProjection,
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
    }

    private static defaultsForOrdinaryClassifiers(editor: PiEditUnit, defaultGroup: PiEditProjectionGroup) {
        const classifiersToDo: PiClassifier[] = editor.language.classifiersWithProjection();

        for (const con of classifiersToDo) {
            // Find or create the projection, and its properties
            let foundProjection: PiEditClassifierProjection = defaultGroup.findProjectionForType(con);
            if (!foundProjection) {
                // create a new projection
                // console.log("Adding default projection for " + con.unitName);
                const projection: PiEditProjection = this.defaultClassifierProjection(con, editor);
                defaultGroup.projections.push(projection);
            }
            // find or create the extra info
            this.addExtraDefaults(defaultGroup, con, editor);
        }
    }

    private static defaultsForBinaryExpressions(editor: PiEditUnit, defaultGroup: PiEditProjectionGroup) {
        for (const binConcept of editor.language.concepts.filter(c => c instanceof PiBinaryExpressionConcept)) {
            let projection: PiEditClassifierProjection = defaultGroup.findProjectionForType(binConcept);
            if (projection === null || projection === undefined) {
                // console.log("Adding projection for " + binConcept.name);
                projection = new PiEditProjection();
                projection.name = Names.defaultProjectionName;
                projection.classifier = PiElementReference.create<PiBinaryExpressionConcept>(
                    binConcept as PiBinaryExpressionConcept,
                    "PiBinaryExpressionConcept"
                );
                projection.classifier.owner = editor.language;
                defaultGroup.projections.push(projection);
            }
            this.addExtraDefaults(defaultGroup, binConcept, editor);
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
        for (const prop of con.allProperties().filter((p => p !== nameProp))) {
            if (prop.isList) {
                this.defaultListConceptProperty(con, prop, projection);
            } else {
                this.defaultSingleConceptProperty(con, prop, projection);
            }
        }
        return projection;
    }

    private static defaultSingleConceptProperty(concept: PiClassifier, prop: PiProperty, projection: PiEditProjection): void {
        const line = new PiEditProjectionLine();
        line.indent = 4;
        line.items.push(PiEditProjectionText.create(prop.name));
        const sub = new PiEditPropertyProjection();
        sub.property = PiElementReference.create<PiProperty>(prop, "PiProperty");
        sub.property.owner = concept.language;
        line.items.push(sub);
        projection.lines.push(line);
    }

    private static defaultListConceptProperty(concept: PiClassifier, prop: PiProperty, projection: PiEditProjection): void {
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

    private static addExtraDefaults(defaultGroup: PiEditProjectionGroup, con: PiClassifier, editor: PiEditUnit) {
        let foundExtraInfo: ExtraClassifierInfo = defaultGroup.findExtrasForType(con);
        if (!foundExtraInfo) {
            const extraInfo = new ExtraClassifierInfo();
            this.addExtras(extraInfo, con);
            extraInfo.classifier = PiElementReference.create<PiClassifier>(con, "PiClassifier");
            extraInfo.classifier.owner = editor.language;
            defaultGroup.extras.push(extraInfo);
        } else {
            // add trigger and symbol, iff not present
            this.addExtras(foundExtraInfo, con);
        }
    }

    private static addExtras(foundExtraInfo: ExtraClassifierInfo, con: PiClassifier) {
        // default for referenceShortcut is not needed
        if (!foundExtraInfo.trigger) {
            foundExtraInfo.trigger = Names.classifier(con);
        }
        if (!foundExtraInfo.symbol) {
            foundExtraInfo.symbol = Names.classifier(con);
        }
    }
}
