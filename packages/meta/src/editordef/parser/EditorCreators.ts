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

// Functions used to create instances of the language classes from the parsed data objects.

export function createConceptReference(data: Partial<PiLangConceptReference>): PiLangConceptReference {
    const result = new PiLangConceptReference();
    if(!!data.name) { result.name = data.name; }
    return result;
}

export function createConceptEditor(data: Partial<PiDefEditorConcept>): PiDefEditorConcept {
    // console.log("creating concept " + data.name);
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
    console.log("PROJECTION "+ JSON.stringify(data));
    const result = new PiDefEditorProjection();
    if( !!data.lines ){ result.lines = data.lines; }
    return result;
}

export function createLine(data: Partial<PiDefEditorProjectionLine>): PiDefEditorProjectionLine {
    console.log("LINE "+ JSON.stringify(data));
    const result = new PiDefEditorProjectionLine();
    if( !!data.items  ){ result.items = data.items; }
    return result;
}

export function createIndent(data: Partial<PiDefEditorProjectionIndent>): PiDefEditorProjectionIndent {
    console.log("createIndent <<" + data.indent + ">>");
    const result = new PiDefEditorProjectionIndent();
    if( !!data.indent ){ result.indent = data.indent; }
    return result;
}

export function createText(data: string): PiDefEditorProjectionText {
    console.log("typeof data is "+ typeof(data));
    const a : string = data;
    console.log(`createText <<${a}>>`);
    const result = new PiDefEditorProjectionText();
    if( !!data ){ result.text = data; }
    return result;
}

export function createPropertyRef(data: Partial<PiDefEditorProjectionPropertyReference>): PiDefEditorProjectionPropertyReference {
    console.log("createIPropertyRef <<" + data.propertyName + ">>");
    const result = new PiDefEditorProjectionPropertyReference();
    if( !!data.propertyName ){ result.propertyName = data.propertyName; }
    return result;
}

export function createEnumeration(data: Partial<PiDefEditorEnumeration>): PiDefEditorEnumeration {
    const result = new PiDefEditorEnumeration();
    return result;
}


