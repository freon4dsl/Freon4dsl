import { PiLangConceptReference } from "../../languagedef/metalanguage/PiLangReferences";
import {
    Direction, ListJoin,
    ListJoinType,
    PiDefEditorConcept,
    PiDefEditorEnumeration,
    PiDefEditorLanguage, PiDefEditorNewline,
    PiDefEditorProjection, PiDefEditorProjectionExpression,
    PiDefEditorProjectionIndent,
    PiDefEditorProjectionLine,
    PiDefEditorProjectionText, PiDefEditorSubProjection
} from "../metalanguage";

// Functions used to create instances of the language classes from the parsed data objects.

export function createConceptReference(data: Partial<PiLangConceptReference>): PiLangConceptReference {
    const result = new PiLangConceptReference();
    if (!!data.name) {
        result.name = data.name;
    }
    return result;
}

export function createConceptEditor(data: Partial<PiDefEditorConcept>): PiDefEditorConcept {
    // console.log("creating concept " + data.name);
    const result = new PiDefEditorConcept();

    result.isExpression = !!data.isExpression;
    result.isBinaryExpression = !!data.isBinaryExpression;
    result.isExpressionPlaceHolder = !!data.isExpressionPlaceHolder;

    if (!!data.priority) {
        result.priority = data.priority;
    }
    if (!!data.trigger) {
        result.trigger = data.trigger;
    }
    if (!!data.symbol) {
        result.symbol = data.symbol;
    }
    if (!!data.priority) {
        result.priority = data.priority;
    }
    if (!!data.projection) {
        result.projection = data.projection;
    }

    return result;
}

export function createLanguageEditor(data: Partial<PiDefEditorLanguage>): PiDefEditorLanguage {
    const result = new PiDefEditorLanguage();
    if (!!data.name) {
        result.name = data.name;
    }
    if (!!data.concepts) {
        result.concepts = data.concepts;
    }
    if (!!data.enumerations) {
        result.enumerations = data.enumerations;
    }

    // Ensure all references to the language are set.
    result.concepts.forEach(concept => {
        concept.languageEditor = result;
    });
    result.enumerations.forEach(enumeration => {
        enumeration.languageEditor = result;
    });
    return result;

}

export function createProjection(data: Partial<PiDefEditorProjection>): PiDefEditorProjection {
    const result = new PiDefEditorProjection();
    if (!!data.lines) {
        result.lines = data.lines;
    }
    if (!!data.name) {
        result.name = data.name;
    }
    console.log(result.toString());
    return result;
}

export function createLine(data: Partial<PiDefEditorProjectionLine>): PiDefEditorProjectionLine {
    // console.log("Create LINE " + JSON.stringify(data));
    const result = new PiDefEditorProjectionLine();
    if (!!data.items) {
        result.items = data.items;
    }
    return result;
}

export function createIndent(data: Partial<PiDefEditorProjectionIndent>): PiDefEditorProjectionIndent {
    // console.log("createIndent <<" + data.indent + ">>");
    const result = new PiDefEditorProjectionIndent();
    if (!!data.indent) {
        result.indent = data.indent;
    }
    return result;
}

export function createText(data: string): PiDefEditorProjectionText {
    const a: string = data;
    // console.log(`createText <<${a}>>`);
    const result = new PiDefEditorProjectionText();
    if (!!data) {
        result.text = data;
    }
    return result;
}

export function createSubProjection(data: Partial<PiDefEditorSubProjection>): PiDefEditorSubProjection {
    // console.log("create SubProjection <<" + data.propertyName + ">> join ["+ data.listJoin + "]");
    const result = new PiDefEditorSubProjection();
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
    if( !!data.direction) {
        result.direction = data.direction
    }
    if( !!data.joinType) {
        result.joinType = data.joinType
    }
    if( !!data.joinText) {
        result.joinText = data.joinText
    }
    return result;
}


export function createExpression(data: Partial<PiDefEditorProjectionExpression>): PiDefEditorProjectionExpression {
    // console.log("createExpression <<" + data.propertyName + ">>");
    const result = new PiDefEditorProjectionExpression();
    if (!!data.propertyName) {
        result.propertyName = data.propertyName;
    }
    return result;
}

export function createNewline(): PiDefEditorNewline {
    // console.log("createNewline <<>>");
    const result = new PiDefEditorNewline();
    return result;
}

export function createEnumeration(data: Partial<PiDefEditorEnumeration>): PiDefEditorEnumeration {
    const result = new PiDefEditorEnumeration();
    return result;
}


