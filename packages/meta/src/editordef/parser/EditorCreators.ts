import { PiLangConceptReference } from "../../languagedef/metalanguage";
import {
    Direction, ListJoin,
    ListJoinType,
    DefEditorConcept,
    DefEditorEnumeration,
    DefEditorLanguage, DefEditorNewline,
    DefEditorProjection, DefEditorProjectionExpression,
    DefEditorProjectionIndent,
    MetaEditorProjectionLine,
    DefEditorProjectionText, DefEditorSubProjection
} from "../metalanguage";
import { PiLogger } from "../../../../core/src/util/PiLogging";

const LOGGER = new PiLogger("EditorCreators").mute();
// Functions used to create instances of the language classes from the parsed data objects.
// This is used as a bridge between JavaScript in the Pegjs parser and typescript

export function createConceptReference(data: Partial<PiLangConceptReference>): PiLangConceptReference {
    const result = new PiLangConceptReference();
    if (!!data.name) {
        result.name = data.name;
    }
    return result;
}

export function createConceptEditor(data: Partial<DefEditorConcept>): DefEditorConcept {
    // console.log("creating concept " + data.name);
    const result = new DefEditorConcept();

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

    return result;
}

export function createLanguageEditor(data: Partial<DefEditorLanguage>): DefEditorLanguage {
    const result = new DefEditorLanguage();
    if (!!data.name) {
        result.name = data.name;
    }
    if (!!data.conceptEditors) {
        result.conceptEditors = data.conceptEditors;
    }
    if (!!data.enumerations) {
        result.enumerations = data.enumerations;
    }

    // Ensure all internal editor references to the editorlanguage are set.
    result.conceptEditors.forEach(concept => {
        concept.languageEditor = result;

    });
    result.enumerations.forEach(enumeration => {
        enumeration.languageEditor = result;
    });
    return result;

}

export function createProjection(data: Partial<DefEditorProjection>): DefEditorProjection {
    const result = new DefEditorProjection();
    if (!!data.lines) {
        result.lines = data.lines;
    }
    if (!!data.name) {
        result.name = data.name;
    }
    console.log(result.toString());
    return result;
}

export function createLine(data: Partial<MetaEditorProjectionLine>): MetaEditorProjectionLine {
    // console.log("Create LINE " + JSON.stringify(data));
    const result = new MetaEditorProjectionLine();
    if (!!data.items) {
        result.items = data.items;
    }
    return result;
}

export function createIndent(data: Partial<DefEditorProjectionIndent>): DefEditorProjectionIndent {
    // console.log("createIndent <<" + data.indent + ">>");
    const result = new DefEditorProjectionIndent();
    if (!!data.indent) {
        result.indent = data.indent;
    }
    return result;
}

export function createText(data: string): DefEditorProjectionText {
    const result = new DefEditorProjectionText();
    if (!!data) {
        result.text = data;
    }
    return result;
}

export function createSubProjection(data: Partial<DefEditorSubProjection>): DefEditorSubProjection {
    // console.log("create SubProjection <<" + data.propertyName + ">> join ["+ data.listJoin + "]");
    const result = new DefEditorSubProjection();
    if (!!data.propertyName) {
        result.propertyName = data.propertyName;
    }
    if (!!(data.listJoin)) {
        result.listJoin = data.listJoin;
    }
    return result;
}

export function createListDirection(data: Object): Direction {
    const dir = data["direction"];
    return (dir === "@horizontal" ? Direction.Horizontal : (dir === "@vertical" ? Direction.Vertical : Direction.NONE));
}

export function createJoinType(data: Object): ListJoinType {
    const type = data["type"];

    return (type === "@separator" ? ListJoinType.Separator : (type === "@terminator" ? ListJoinType.Terminator : ListJoinType.NONE));
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
    return result;
}

export function createExpression(data: Partial<DefEditorProjectionExpression>): DefEditorProjectionExpression {
    // console.log("createExpression <<" + data.propertyName + ">>");
    const result = new DefEditorProjectionExpression();
    if (!!data.propertyName) {
        result.propertyName = data.propertyName;
    }
    return result;
}

export function createNewline(): DefEditorNewline {
    return new DefEditorNewline();
}

export function createEnumeration(data: Partial<DefEditorEnumeration>): DefEditorEnumeration {
    const result = new DefEditorEnumeration();
    return result;
}


