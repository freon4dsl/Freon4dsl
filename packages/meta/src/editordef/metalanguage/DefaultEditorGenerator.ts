import { MetaElementReference, FreMetaInterface, FreMetaLanguage } from "../../languagedef/metalanguage";
import {
    FreMetaBinaryExpressionConcept,
    FreMetaClassifier,
    FreMetaLimitedConcept,
    FreMetaPrimitiveProperty,
    FreMetaProperty
} from "../../languagedef/metalanguage";
import {
    ExtraClassifierInfo,
    ListInfo,
    FreEditClassifierProjection,
    FreEditProjection,
    FreEditProjectionGroup,
    FreEditProjectionLine,
    FreEditProjectionText,
    FreEditPropertyProjection,
    FreEditUnit, FreOptionalPropertyProjection, BoolKeywords, FreEditStandardProjection, DisplayType, ForType
} from "../metalanguage";
import {LOG2USER, Names} from "../../utils";
import { EditorDefaults } from "./EditorDefaults";

export class DefaultEditorGenerator {
    private static interfacesUsed: FreMetaInterface[] = []; // holds all interfaces that are used as type of a property

    public static createEmptyEditorDefinition(language: FreMetaLanguage): FreEditUnit {
        const editDef = new FreEditUnit();
        editDef.language = language;
        const defaultGroup = new FreEditProjectionGroup();
        defaultGroup.name = Names.defaultProjectionName;
        editDef.projectiongroups.push(defaultGroup);
        defaultGroup.owningDefinition = editDef;
        return editDef;
    }

    /**
     * Add default projections for all concepts that do not have one yet.
     * Not included are: limited concepts, abstract concepts, and interfaces.
     * @param editor
     */
    public static addDefaults(editor: FreEditUnit): void {
        // console.log("adding defaults: " + editor.projectiongroups.map(p => p.name).join(", "))
        if (editor.language === undefined || editor.language === null) {
            LOG2USER.error("Cannot generate default editor, because language is unknown.")
            return;
        }
        // initialize
        this.interfacesUsed = [];
        // find projection group to add defaults to, or make one if it does not exist
        let defaultGroup: FreEditProjectionGroup | undefined = editor.getDefaultProjectiongroup();
        if (defaultGroup === null || defaultGroup === undefined) {
            // create a default projection group
            defaultGroup = new FreEditProjectionGroup();
            defaultGroup.name = Names.defaultProjectionName;
            DefaultEditorGenerator.defaultsForStandardProjections(defaultGroup);
            editor.projectiongroups.push(defaultGroup);
            defaultGroup.owningDefinition = editor;
        }
        if (!defaultGroup.extras) {
            defaultGroup.extras = [];
        }
        if (!defaultGroup.precedence) {
            defaultGroup.precedence = 0;
        }

        // add defaults for binary expressions
        DefaultEditorGenerator.defaultsForBinaryExpressions(editor.language, defaultGroup);

        // add defaults for other classifiers, that are not limited concepts, iff they are not already present
        DefaultEditorGenerator.defaultsForOrdinaryClassifiers(editor.language, defaultGroup);

        // add defaults for units
        DefaultEditorGenerator.defaultsForUnit(editor.language, defaultGroup);

        // add defaults for interfaces that are used as type of a property, iff not already present
        DefaultEditorGenerator.defaultsForInterfaces(editor.language, defaultGroup);

        // add defaults for classifiers that are used within a super projection, iff not already present
        DefaultEditorGenerator.defaultsForSupers(editor.language, defaultGroup, editor.classifiersUsedInSuperProjection);
    }

    private static defaultsForStandardProjections(defaultGroup: FreEditProjectionGroup) {
        // create the standard for the boolean projection
        let yy: FreEditStandardProjection = new FreEditStandardProjection();
        yy.for = ForType.Boolean;
        yy.keywords = new BoolKeywords();
        yy.keywords.falseKeyword = "false";
        yy.displayType = DisplayType.Text;
        defaultGroup.standardProjections.push(yy);
        // create the standard for the number projection
        yy = new FreEditStandardProjection();
        yy.for = ForType.Number;
        yy.displayType = DisplayType.Text;
        defaultGroup.standardProjections.push(yy);
        // create the standard for the single limited projection
        yy = new FreEditStandardProjection();
        yy.for = ForType.Limited;
        yy.displayType = DisplayType.Text;
        defaultGroup.standardProjections.push(yy);
        // create the standard for the limited list projection
        yy = new FreEditStandardProjection();
        yy.for = ForType.LimitedList;
        yy.displayType = DisplayType.Text;
        defaultGroup.standardProjections.push(yy);
        // create the standard for the reference separator
        yy = new FreEditStandardProjection();
        yy.for = ForType.ReferenceSeparator;
        yy.separator = EditorDefaults.standardReferenceSeparator;
        defaultGroup.standardProjections.push(yy);
    }

    private static defaultsForBinaryExpressions(language: FreMetaLanguage, defaultGroup: FreEditProjectionGroup) {
        for (const binConcept of language.concepts.filter(c => c instanceof FreMetaBinaryExpressionConcept)) {
            DefaultEditorGenerator.addExtraDefaults(defaultGroup, binConcept, language);
        }
    }

    private static defaultsForOrdinaryClassifiers(language: FreMetaLanguage, defaultGroup: FreEditProjectionGroup) {
        const classifiersToDo: FreMetaClassifier[] = language.concepts
            .filter(c => !(c instanceof FreMetaLimitedConcept || c instanceof FreMetaBinaryExpressionConcept || c.isAbstract));
        // console.log("classifiersToDo: " + classifiersToDo.map(c => c.name).join(', '))
        for (const con of classifiersToDo) {
            // Find or create the projection, and its properties
            const foundProjection: FreEditClassifierProjection | undefined = defaultGroup.findNonTableProjectionForType(con);
            if (!foundProjection) {
                // create a new projection
                // console.log("Adding default projection for " + con.name);
                const projection: FreEditProjection = DefaultEditorGenerator.defaultClassifierProjection(con, language);
                defaultGroup.projections.push(projection);
            }
            // find or create the extra info
            DefaultEditorGenerator.addExtraDefaults(defaultGroup, con, language);
        }
    }

    private static defaultsForInterfaces(language: FreMetaLanguage, defaultGroup: FreEditProjectionGroup) {
        for (const con of this.interfacesUsed) {
            this.createClassifierDefault(defaultGroup, con, language);
        }
        // console.log("defaultsForInterfaces done ");
    }

    private static createClassifierDefault(defaultGroup: FreEditProjectionGroup, con: FreMetaClassifier, language: FreMetaLanguage) {
        // Find or create the projection, and its properties
        const foundProjection: FreEditClassifierProjection | undefined = defaultGroup.findNonTableProjectionForType(con);

        if (!foundProjection) {
            // create a new projection
            // console.log("Adding default projection for " + con.name);
            const projection: FreEditProjection = DefaultEditorGenerator.defaultClassifierProjection(con, language);
            defaultGroup.projections.push(projection);
        }
        // find or create the extra info
        DefaultEditorGenerator.addExtraDefaults(defaultGroup, con, language);
    }

    private static defaultsForSupers(language: FreMetaLanguage, defaultGroup: FreEditProjectionGroup, classifiersUsedInSuperProjection: string[]) {
        for (const clsName of classifiersUsedInSuperProjection) {
            const con: FreMetaClassifier | undefined = language.findClassifier(clsName);
            if (con !== null || con !== undefined) {
                this.createClassifierDefault(defaultGroup, con as FreMetaClassifier, language);
            }
        }
        // console.log("defaultsForSupers done ");
    }

    private static defaultClassifierProjection(con: FreMetaClassifier, language: FreMetaLanguage): FreEditProjection {
        const projection = new FreEditProjection();
        projection.name = Names.defaultProjectionName;
        projection.classifier = MetaElementReference.create<FreMetaClassifier>(con.name, "FreClassifier");
        projection.classifier.owner = language;
        // add first line with type name - object name - start bracket: "Dog Jack {"
        const startLine = new FreEditProjectionLine();
        startLine.items.push(FreEditProjectionText.create(con.name));
        // find name property if available
        const nameProp = con.nameProperty();
        if (!!nameProp) {
            const sub = new FreEditPropertyProjection();
            sub.property = MetaElementReference.create<FreMetaPrimitiveProperty>(nameProp, "FrePrimitiveProperty");
            sub.property.owner = con.language;
            startLine.items.push(sub);
        }
        startLine.items.push(FreEditProjectionText.create(EditorDefaults.startBracket)); // start bracket
        projection.lines.push(startLine);
        // add all properties on the next lines
        for (const prop of con.allProperties().filter((p => p !== nameProp))) {
            // add the type if it is an interface to the list to be generated later
            const propType = prop.type;
            if (propType instanceof FreMetaInterface) {
                this.interfacesUsed.push(propType);
            }
            // do the property
            if (prop.isList && !prop.isOptional) {
                DefaultEditorGenerator.defaultListProperty(con, prop, projection);
            } else if (prop.isList && prop.isOptional) {
                DefaultEditorGenerator.defaultOptionalListProperty(con, prop, projection);
            } else if (!prop.isList && !prop.isOptional) {
                DefaultEditorGenerator.defaultSingleProperty(con, prop, projection);
            } else { // prop.isList && prop.isOptional
                DefaultEditorGenerator.defaultOptionalSingleProperty(con, prop, projection);
            }
        }
        // add end line with end bracket
        const endLine = new FreEditProjectionLine();
        endLine.items.push(FreEditProjectionText.create(EditorDefaults.endBracket)); // end bracket
        projection.lines.push(endLine);
        return projection;
    }

    private static defaultSingleProperty(concept: FreMetaClassifier, prop: FreMetaProperty, projection: FreEditProjection | FreOptionalPropertyProjection): void {
        const line = new FreEditProjectionLine();
        line.indent = EditorDefaults.standardIndent;
        line.items.push(FreEditProjectionText.create(prop.name));
        const sub = new FreEditPropertyProjection();
        sub.property = MetaElementReference.create<FreMetaProperty>(prop, "FreProperty");
        sub.property.owner = concept.language;
        line.items.push(sub);
        projection.lines.push(line);
    }

    private static defaultOptionalSingleProperty(concept: FreMetaClassifier, prop: FreMetaProperty, projection: FreEditProjection): void {
        const line = new FreEditProjectionLine();
        const optional = new FreOptionalPropertyProjection();
        optional.property = MetaElementReference.create<FreMetaProperty>(prop, "FreProperty");
        optional.property.owner = concept.language;
        DefaultEditorGenerator.defaultSingleProperty(concept, prop, optional);
        line.items.push(optional);
        projection.lines.push(line);
    }

    private static defaultListProperty(concept: FreMetaClassifier, prop: FreMetaProperty, projection: FreEditProjection | FreOptionalPropertyProjection): void {
        // every list is projected as two lines
        // the first shows the property name
        const line1 = new FreEditProjectionLine();
        line1.indent = EditorDefaults.standardIndent;
        line1.items.push(FreEditProjectionText.create(prop.name));

        // the second shows the property itself
        const line2 = new FreEditProjectionLine();
        line2.indent = EditorDefaults.standardIndent * 2;
        const sub = new FreEditPropertyProjection();
        sub.property = MetaElementReference.create<FreMetaProperty>(prop, "FreProperty");
        sub.property.owner = concept.language;
        sub.listInfo = new ListInfo();  // listInfo gets default values on initialization, but we change them here
        sub.listInfo.joinType = EditorDefaults.listJoinType;
        sub.listInfo.joinText = EditorDefaults.listJoinText;
        line2.items.push(sub);

        projection.lines.push(line1);
        projection.lines.push(line2);
    }

    private static defaultOptionalListProperty(concept: FreMetaClassifier, prop: FreMetaProperty, projection: FreEditProjection): void {
        const line = new FreEditProjectionLine();
        const optional = new FreOptionalPropertyProjection();
        optional.property = MetaElementReference.create<FreMetaProperty>(prop, "FreProperty");
        optional.property.owner = concept.language;
        DefaultEditorGenerator.defaultListProperty(concept, prop, optional);
        line.items.push(optional);
        projection.lines.push(line);
    }

    private static addExtraDefaults(defaultGroup: FreEditProjectionGroup, con: FreMetaClassifier, language: FreMetaLanguage) {
        const foundExtraInfo: ExtraClassifierInfo | undefined = defaultGroup.findExtrasForType(con);
        if (!foundExtraInfo) {
            const extraInfo = new ExtraClassifierInfo();
            DefaultEditorGenerator.addExtras(extraInfo, con);
            extraInfo.classifier = MetaElementReference.create<FreMetaClassifier>(con, "FreClassifier");
            extraInfo.classifier.owner = language;
            defaultGroup.extras.push(extraInfo);
        } else {
            // add trigger and symbol, iff not present
            DefaultEditorGenerator.addExtras(foundExtraInfo, con);
        }
    }

    private static addExtras(foundExtraInfo: ExtraClassifierInfo, con: FreMetaClassifier) {
        // default for referenceShortcut is not needed
        if (!foundExtraInfo.trigger) {
            if (!!foundExtraInfo.symbol) { // if there is a symbol defined then the trigger is equal to the symbol
                foundExtraInfo.trigger = foundExtraInfo.symbol;
            } else {
                foundExtraInfo.trigger = Names.classifier(con);
            }
        }
        // only binary expressions need a symbol
        if (con instanceof FreMetaBinaryExpressionConcept && !foundExtraInfo.symbol) {
            foundExtraInfo.symbol = Names.classifier(con);
        }
    }

    private static defaultsForUnit(language: FreMetaLanguage, defaultGroup: FreEditProjectionGroup) {
        // console.log("defaultsForUnit: " + language.units.map(c => c.name).join(', '))
        for (const con of language.units) {
            // Find or create the projection, and its properties
            const foundProjection: FreEditClassifierProjection = defaultGroup.findProjectionsForType(con)[0];
            if (!foundProjection) {
                // create a new projection
                // console.log("Adding default projection for " + con.name);
                const projection: FreEditProjection = DefaultEditorGenerator.defaultClassifierProjection(con, language);
                defaultGroup.projections.push(projection);
            }
        }
    }
}
