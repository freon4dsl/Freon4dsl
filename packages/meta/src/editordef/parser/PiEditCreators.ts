import {
    PiEditProjectionDirection,
    ListJoin,
    ListJoinType,
    PiEditConcept,
    PiEditUnit,
    PiEditParsedNewline,
    PiEditProjection,
    PiEditParsedProjectionIndent,
    PiEditProjectionLine,
    PiEditProjectionText,
    PiEditPropertyProjection, PiEditSubProjection
} from "../metalanguage";
import { PiLogger } from "../../../../core/src/util/PiLogging";
import { PiConcept } from "../../languagedef/metalanguage";
// The next import should be separate and the last of the imports.
// Otherwise, the run-time error 'Cannot read property 'create' of undefined' occurs.
// See: https://stackoverflow.com/questions/48123645/error-when-accessing-static-properties-when-services-include-each-other
// and: https://stackoverflow.com/questions/45986547/property-undefined-typescript
import { PiElementReference } from "../../languagedef/metalanguage/PiElementReference";
import { PiEditProjectionUtil } from "../metalanguage/PiEditProjectionUtil";

const LOGGER = new PiLogger("EditorCreators").mute();

// Functions used to create instances of the language classes from the parsed data objects.
// This is used as a bridge between JavaScript in the Pegjs parser and typescript

export function createConceptReference(data: Partial<PiElementReference<PiConcept>>): PiElementReference<PiConcept> {
    let result: PiElementReference<PiConcept>;
    if (!!data.name) {
        result = PiElementReference.createNamed<PiConcept>(data.name, "PiConcept");
    }
    if (!!data.location) {
        result.location = data.location;
    }
    return result;
}

export function createConceptEditor(data: Partial<PiEditConcept>): PiEditConcept {
    // console.log("creating concept " + data.unitName);
    const result = new PiEditConcept();

    if (!!data.trigger) {
        result.trigger = data.trigger;
    }
    if (!!data.symbol) {
        result.symbol = data.symbol;
    }
    if (!!data.projection) {
        result.projection = data.projection;
    }
    if (!!data.concept) {
        result.concept = data.concept;
    }
    if (!!data.location) {
        result.location = data.location;
    }
    return result;
}

export function createLanguageEditor(data: Partial<PiEditUnit>): PiEditUnit {
    const result = new PiEditUnit();
    if (!!data.name) {
        result.name = data.name;
    }
    if (!!data.conceptEditors) {
        result.conceptEditors = data.conceptEditors;
    }
    // if (!!data.enumerations) {
    //     result.enumerations = data.enumerations;
    // }
    if (!!data.languageName) {
        result.languageName = data.languageName;
    }

    // Ensure all internal editor references to the editorlanguage are set.
    result.conceptEditors.forEach(concept => {
        concept.languageEditor = result;
    });
    if (!!data.location) {
        result.location = data.location;
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
        PiEditProjectionUtil.normalize(result);
    }
    if (!!data.location) {
        result.location = data.location;
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
    }
    return result;
}

export function createSubProjection(data: Partial<PiEditSubProjection>): PiEditSubProjection {
    // console.log("Create SUBPROJECTION ");// + JSON.stringify(data));
    const result = new PiEditSubProjection();
    if (!!data.optional) {
        result.optional = data.optional;
    }
    if (!!data.items) {
        result.items = data.items;
    }
    if (!!data.location) {
        result.location = data.location;
    }
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
    }
    return result;
}

export function createText(data: string): PiEditProjectionText {
    const result = new PiEditProjectionText();
    if (!!data) {
        result.text = data;
    }
    // if (!!data.location) { result.location = data.location; }
    return result;
}

export function createPropertyProjection(data: Partial<PiEditPropertyProjection>): PiEditPropertyProjection {
    // console.log("create SubProjection <<" + data.propertyName + ">> join [" + data.listJoin + "]");
    const result = new PiEditPropertyProjection();
    if (!!data.propertyName) {
        result.propertyName = data.propertyName;
    }
    if (!!data.listJoin) {
        result.listJoin = data.listJoin;
    }
    if (!!data.keyword) {
        result.keyword = data.keyword;
    }
    if (!!data.expression) {
        result.expression = data.expression;
    }
    if (!!data.location) {
        result.location = data.location;
    }
    return result;
}

export function createListDirection(data: Object): PiEditProjectionDirection {
    const dir = data["direction"];
    return dir === "@horizontal" ? PiEditProjectionDirection.Horizontal : dir === "@vertical" ? PiEditProjectionDirection.Vertical : PiEditProjectionDirection.NONE;
}

export function createJoinType(data: Object): ListJoinType {
    const type = data["type"];

    return type === "@separator" ? ListJoinType.Separator : type === "@terminator" ? ListJoinType.Terminator : ListJoinType.NONE;
}

export function createListJoin(data: Partial<ListJoin>): ListJoin {
    const result = new ListJoin();
    if (!!data.direction) {
        result.direction = data.direction;
    }
    if (!!data.joinType) {
        result.joinType = data.joinType;
    }
    if (!!data.joinText) {
        result.joinText = data.joinText;
    }
    if (!!data.location) {
        result.location = data.location;
    }
    return result;
}

export function createNewline(): PiEditParsedNewline {
    return new PiEditParsedNewline();
}
