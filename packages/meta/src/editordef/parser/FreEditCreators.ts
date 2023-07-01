import {
    BoolKeywords,
    ExtraClassifierInfo,
    ListInfo,
    ListJoinType,
    FreEditParsedClassifier,
    FreEditParsedNewline,
    FreEditParsedProjectionIndent,
    FreEditProjection,
    FreEditProjectionDirection,
    FreEditProjectionGroup,
    FreEditProjectionLine,
    FreEditProjectionText,
    FreEditPropertyProjection,
    FreEditSuperProjection,
    FreEditTableProjection,
    FreEditUnit,
    FreOptionalPropertyProjection
} from "../metalanguage";
import { ListUtil, MetaLogger } from "../../utils";
import { FreMetaClassifier, FreLangAppliedFeatureExp, FreLangSelfExp } from "../../languagedef/metalanguage";
import { FreEditParseUtil } from "./FreEditParseUtil";
// The next import should be separate and the last of the imports.
// Otherwise, the run-time error 'Cannot read property 'create' of undefined' occurs.
// See: https://stackoverflow.com/questions/48123645/error-when-accessing-static-properties-when-services-include-each-other
// and: https://stackoverflow.com/questions/45986547/property-undefined-typescript
import { MetaElementReference } from "../../languagedef/metalanguage";

const LOGGER = new MetaLogger("EditorCreators").mute();

let currentFileName: string = "SOME_FILENAME";
const classifiersUsedInSuperProjection: string[] = []; // remember these to add this list to the overall FreEditUnit
export function setCurrentFileName(newName: string) {
    currentFileName = newName;
}

// Functions used to create instances of the language classes from the parsed data objects.
// This is used as a bridge between JavaScript in the Pegjs parser and typescript

export function createEditUnit(group: FreEditProjectionGroup): FreEditUnit {
    const result: FreEditUnit = new FreEditUnit();
    if (!!group) {
        result.projectiongroups.push(group);
    }
    result.classifiersUsedInSuperProjection = classifiersUsedInSuperProjection;
    return result;
}

function extractProjections(data: Partial<FreEditProjectionGroup>, result: FreEditProjectionGroup) {
    data.projections.forEach(proj => {
        if (proj instanceof FreEditParsedClassifier) {
            if (!!proj.tableProjection) {
                const myProj: FreEditTableProjection = new FreEditTableProjection();
                if (!!proj.classifier) {
                    myProj.classifier = MetaElementReference.create<FreMetaClassifier>(proj.classifier.name, "FreClassifier");
                }
                if (!!proj.tableProjection.cells) {
                    myProj.cells = proj.tableProjection.cells;
                }
                if (!!proj.tableProjection.headers) {
                    myProj.headers = proj.tableProjection.headers;
                }
                if (!!proj.tableProjection.location) {
                    myProj.location = proj.tableProjection.location;
                }
                if (!!data.name) {
                    myProj.name = data.name;
                }
                result.projections.push(myProj);
            }
            if (!!proj.projection) {
                const myProj: FreEditProjection = new FreEditProjection();
                if (!!proj.classifier) {
                    myProj.classifier = MetaElementReference.create<FreMetaClassifier>(proj.classifier.name, "FreClassifier");
                }
                if (!!proj.projection.lines) {
                    myProj.lines = proj.projection.lines;
                }
                if (!!proj.projection.location) {
                    myProj.location = proj.projection.location;
                }
                if (!!data.name) {
                    myProj.name = data.name;
                }
                result.projections.push(myProj);
            }
            if (!!proj.classifierInfo) {
                if (!!proj.classifier) {
                    proj.classifierInfo.classifier = proj.classifier;
                }
                if (!result.extras) {
                    result.extras = [];
                }
                result.extras.push(proj.classifierInfo);
            }
        }
    });
}

export function createProjectionGroup(data: Partial<FreEditProjectionGroup>): FreEditProjectionGroup {
    const result: FreEditProjectionGroup = new FreEditProjectionGroup();
    if (!!data.name) {
        result.name = data.name;
    }
    if (data.precedence !== null && data.precedence !== undefined) { // precedence may be 0, "!!data.precedence" would return false
        result.precedence = data.precedence;
    }
    if (!!data.standardBooleanProjection) {
        result.standardBooleanProjection = data.standardBooleanProjection;
    }
    if (!!data.standardReferenceSeparator) {
        result.standardReferenceSeparator = data.standardReferenceSeparator;
    }
    if (!!data.projections) {
        // data.projections is a list of FreEditParsedClassifier
        // each list-element must be split into 1-3 components
        extractProjections(data, result);
    }
    if (!!data.location) {
        result.location = data.location;
        result.location.filename = currentFileName;
    }
    return result;
}

export function createParsedClassifier(data: Partial<FreEditParsedClassifier>): FreEditParsedClassifier {
    const result: FreEditParsedClassifier = new FreEditParsedClassifier();
    if (!!data.projection) {
        result.projection = data.projection;
    }
    if (!!data.tableProjection) {
        result.tableProjection = data.tableProjection;
    }
    if (!!data.classifierInfo) {
        result.classifierInfo = data.classifierInfo;
    }
    if (!!data.classifier) {
        result.classifier = data.classifier;
    }
    if (!!data.location) {
        result.location = data.location;
        result.location.filename = currentFileName;
    }
    return result;
}

export function createStdBool(data: Partial<BoolKeywords>): BoolKeywords {
    const result: BoolKeywords = new BoolKeywords();
    if (!!data.trueKeyword) {
        result.trueKeyword = data.trueKeyword;
    }
    if (!!data.falseKeyword) {
        result.falseKeyword = data.falseKeyword;
    }
    if (!!data.location) {
        result.location = data.location;
        result.location.filename = currentFileName;
    }
    return result;
}

export function createClassifierReference(data: Partial<MetaElementReference<FreMetaClassifier>>): MetaElementReference<FreMetaClassifier> {
    let result: MetaElementReference<FreMetaClassifier>;
    if (!!data.name) {
        result = MetaElementReference.create<FreMetaClassifier>(data.name, "FreClassifier");
    }
    if (!!data.location) {
        result.location = data.location;
        result.location.filename = currentFileName;
    }
    return result;
}

export function createClassifierInfo(data: Partial<ExtraClassifierInfo>): ExtraClassifierInfo {
    const result: ExtraClassifierInfo = new ExtraClassifierInfo();
    let hasContent: boolean = false;
    if (!!data.trigger) {
        result.trigger = data.trigger;
        hasContent = true;
    }
    if (!!data.referenceShortcutExp) {
        result.referenceShortcutExp = data.referenceShortcutExp;
        hasContent = true;
    }
    if (!!data.symbol) {
        result.symbol = data.symbol;
        hasContent = true;
    }
    if (!!data.location) {
        result.location = data.location;
        result.location.filename = currentFileName;
    }
    if (hasContent) {
        return result;
    } else {
        return null;
    }
}

export function createProjection(data: Partial<FreEditProjection>): FreEditProjection {
    const result = new FreEditProjection();
    if (!!data.classifier) {
        result.classifier = data.classifier;
    }
    if (!!data.lines) {
        result.lines = FreEditParseUtil.normalizeLine( data.lines[0] );
        // Now cleanup the parsed projection
        // FreEditParseUtil.normalizeLine(result);
    }
    if (!!data.location) {
        result.location = data.location;
        result.location.filename = currentFileName;
    }
    // console.log("createProjection \n\t" + result.toString());
    return result;
}

export function createTableProjection(data: Partial<FreEditTableProjection>): FreEditTableProjection {
    const result = new FreEditTableProjection();
    if (!!data.name) {
        result.name = data.name;
    }
    if (!!data.headers) {
        result.headers = data.headers;
    }
    if (!!data.cells) {
        result.cells = data.cells;
    }
    if (!!data.location) {
        result.location = data.location;
        result.location.filename = currentFileName;
    }
    // console.log("createTabelProjection " + result.toString());
    return result;
}

export function createLine(data: Partial<FreEditProjectionLine>): FreEditProjectionLine {
    const result = new FreEditProjectionLine();
    if (!!data.items) {
        result.items = data.items;
    }
    if (!!data.location) {
        result.location = data.location;
        result.location.filename = currentFileName;
    }
    return result;
}

export function createOptionalProjection(data: Partial<FreOptionalPropertyProjection>): FreOptionalPropertyProjection {
    const result = new FreOptionalPropertyProjection();
    if (!!data.lines) {
        result.lines = data.lines;
    }
    if (!!data.location) {
        result.location = data.location;
        result.location.filename = currentFileName;
    }
    // console.log("createOptionalProjection: \n\t" + result.toString());
    return result;
}

export function createIndent(data: Partial<FreEditParsedProjectionIndent>): FreEditParsedProjectionIndent {
    const result = new FreEditParsedProjectionIndent();
    if (!!data.indent) {
        result.indent = data.indent;
    }
    if (!!data.location) {
        result.location = data.location;
        result.location.filename = currentFileName;
    }
    return result;
}

export function createTextItem(data: string): FreEditProjectionText {
    const result = new FreEditProjectionText();
    if (!!data) {
        result.text = data;
    }
    return result;
}

export function createSuperProjection(data: Partial<FreEditSuperProjection>): FreEditSuperProjection {
    const result = new FreEditSuperProjection();
    if (!!data.superRef) {
        result.superRef = data.superRef;
        ListUtil.addIfNotPresent(classifiersUsedInSuperProjection, data.superRef.name);
    }
    if (!!data.projectionName) {
        result.projectionName = data.projectionName;
    }
    if (!!data.location) {
        result.location = data.location;
        result.location.filename = currentFileName;
    }
    return result;
}

// tslint:disable-next-line:typedef
export function createPropertyProjection(data: { expression, projectionName, location }): FreEditPropertyProjection {
    const result: FreEditPropertyProjection = new FreEditPropertyProjection();
    if (!!data["expression"]) {
        result.expression = data["expression"];
    }
    if (!!data["projectionName"]) {
        result.projectionName = data["projectionName"];
    }
    if (!!data["location"]) {
        result.location = data["location"];
        result.location.filename = currentFileName;
    }
    return result;
}

// tslint:disable-next-line:typedef
export function createListPropertyProjection(data: { expression, projectionName, listInfo, location }): FreEditPropertyProjection {
    const result: FreEditPropertyProjection = new FreEditPropertyProjection();
    result.listInfo = data["listInfo"];
    if (!!data["expression"]) {
        result.expression = data["expression"];
    }
    if (!!data["projectionName"]) {
        result.projectionName = data["projectionName"];
    }
    if (!!data["location"]) {
        result.location = data["location"];
        result.location.filename = currentFileName;
    }
    return result;
}

// tslint:disable-next-line:typedef
export function createTablePropertyProjection(data: { expression, projectionName, tableInfo, location }): FreEditPropertyProjection {
    const result: FreEditPropertyProjection = new FreEditPropertyProjection();
    if (!!data["tableInfo"]) {
        result.listInfo = data["tableInfo"];
    }
    if (!!data["expression"]) {
        result.expression = data["expression"];
    }
    if (!!data["projectionName"]) {
        result.projectionName = data["projectionName"];
    }
    if (!!data["location"]) {
        result.location = data["location"];
        result.location.filename = currentFileName;
    }
    result.listInfo.joinType = ListJoinType.NONE;
    return result;
}

// tslint:disable-next-line:typedef
export function createBooleanPropertyProjection(data: { expression, projectionName, keyword, location }): FreEditPropertyProjection {
    const result: FreEditPropertyProjection = new FreEditPropertyProjection();
    if (!!data["keyword"]) {
        result.boolInfo = data["keyword"];
    }
    if (!!data["expression"]) {
        result.expression = data["expression"];
    }
    if (!!data["projectionName"]) {
        result.projectionName = data["projectionName"];
    }
    if (!!data["location"]) {
        result.location = data["location"];
        result.location.filename = currentFileName;
    }
    return result;
}

export function createBoolKeywords(data: Partial<BoolKeywords>): BoolKeywords {
    const result = new BoolKeywords();
    if (!!data.trueKeyword) {
        result.trueKeyword = data.trueKeyword;
    }
    if (!!data.falseKeyword) {
        result.falseKeyword = data.falseKeyword;
    }
    if (!!data.location) {
        result.location = data.location;
        result.location.filename = currentFileName;
    }
    return result;
}

export function createListDirection(data: Object): FreEditProjectionDirection {
    const dir = data["direction"];
    if ( dir === "horizontal" || dir === "rows" ) {
        return FreEditProjectionDirection.Horizontal;
    }
    return FreEditProjectionDirection.Vertical;
}

export function createJoinType(data: Object): ListJoinType {
    const type = data["type"];
    if ( type === "separator" ) {
        return ListJoinType.Separator;
    } else if ( type === "terminator" ) {
        return ListJoinType.Terminator;
    } else if ( type === "initiator" ) {
        return ListJoinType.Initiator;
    }
    return ListJoinType.NONE;
}

export function createListInfo(data: Partial<ListInfo>): ListInfo {
    const result = new ListInfo();
    if (!!data.direction) {
        result.direction = data.direction;
    }
    if (!!data.isTable) {
        result.isTable = data.isTable;
    }
    if (!!data.joinType) {
        result.joinType = data.joinType;
    }
    if (!!data.joinText) {
        result.joinText = data.joinText;
    }
    if (!!data.location) {
        result.location = data.location;
        result.location.filename = currentFileName;
    }
    return result;
}

export function createNewline(): FreEditParsedNewline {
    return new FreEditParsedNewline();
}

export function createSelfExp(data: string): FreLangSelfExp {
    const result = new FreLangSelfExp();
    // we cannot set the sourceName of result, this should be done during checking
    result.appliedfeature = new FreLangAppliedFeatureExp();
    result.appliedfeature.sourceName = data;
    result.appliedfeature.sourceExp = result;
    return result;
}
