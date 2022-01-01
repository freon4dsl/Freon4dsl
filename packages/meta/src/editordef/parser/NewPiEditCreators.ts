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
    PiEditTableProjection, PiEditProjectionGroup,
    BoolKeywords, PiEditClassifierProjection, ExtraClassifierInfo
} from "../metalanguage/NewPiEditDefLang";
import { MetaLogger } from "../../utils/MetaLogger";
import { PiConcept } from "../../languagedef/metalanguage";
import { PiEditProjectionUtil } from "../metalanguage/PiEditProjectionUtil";
// The next import should be separate and the last of the imports.
// Otherwise, the run-time error 'Cannot read property 'create' of undefined' occurs.
// See: https://stackoverflow.com/questions/48123645/error-when-accessing-static-properties-when-services-include-each-other
// and: https://stackoverflow.com/questions/45986547/property-undefined-typescript
import { PiElementReference } from "../../languagedef/metalanguage/PiElementReference";
import { ParseLocation } from "../../utils";

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

export function createConceptReference(data: Partial<PiElementReference<PiConcept>>): PiElementReference<PiConcept> {
    let result: PiElementReference<PiConcept>;
    if (!!data.name) {
        result = PiElementReference.create<PiConcept>(data.name, "PiConcept");
    }
    if (!!data.location) {
        result.location = data.location;
        result.location.filename = currentFileName;
    }
    return result;
}

export function createClassifierProjection(data: Partial<PiEditClassifierProjection>): PiEditClassifierProjection {
    const result = new PiEditProjection();
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

// export function createLanguageEditor(data: {name, conceptEditors, languageName, location}): PiEditUnit {
//     const result = new PiEditUnit();
//     if (!!data.name) {
//         result.name = data.name;
//     }
//     if (!!data.conceptEditors) {
//         result.conceptEditors = data.conceptEditors;
//     }
//     if (!!data.languageName) {
//         result.languageName = data.languageName;
//     }
//
//     // Ensure all internal editor references to the editorlanguage are set.
//     result.conceptEditors.forEach(concept => {
//         concept.languageEditor = result;
//     });
//     if (!!data.location) {
//         result.location = data.location;
//         result.location.filename = currentFileName;
//     }
//     return result;
// }

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
    return result;
}

// export function createSubProjection(data: Partial<PiEditSubProjection>): PiEditSubProjection {
//     // console.log("Create SUBPROJECTION ");// + JSON.stringify(data));
//     const result = new PiEditSubProjection();
//     if (!!data.optional) {
//         result.optional = data.optional;
//     }
//     if (!!data.items) {
//         result.items = data.items;
//     }
//     if (!!data.location) {
//         result.location = data.location;
//         result.location.filename = currentFileName;
//     }
//     return result;
// }

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

export function createText(data: string): PiEditProjectionText {
    const result = new PiEditProjectionText();
    if (!!data) {
        result.text = data;
    }
    // if (!!data.location) { result.location = data.location;         result.location.filename = currentFileName;}
    return result;
}

// export function createPropertyProjection(data: Partial<PiEditPropertyProjection>): PiEditPropertyProjection {
//     // console.log("create SubProjection <<" + data.propertyName + ">> join [" + data.listInfo + "]");
//     const result = new PiEditPropertyProjection();
//     // if (!!data.propertyName) {
//     //     result.propertyName = data.propertyName;
//     // }
//     if (!!data.listInfo) {
//         result.listInfo = data.listInfo;
//     }
//     if (!!data.tableInfo) {
//         result.tableInfo = data.tableInfo;
//     }
//     if (!!data.keyword) {
//         result.keyword = data.keyword;
//     }
//     if (!!data.expression) {
//         result.expression = data.expression;
//     }
//     if (!!data.location) {
//         result.location = data.location;
//         result.location.filename = currentFileName;
//     }
//     return result;
// }

export function createListDirection(data: Object): PiEditProjectionDirection {
    const dir = data["direction"];
    return dir === "@horizontal" ? PiEditProjectionDirection.Horizontal : dir === "@vertical" ? PiEditProjectionDirection.Vertical : PiEditProjectionDirection.NONE;
}

// export function createTableInfo(data: Object): TableInfo {
//     const result = new TableInfo();
//     const dir = data["direction"];
//     result.direction = dir === "@rows" ? PiEditProjectionDirection.Horizontal : dir === "@columns" ? PiEditProjectionDirection.Vertical : PiEditProjectionDirection.NONE;
//     if (!!data["location"]) {
//         result.location = data["location"];
//         result.location.filename = currentFileName;
//     }
//     return result;
// }

// export function createJoinType(data: Object): ListInfoType {
//     const type = data["type"];
//
//     return type === "@separator" ? ListInfoType.Separator : type === "@terminator" ? ListInfoType.Terminator : ListInfoType.NONE;
// }
//
// export function createListInfo(data: Partial<ListInfo>): ListInfo {
//     const result = new ListInfo();
//     if (!!data.direction) {
//         result.direction = data.direction;
//     }
//     if (!!data.joinType) {
//         result.joinType = data.joinType;
//     }
//     if (!!data.joinText) {
//         result.joinText = data.joinText;
//     }
//     if (!!data.location) {
//         result.location = data.location;
//         result.location.filename = currentFileName;
//     }
//     return result;
// }

export function createNewline(): PiEditParsedNewline {
    return new PiEditParsedNewline();
}
