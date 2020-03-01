import { PiConceptEditor } from "../../metalanguage/editor/PiConceptEditor";
import { PiEnumerationEditor } from "../../metalanguage/editor/PiEnumerationEditor";
import { PiLanguageEditor } from "../../metalanguage/editor/PiLanguageEditor";
import {
    PiProjectionIndent,
    PiProjectionPropertyReference,
    PiProjectionTemplate,
    PiProjectionText
} from "../../metalanguage/editor/PiProjectionTemplate";
import { PiLangPrimitiveProperty, PiLangConcept, PiLangElementProperty, PiLangConceptReference, PiLanguage, PiLangEnumeration } from "../../metalanguage/PiLanguage";

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
    const result = new PiProjectionTemplate();
    if( !!data.lines ){ result.lines = data.lines; }
    return result;
}

export function createIndent(data: Partial<PiProjectionIndent>): PiProjectionIndent {
    const result = new PiProjectionIndent();
    if( !!data.indent ){ result.indent = data.indent; }
    return result;
}

export function createText(data: Partial<PiProjectionText>): PiProjectionText {
    const result = new PiProjectionText();
    if( !!data.text ){ result.text = data.text; }
    return result;
}

export function createIPropertyRef(data: Partial<PiProjectionPropertyReference>): PiProjectionPropertyReference {
    const result = new PiProjectionPropertyReference();
    if( !!data.propertyName ){ result.propertyName = data.propertyName; }
    return result;
}

export function createEnumeration(data: Partial<PiEnumerationEditor>): PiEnumerationEditor {
    const result = new PiEnumerationEditor();
    return result;
}


