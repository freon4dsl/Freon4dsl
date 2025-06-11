import {
    FreEditExtraClassifierInfo,
    FreEditListInfo,
    ListJoinType,
    FreEditParsedClassifier,
    FreEditParsedNewline,
    FreEditParsedProjectionIndent,
    FreEditNormalProjection,
    FreEditProjectionDirection,
    FreEditProjectionGroup,
    FreEditProjectionLine,
    FreEditProjectionText,
    FreEditPropertyProjection,
    FreEditSuperProjection,
    FreEditTableProjection,
    FreEditUnit,
    FreOptionalPropertyProjection,
    FreEditBoolKeywords,
    FreEditGlobalProjection,
    FreEditButtonDef,
    FreEditKeyValuePair,
    FreEditFragmentDefinition,
    FreEditExternalInfo,
    FreEditSimpleExternal,
} from "../metalanguage/index.js";
import { ListUtil } from "../../utils/no-dependencies/index.js";
import { FreMetaClassifier, FreLangAppliedFeatureExp, FreLangSelfExp } from "../../languagedef/metalanguage/index.js";
import { FreEditParseUtil } from "./FreEditParseUtil.js";
// The next import should be separate and the last of the imports.
// Otherwise, the run-time error 'Cannot read property 'create' of undefined' occurs.
// See: https://stackoverflow.com/questions/48123645/error-when-accessing-static-properties-when-services-include-each-other
// and: https://stackoverflow.com/questions/45986547/property-undefined-typescript
import { MetaElementReference } from "../../languagedef/metalanguage/index.js";
import { FreEditFragmentProjection } from "../metalanguage/editlanguage/FreEditFragmentProjection.js";

// const LOGGER = new MetaLogger("EditorCreators").mute();

let currentFileName: string = "SOME_FILENAME";
const classifiersUsedInSuperProjection: string[] = []; // remember these to add this list to the overall FreEditUnit
export function setCurrentFileName(newName: string) {
    currentFileName = newName;
}

// Functions used to create instances of the language classes from the parsed data objects.
// This is used as a bridge between JavaScript in the Pegjs parser and typescript

export function createEditUnit(group: FreEditProjectionGroup): FreEditUnit {
    // console.log("Creators.createEditUnit: " + group.name)
    const result: FreEditUnit = new FreEditUnit();
    if (!!group) {
        result.projectiongroups.push(group);
    }
    result.classifiersUsedInSuperProjection = classifiersUsedInSuperProjection;
    return result;
}

function extractProjections(data: Partial<FreEditProjectionGroup>, result: FreEditProjectionGroup) {
    data.projections?.forEach((proj) => {
        if (proj instanceof FreEditParsedClassifier) {
            if (!!proj.tableProjection) {
                const myProj: FreEditTableProjection = new FreEditTableProjection();
                if (!!proj.classifier) {
                    myProj.classifier = MetaElementReference.create<FreMetaClassifier>(proj.classifier.name);
                }
                if (!!proj.tableProjection.cells) {
                    myProj.cells = proj.tableProjection.cells;
                }
                if (!!proj.tableProjection.headers) {
                    myProj.headers = proj.tableProjection.headers;
                }
                if (!!proj.fragmentDefinitions) {
                    myProj.fragmentDefinitions = proj.fragmentDefinitions;
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
                const myProj: FreEditNormalProjection = new FreEditNormalProjection();
                if (!!proj.classifier) {
                    myProj.classifier = MetaElementReference.create<FreMetaClassifier>(
                        proj.classifier.name
                    );
                }
                if (!!proj.projection.lines) {
                    myProj.lines = proj.projection.lines;
                }
                if (!!proj.fragmentDefinitions) {
                    myProj.fragmentDefinitions = proj.fragmentDefinitions;
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
    // console.log("Creators.createProjectionGroup: " + data.name)
    const result: FreEditProjectionGroup = new FreEditProjectionGroup();
    if (!!data.name) {
        result.name = data.name;
    }
    if (data.precedence !== null && data.precedence !== undefined) {
        // precedence may be 0, "!!data.precedence" would return false
        result.precedence = data.precedence;
    }
    if (!!data.globalProjections) {
        result.globalProjections = data.globalProjections;
        // console.log("Creators: found global projections: " + result.globalProjections.map(proj => proj.toString()))
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

export function createGlobal(data: Partial<FreEditGlobalProjection>): FreEditGlobalProjection {
    const result: FreEditGlobalProjection = new FreEditGlobalProjection();
    if (!!data.for) {
        result.for = data.for;
    }
    if (!!data.displayType) {
        result.displayType = data.displayType;
    }
    if (!!data.keywords) {
        result.keywords = data.keywords;
    }
    if (!!data.externals) {
        result.externals = data.externals;
    }
    if (!!data.separator) {
        result.separator = data.separator;
    }
    if (!!data.location) {
        result.location = data.location;
        result.location.filename = currentFileName;
    }
    // console.log("Creators.createGlobal: " + result.toString())
    return result;
}

export function createExternalInfo(data: Partial<FreEditExternalInfo>): FreEditExternalInfo {
    const result: FreEditExternalInfo = new FreEditExternalInfo();
    if (!!data.wrapBy) {
        result.wrapBy = data.wrapBy;
    }
    if (!!data.replaceBy) {
        result.replaceBy = data.replaceBy;
    }
    if (!!data.params) {
        result.params = data.params;
    }
    if (!!data.location) {
        result.location = data.location;
        result.location.filename = currentFileName;
    }
    // console.log("Creators.createExternalInfo: " + result.toString())
    return result;
}

export function createKeyValuePair(data: Partial<FreEditKeyValuePair>): FreEditKeyValuePair {
    const result: FreEditKeyValuePair = new FreEditKeyValuePair();
    if (!!data.key) {
        result.key = data.key;
    }
    if (!!data.value) {
        result.value = data.value;
    }
    if (!!data.location) {
        result.location = data.location;
        result.location.filename = currentFileName;
    }
    // console.log("Creators.createKeyValuePair: " + result.toString())
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
    if (!!data.fragmentDefinitions) {
        result.fragmentDefinitions = data.fragmentDefinitions;
    }
    if (!!result.classifier && !!result.fragmentDefinitions) {
        result.fragmentDefinitions.forEach((frag) => (frag.childProjection.classifier = result.classifier));
    }
    if (!!data.location) {
        result.location = data.location;
        result.location.filename = currentFileName;
    }
    // console.log("Creators.createParsedClassifier: " + result.toString())
    return result;
}

export function createFragmentProjection(data: Partial<FreEditFragmentProjection>): FreEditFragmentProjection {
    const result: FreEditFragmentProjection = new FreEditFragmentProjection();
    if (!!data.name) {
        result.name = data.name;
    }
    if (!!data.wrapperInfo) {
        result.wrapperInfo = data.wrapperInfo;
    }
    if (!!data.location) {
        result.location = data.location;
        result.location.filename = currentFileName;
    }
    // console.log("Creators.createFragmentProjection: " + result.toString())
    return result;
}

export function createFragmentDefinition(data: Partial<FreEditFragmentDefinition>): FreEditFragmentDefinition {
    const result: FreEditFragmentDefinition = new FreEditFragmentDefinition();
    if (!!data.name) {
        result.name = data.name;
    }
    if (!!data.wrapperInfo) {
        result.wrapperInfo = data.wrapperInfo;
    }
    if (!!data.childProjection) {
        result.childProjection = data.childProjection;
    }
    if (!!data.location) {
        result.location = data.location;
        result.location.filename = currentFileName;
    }
    // console.log("Creators.FreEditFragmentDefinition: " + result.toString())
    return result;
}

export function createSimpleExternal(data: Partial<FreEditSimpleExternal>): FreEditSimpleExternal {
    const result: FreEditSimpleExternal = new FreEditSimpleExternal();
    if (!!data.name) {
        result.name = data.name;
    }
    if (!!data.params) {
        result.params = data.params;
    }
    if (!!data.location) {
        result.location = data.location;
        result.location.filename = currentFileName;
    }
    // console.log("Creators.createSimpleExternal: " + result.toString())
    return result;
}

export function createClassifierInfo(
    data: Partial<FreEditExtraClassifierInfo>,
): FreEditExtraClassifierInfo | undefined {
    const result: FreEditExtraClassifierInfo = new FreEditExtraClassifierInfo();
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
        return undefined;
    }
}

export function createProjection(data: Partial<FreEditNormalProjection>): FreEditNormalProjection {
    const result = new FreEditNormalProjection();
    if (!!data.classifier) {
        result.classifier = data.classifier;
    }
    if (!!data.lines) {
        result.lines = FreEditParseUtil.normalizeLine(data.lines[0]);
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
    const result: FreEditTableProjection = new FreEditTableProjection();
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
    // console.log("createTableProjection " + result.toString());
    return result;
}

export function createLine(data: Partial<FreEditProjectionLine>): FreEditProjectionLine {
    const result: FreEditProjectionLine = new FreEditProjectionLine();
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
    const result: FreOptionalPropertyProjection = new FreOptionalPropertyProjection();
    if (!!data.lines) {
        result.lines = FreEditParseUtil.normalizeLine(data.lines[0]);
    }
    if (!!data.location) {
        result.location = data.location;
        result.location.filename = currentFileName;
    }
    // console.log("createOptionalProjection: \n\t" + result.toString());
    return result;
}

export function createIndent(data: Partial<FreEditParsedProjectionIndent>): FreEditParsedProjectionIndent {
    const result: FreEditParsedProjectionIndent = new FreEditParsedProjectionIndent();
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
    const result: FreEditSuperProjection = new FreEditSuperProjection();
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

export function createSinglePropertyProjection(data: Partial<FreEditPropertyProjection>): FreEditPropertyProjection {
    const result: FreEditPropertyProjection = new FreEditPropertyProjection();
    if (!!data.expression) {
        result.expression = data.expression;
    }
    if (!!data.projectionName) {
        result.projectionName = data.projectionName;
    }
    if (!!data.displayType) {
        result.displayType = data.displayType;
    }
    if (!!data.boolKeywords) {
        result.boolKeywords = data.boolKeywords;
    }
    if (!!data.externalInfo) {
        result.externalInfo = data.externalInfo;
    }
    if (!!data.location) {
        result.location = data.location;
        result.location.filename = currentFileName;
    }
    // console.log("Creators.createSinglePropertyProjection: <<" + result.toString() + ">>");
    return result;
}

export function createListPropertyProjection(data: Partial<FreEditPropertyProjection>): FreEditPropertyProjection {
    // console.log("Creators.createListPropertyProjection " + data);
    const result: FreEditPropertyProjection = new FreEditPropertyProjection();
    if (!!data.expression) {
        result.expression = data.expression;
    }
    if (!!data.projectionName) {
        result.projectionName = data.projectionName;
    }
    if (!!data.displayType) {
        result.displayType = data.displayType;
    }
    if (!!data.listInfo) {
        result.listInfo = data.listInfo;
    }
    if (!!data.externalInfo) {
        result.externalInfo = data.externalInfo;
    }
    if (!!data["location"]) {
        result.location = data["location"];
        result.location.filename = currentFileName;
    }
    // console.log("Creators.createListPropertyProjection <<" + result.toString() + ">>");
    return result;
}

export function createBoolKeywords(data: Partial<FreEditBoolKeywords>): FreEditBoolKeywords {
    const result: FreEditBoolKeywords = new FreEditBoolKeywords();
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
    // console.log("Creators.createBoolKeywords: <<" + result.toString() + ">>");
    return result;
}

export function createListDirection(data: { [direction: string]: any }): FreEditProjectionDirection {
    const dir = data["direction"];
    if (dir === "horizontal" || dir === "rows") {
        return FreEditProjectionDirection.Horizontal;
    }
    return FreEditProjectionDirection.Vertical;
}

export function createJoinType(data: { [type: string]: any }): ListJoinType {
    const type: string = data["type"];
    if (type === "separator") {
        return ListJoinType.Separator;
    } else if (type === "terminator") {
        return ListJoinType.Terminator;
    } else if (type === "initiator") {
        return ListJoinType.Initiator;
    }
    return ListJoinType.NONE;
}

export function createListInfo(data: Partial<FreEditListInfo>): FreEditListInfo {
    const result: FreEditListInfo = new FreEditListInfo();
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
    // console.log("Creators.createListInfo: <<" + result.toString() + ">>")
    return result;
}

export function createNewline(): FreEditParsedNewline {
    return new FreEditParsedNewline();
}

export function createButtonDef(data: Partial<FreEditButtonDef>): FreEditButtonDef {
    const result: FreEditButtonDef = new FreEditButtonDef();
    if (!!data.text) {
        result.text = data.text;
    }
    if (!!data.boxRole) {
        result.boxRole = data.boxRole;
    }
    if (!!data.location) {
        result.location = data.location;
        result.location.filename = currentFileName;
    }
    // console.log("Creators.createButtonDef: <<" + result.toString() + ">>")
    return result;
}

export function createSelfExp(data: string): FreLangSelfExp {
    const result: FreLangSelfExp = new FreLangSelfExp();
    // we cannot set the sourceName of result, this should be done during checking
    result.appliedfeature = new FreLangAppliedFeatureExp();
    result.appliedfeature.sourceName = data;
    result.appliedfeature.sourceExp = result;
    return result;
}
