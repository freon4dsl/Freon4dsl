import {
    PiEditProjectionDirection,
    ListInfo,
    PiEditUnit,
    PiEditParsedNewline,
    PiEditProjection,
    PiEditParsedProjectionIndent,
    PiEditProjectionLine,
    PiEditProjectionText,
    PiEditPropertyProjection,
    PiEditTableProjection,
    PiEditProjectionGroup,
    BoolKeywords,
    PiEditClassifierProjection,
    ExtraClassifierInfo,
    PiListPropertyProjection,
    PiBooleanPropertyProjection,
    ListJoinType,
    PiOptionalPropertyProjection
} from "../metalanguage/NewPiEditDefLang";
import { MetaLogger } from "../../utils/MetaLogger";
import { PiClassifier } from "../../languagedef/metalanguage";
import { PiEditProjectionUtil } from "../metalanguage/PiEditProjectionUtil";
// The next import should be separate and the last of the imports.
// Otherwise, the run-time error 'Cannot read property 'create' of undefined' occurs.
// See: https://stackoverflow.com/questions/48123645/error-when-accessing-static-properties-when-services-include-each-other
// and: https://stackoverflow.com/questions/45986547/property-undefined-typescript
import { PiElementReference } from "../../languagedef/metalanguage/PiElementReference";

const LOGGER = new MetaLogger("NewEditorCreators").mute();

let currentFileName: string = "SOME_FILENAME";
export function setCurrentFileName(newName: string) {
    currentFileName = newName;
}

// Functions used to create instances of the language classes from the parsed data objects.
// This is used as a bridge between JavaScript in the Pegjs parser and typescript

export function createEditUnit(data: Partial<PiEditUnit>): PiEditUnit {
    let result: PiEditUnit = new PiEditUnit();
    if (!!data.name) {
        result.name = data.name;
    }
    if (!!data.standardBooleanProjection) {
        result.standardBooleanProjection = data.standardBooleanProjection;
    }
    if (!!data.standardReferenceSeparator) {
        result.standardReferenceSeparator = data.standardReferenceSeparator;
    }
    if (!!data.projectiongroups) {
        result.projectiongroups = data.projectiongroups;
    }
    if (!!data.location) {
        result.location = data.location;
        result.location.filename = currentFileName;
    }
    // console.log("createEditUnit\n\t" + result.toString());
    return result;
}

export function createProjectionGroup(data: Partial<PiEditProjectionGroup>): PiEditProjectionGroup {
    let result: PiEditProjectionGroup = new PiEditProjectionGroup();
    if (!!data.name) {
        result.name = data.name;
    }
    if (!!data.projections) {
        result.projections = data.projections;
    }
    if (!!data.location) {
        result.location = data.location;
        result.location.filename = currentFileName;
    }
    return result;
}

export function createStdBool(data: Partial<BoolKeywords>) : BoolKeywords {
    let result: BoolKeywords = new BoolKeywords();
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

export function createClassifierReference(data: Partial<PiElementReference<PiClassifier>>): PiElementReference<PiClassifier> {
    let result: PiElementReference<PiClassifier>;
    if (!!data.name) {
        result = PiElementReference.create<PiClassifier>(data.name, "PiClassifier");
    }
    if (!!data.location) {
        result.location = data.location;
        result.location.filename = currentFileName;
    }
    return result;
}

export function createClassifierProjection(data: Partial<PiEditClassifierProjection>): PiEditClassifierProjection {
    let result: PiEditClassifierProjection;
    if (!!data.tableProjection) {
        result = new PiEditTableProjection();
        (result as PiEditTableProjection).headers = data.tableProjection.headers;
        (result as PiEditTableProjection).cells = data.tableProjection.cells;
    } else {
        result = new PiEditProjection();
        if (!!data.projection) {
            (result as PiEditProjection).lines = data.projection.lines;
        }
        console.log("createClassifierProjection\n\t" + result.toString());
    }
    if (!!data.classifier) {
        result.classifier = data.classifier;
    }
    if (!!data.classifierInfo) {
        result.classifierInfo = data.classifierInfo;
    }
    if (!!data.location) {
        result.location = data.location;
        result.location.filename = currentFileName;
    }
    // console.log("createClassifierProjection\n\t" + result.toString());
    return result;
}

export function createClassifierInfo(data: Partial<ExtraClassifierInfo>): ExtraClassifierInfo {
    let result: ExtraClassifierInfo = new ExtraClassifierInfo();
    if (!!data.trigger) {
        result.trigger = data.trigger;
    }
    if (!!data.referenceShortcut) {
        result.referenceShortcut = data.referenceShortcut;
    }
    if (!!data.symbol) {
        result.symbol = data.symbol;
    }
    if (!!data.location) {
        result.location = data.location;
        result.location.filename = currentFileName;
    }
    return result;
}

export function createProjection(data: Partial<PiEditProjection>): PiEditProjection {
    const result = new PiEditProjection();
    if (!!data.name) {
        result.name = data.name;
    } else {
        // create default
        result.name = "normal";
    }
    if (!!data.lines) {
        result.lines = data.lines;
        // Now cleanup the parsed projection
        // TODO
        // PiEditProjectionUtil.normalize(result);
    }
    if (!!data.location) {
        result.location = data.location;
        result.location.filename = currentFileName;
    }
    console.log("createProjection \n\t" + result.toString());
    return result;
}

export function createTableProjection(data: Partial<PiEditTableProjection>): PiEditTableProjection {
    const result = new PiEditTableProjection();
    if (!!data.name) {
        result.name = data.name;
    } else {
        // create default name
        result.name = "table";
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

export function createLine(data: Partial<PiEditProjectionLine>): PiEditProjectionLine {
    // console.log("Create LINE " + JSON.stringify(data));
    const result = new PiEditProjectionLine();
    if (!!data.items) {
        result.items = data.items;
    }
    if (!!data.location) {
        result.location = data.location;
        result.location.filename = currentFileName;
    }
    // console.log("createLine \n\t" + result.toString());
    return result;
}

export function createOptionalProjection(data: Partial<PiOptionalPropertyProjection>): PiOptionalPropertyProjection {
    const result = new PiOptionalPropertyProjection();
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

export function createIndent(data: Partial<PiEditParsedProjectionIndent>): PiEditParsedProjectionIndent {
    // console.log("createIndent <<" + data.indent + ">>");
    const result = new PiEditParsedProjectionIndent();
    if (!!data.indent) {
        result.indent = data.indent;
    }
    if (!!data.location) {
        result.location = data.location;
        result.location.filename = currentFileName;
    }
    return result;
}

export function createTextItem(data: string): PiEditProjectionText {
    const result = new PiEditProjectionText();
    if (!!data) {
        result.text = data;
    }
    return result;
}

export function createPropertyProjection(data: { expression, listInfo, tableDirection, keyword, location }): PiEditPropertyProjection {
    let result; //: PiEditPropertyProjection ;
    if (!!data.listInfo) {
        result = new PiListPropertyProjection();
        result.isTable = false;
        result.listInfo = data.listInfo;
    } else if (!!data.tableDirection) {
        result = new PiListPropertyProjection();
        result.isTable = true;
        result.direction = data.tableDirection;
    } else if (!!data.keyword) {
        result = new PiBooleanPropertyProjection();
        result.info = data.keyword;
    } else {
        result = new PiEditPropertyProjection();
    }
    if (!!data.expression) {
        result.expression = data.expression;
    }
    if (!!data.location) {
        result.location = data.location;
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

export function createListDirection(data: Object): PiEditProjectionDirection {
    const dir = data["direction"];
    if ( dir === "horizontal" || dir === "rows" ) {
        return PiEditProjectionDirection.Horizontal;
    }
    return PiEditProjectionDirection.Vertical;
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

export function createNewline(): PiEditParsedNewline {
    return new PiEditParsedNewline();
}
