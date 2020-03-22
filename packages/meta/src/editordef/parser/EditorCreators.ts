import { PiConceptEditor } from "../metalanguage/PiConceptEditor";
import { PiEnumerationEditor } from "../metalanguage/PiEnumerationEditor";
import { PiLanguageEditor } from "../metalanguage/PiLanguageEditor";
import {
    PiProjectionIndent, PiProjectionLine,
    PiProjectionPropertyReference,
    PiProjectionTemplate,
    PiProjectionText
} from "../metalanguage/PiProjectionTemplate";
import { PiLangConceptReference } from "../../languagedef/metalanguage/PiLangReferences";

// Functions used to create instances of the language classes from the parsed data objects.

export function createConceptReference(data: Partial<PiLangConceptReference>): PiLangConceptReference {
    const result = new PiLangConceptReference();
    if(!!data.name) { result.name = data.name; }
    return result;
}

export function createConceptEditor(data: Partial<PiConceptEditor>): PiConceptEditor {
    // console.log("creating concept " + data.name);
    const result = new PiConceptEditor();

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

export function createLanguageEditor(data: Partial<PiLanguageEditor>): PiLanguageEditor {
    const result = new PiLanguageEditor();
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

export function createProjection(data: Partial<PiProjectionTemplate>): PiProjectionTemplate {
    console.log("PROJECTION "+ JSON.stringify(data));
    const result = new PiProjectionTemplate();
    if( !!data.lines ){ result.lines = data.lines; }
    return result;
}

export function createLine(data: Partial<PiProjectionLine>): PiProjectionLine {
    console.log("LINE "+ JSON.stringify(data));
    const result = new PiProjectionLine();
    if( !!data.items  ){ result.items = data.items; }
    return result;
}

export function createIndent(data: Partial<PiProjectionIndent>): PiProjectionIndent {
    console.log("createIndent <<" + data.indent + ">>");
    const result = new PiProjectionIndent();
    if( !!data.indent ){ result.indent = data.indent; }
    return result;
}

export function createText(data: string): PiProjectionText {
    console.log("typeof data is "+ typeof(data));
    const a : string = data;
    console.log(`createText <<${a}>>`);
    const result = new PiProjectionText();
    if( !!data ){ result.text = data; }
    return result;
}

export function createPropertyRef(data: Partial<PiProjectionPropertyReference>): PiProjectionPropertyReference {
    console.log("createIPropertyRef <<" + data.propertyName + ">>");
    const result = new PiProjectionPropertyReference();
    if( !!data.propertyName ){ result.propertyName = data.propertyName; }
    return result;
}

export function createEnumeration(data: Partial<PiEnumerationEditor>): PiEnumerationEditor {
    const result = new PiEnumerationEditor();
    return result;
}


