import { PiElementReference, PiLanguage } from "../../languagedef/metalanguage";
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
    PiEditUnit, PiOptionalPropertyProjection
} from "../metalanguage";
import { Names } from "../../utils";
import { PiUnitDescription } from "../../languagedef/metalanguage/PiLanguage";

export class EditorDefaultsGenerator {

    public static createEmptyEditorDefinition(language: PiLanguage): PiEditUnit {
        const editDef = new PiEditUnit();
        editDef.language = language;
        const defaultGroup = new PiEditProjectionGroup();
        defaultGroup.name = Names.defaultProjectionName;
        editDef.projectiongroups.push(defaultGroup);
        return editDef;
    }

    /**
     * Add default projections for all concepts that do not have one yet.
     * @param editor
     */
    public static addDefaults(editor: PiEditUnit): void {
        // console.log("adding defaults: " + editor.projectiongroups.map(p => p.name).join(", "))
        // find projection group to add defaults to, or make one if it does not exist
        let defaultGroup: PiEditProjectionGroup = editor.getDefaultProjectiongroup();
        if (defaultGroup === null || defaultGroup === undefined) {
            defaultGroup = new PiEditProjectionGroup();
            defaultGroup.name = Names.defaultProjectionName;
            defaultGroup.standardBooleanProjection = new BoolKeywords();
            defaultGroup.standardReferenceSeparator = ".";
            editor.projectiongroups.push(defaultGroup);
        }
        if (!defaultGroup.extras) {
            defaultGroup.extras = [];
        }

        // add defaults for binary expressions
        EditorDefaultsGenerator.defaultsForBinaryExpressions(editor.language, defaultGroup);

        // add defaults for other classifiers, that are not limited concepts, iff they are not already present
        EditorDefaultsGenerator.defaultsForOrdinaryClassifiers(editor.language, defaultGroup);

        // add defaults for units
        EditorDefaultsGenerator.defaultsForUnit(editor.language, defaultGroup);
    }

    private static defaultsForBinaryExpressions(language: PiLanguage, defaultGroup: PiEditProjectionGroup) {
        for (const binConcept of language.concepts.filter(c => c instanceof PiBinaryExpressionConcept)) {
            EditorDefaultsGenerator.addExtraDefaults(defaultGroup, binConcept, language);
        }
    }

    private static defaultsForOrdinaryClassifiers(language: PiLanguage, defaultGroup: PiEditProjectionGroup) {
        const classifiersToDo: PiClassifier[] = language.concepts.filter(c => !(c instanceof PiLimitedConcept || c instanceof PiBinaryExpressionConcept || c.isAbstract));
        // console.log("classifiersToDo: " + classifiersToDo.map(c => c.name).join(', '))
        for (const con of classifiersToDo) {
            // Find or create the projection, and its properties
            let foundProjection: PiEditClassifierProjection = defaultGroup.findProjectionForType(con);
            if (!foundProjection) {
                // create a new projection
                // console.log("Adding default projection for " + con.name);
                const projection: PiEditProjection = EditorDefaultsGenerator.defaultClassifierProjection(con, language);
                defaultGroup.projections.push(projection);
            }
            // find or create the extra info
            EditorDefaultsGenerator.addExtraDefaults(defaultGroup, con, language);
        }
    }

    private static defaultClassifierProjection(con: PiClassifier, language: PiLanguage): PiEditProjection {
        const projection = new PiEditProjection();
        projection.name = Names.defaultProjectionName;
        projection.classifier = PiElementReference.create<PiClassifier>(con.name, "PiClassifier");
        projection.classifier.owner = language;
        // add first line with type name - object name - start bracket: "Dog Jack {"
        const startLine = new PiEditProjectionLine();
        startLine.items.push(PiEditProjectionText.create(con.name));
        // find name property if available
        const nameProp = con.nameProperty();
        if (!!nameProp) {
            const sub = new PiEditPropertyProjection();
            sub.property = PiElementReference.create<PiPrimitiveProperty>(nameProp, "PiPrimitiveProperty");
            sub.property.owner = con.language;
            startLine.items.push(sub);
        }
        startLine.items.push(PiEditProjectionText.create("{")); // start bracket
        projection.lines.push(startLine);
        // add all properties on the next lines
        for (const prop of con.allProperties().filter((p => p !== nameProp))) {
            if (prop.isList && !prop.isOptional) {
                EditorDefaultsGenerator.defaultListProperty(con, prop, projection);
            } else if (prop.isList && prop.isOptional) {
                EditorDefaultsGenerator.defaultOptionalListProperty(con, prop, projection);
            } else if (!prop.isList && !prop.isOptional) {
                EditorDefaultsGenerator.defaultSingleProperty(con, prop, projection);
            } else { // prop.isList && prop.isOptional
                EditorDefaultsGenerator.defaultOptionalSingleProperty(con, prop, projection);
            }
        }
        // add end line with end bracket - "}"
        const endLine = new PiEditProjectionLine();
        endLine.items.push(PiEditProjectionText.create("}")); // end bracket
        projection.lines.push(endLine);
        return projection;
    }

    private static defaultSingleProperty(concept: PiClassifier, prop: PiProperty, projection: PiEditProjection | PiOptionalPropertyProjection): void {
        const line = new PiEditProjectionLine();
        line.indent = 4;
        line.items.push(PiEditProjectionText.create(prop.name));
        const sub = new PiEditPropertyProjection();
        sub.property = PiElementReference.create<PiProperty>(prop, "PiProperty");
        sub.property.owner = concept.language;
        line.items.push(sub);
        projection.lines.push(line);
    }

    private static defaultOptionalSingleProperty(concept: PiClassifier, prop: PiProperty, projection: PiEditProjection): void {
        const line = new PiEditProjectionLine();
        const optional = new PiOptionalPropertyProjection();
        optional.property = PiElementReference.create<PiProperty>(prop, "PiProperty");
        optional.property.owner = concept.language;
        EditorDefaultsGenerator.defaultSingleProperty(concept, prop, optional);
        line.items.push(optional);
        projection.lines.push(line);
    }
    
    private static defaultListProperty(concept: PiClassifier, prop: PiProperty, projection: PiEditProjection | PiOptionalPropertyProjection): void {
        const line1 = new PiEditProjectionLine();
        const line2 = new PiEditProjectionLine();
        line1.indent = 4;
        line1.items.push(PiEditProjectionText.create(prop.name));
        line2.indent = 8;
        const sub = new PiEditPropertyProjection();
        sub.property = PiElementReference.create<PiProperty>(prop, "PiProperty");
        sub.property.owner = concept.language;
        sub.listInfo = new ListInfo();  // listInfo gets default values on initialization, but we change them here
        sub.listInfo.joinType = ListJoinType.Separator;
        sub.listInfo.joinText = ",";
        line2.items.push(sub);
        projection.lines.push(line1);
        projection.lines.push(line2);
    }

    private static defaultOptionalListProperty(concept: PiClassifier, prop: PiProperty, projection: PiEditProjection): void {
        const line = new PiEditProjectionLine();
        const optional = new PiOptionalPropertyProjection();
        optional.property = PiElementReference.create<PiProperty>(prop, "PiProperty");
        optional.property.owner = concept.language;
        EditorDefaultsGenerator.defaultListProperty(concept, prop, optional);
        line.items.push(optional);
        projection.lines.push(line);
    }

    private static addExtraDefaults(defaultGroup: PiEditProjectionGroup, con: PiClassifier, language: PiLanguage) {
        let foundExtraInfo: ExtraClassifierInfo = defaultGroup.findExtrasForType(con);
        if (!foundExtraInfo) {
            const extraInfo = new ExtraClassifierInfo();
            EditorDefaultsGenerator.addExtras(extraInfo, con);
            extraInfo.classifier = PiElementReference.create<PiClassifier>(con, "PiClassifier");
            extraInfo.classifier.owner = language;
            defaultGroup.extras.push(extraInfo);
        } else {
            // add trigger and symbol, iff not present
            EditorDefaultsGenerator.addExtras(foundExtraInfo, con);
        }
    }

    private static addExtras(foundExtraInfo: ExtraClassifierInfo, con: PiClassifier) {
        // default for referenceShortcut is not needed
        if (!foundExtraInfo.trigger) {
            foundExtraInfo.trigger = Names.classifier(con);
        }
        // only binary expression need a symbol
        if (con instanceof PiBinaryExpressionConcept && !foundExtraInfo.symbol) {
            foundExtraInfo.symbol = Names.classifier(con);
        }
    }

    private static defaultsForUnit(language: PiLanguage, defaultGroup: PiEditProjectionGroup) {
        // console.log("classifiersToDo: " + classifiersToDo.map(c => c.name).join(', '))
        for (const con of language.units) {
            // Find or create the projection, and its properties
            let foundProjection: PiEditClassifierProjection = defaultGroup.findProjectionForType(con);
            if (!foundProjection) {
                // create a new projection
                // console.log("Adding default projection for " + con.name);
                const projection: PiEditProjection = EditorDefaultsGenerator.defaultClassifierProjection(con, language);
                defaultGroup.projections.push(projection);
            }
        }
    }
}
