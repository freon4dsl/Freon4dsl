import { PiLangConceptReference } from "../../languagedef/metalanguage/PiLangReferences";
import {
    PiDefEditorConcept,
    PiDefEditorEnumeration,
    PiDefEditorLanguage,
    PiDefEditorProjection,
    PiDefEditorProjectionIndent,
    PiDefEditorProjectionLine,
    PiDefEditorProjectionPropertyReference,
    PiDefEditorProjectionText
} from "../metalanguage";
import { PiLogger } from "../../../../core/src/util/PiLogging";

const LOGGER = new PiLogger("EditorCreators").mute();
// Functions used to create instances of the language classes from the parsed data objects.

export function createConceptReference(data: Partial<PiLangConceptReference>): PiLangConceptReference {
    const result = new PiLangConceptReference();
    if(!!data.name) { result.name = data.name; }
    return result;
}

export function createConceptEditor(data: Partial<PiDefEditorConcept>): PiDefEditorConcept {
    // LOGGER.log("creating concept " + data.name);
    const result = new PiDefEditorConcept();

    result.isExpression = !!data.isExpression;
    result.isBinaryExpression = !!data.isBinaryExpression;
    result.isExpressionPlaceHolder = !!data.isExpressionPlaceHolder; 

    if(!!data.priority) { result.priority = data.priority; }
    if( !!data.trigger ){ result.trigger = data.trigger; }
    if( !!data.symbol ){ result.symbol = data.symbol; }
    if( !!data.priority ){ result.priority = data.priority; }
    if( !!data.projection  ){ result.projection = data.projection; }

    return result;
}

export function createLanguageEditor(data: Partial<PiDefEditorLanguage>): PiDefEditorLanguage {
    const result = new PiDefEditorLanguage();
    if( !!data.name) {
        result.name = data.name
    }
    if( !!data.concepts) {
        result.concepts = data.concepts
    }
    if( !!data.enumerations) {
        result.enumerations = data.enumerations
    }

    // Ensure all references to the language are set.
    result.concepts.forEach(concept => {
        concept.languageEditor = result;
    } );
    result.enumerations.forEach(enumeration => {
        enumeration.languageEditor = result;
    } );
    return result;

}

export function createProjection(data: Partial<PiDefEditorProjection>): PiDefEditorProjection {
    LOGGER.log("PROJECTION "+ JSON.stringify(data));
    const result = new PiDefEditorProjection();
    if( !!data.lines ){ result.lines = data.lines; }
    return result;
}

export function createLine(data: Partial<PiDefEditorProjectionLine>): PiDefEditorProjectionLine {
    LOGGER.log("LINE "+ JSON.stringify(data));
    const result = new PiDefEditorProjectionLine();
    if( !!data.items  ){ result.items = data.items; }
    return result;
}

export function createIndent(data: Partial<PiDefEditorProjectionIndent>): PiDefEditorProjectionIndent {
    LOGGER.log("createIndent <<" + data.indent + ">>");
    const result = new PiDefEditorProjectionIndent();
    if( !!data.indent ){ result.indent = data.indent; }
    return result;
}

export function createText(data: string): PiDefEditorProjectionText {
    LOGGER.log("typeof data is "+ typeof(data));
    const a : string = data;
    LOGGER.log(`createText <<${a}>>`);
    const result = new PiDefEditorProjectionText();
    if( !!data ){ result.text = data; }
    return result;
}

export function createPropertyRef(data: Partial<PiDefEditorProjectionPropertyReference>): PiDefEditorProjectionPropertyReference {
    LOGGER.log("createIPropertyRef <<" + data.propertyName + ">>");
    const result = new PiDefEditorProjectionPropertyReference();
    if( !!data.propertyName ){ result.propertyName = data.propertyName; }
    return result;
}

export function createEnumeration(data: Partial<PiDefEditorEnumeration>): PiDefEditorEnumeration {
    const result = new PiDefEditorEnumeration();
    return result;
}


