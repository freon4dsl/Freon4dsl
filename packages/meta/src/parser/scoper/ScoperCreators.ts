import { PiLangPrimitiveProperty, PiLangConcept, PiLangElementProperty, PiLangConceptReference, PiLanguage, PiLangEnumeration } from "../../metalanguage/PiLanguage";
import { PiScopeDef, PiNamespace } from "../../metalanguage/scoper/PiScopeDefLang";

// Functions used to create instances of the language classes from the parsed data objects.
// TODO change comment

export function createScopeDef(data: Partial<PiScopeDef>): PiScopeDef {
    const result = new PiScopeDef();

    if( !!data.scoperName) {
        result.scoperName = data.scoperName
    }
    if( !!data.languageName) {
        result.languageName = data.languageName
    }
    if( !!data.namespaces) {
        result.namespaces = data.namespaces
    }

    return result;
}

export function createNamespace(data: Partial<PiNamespace>): PiNamespace {
    const result = new PiNamespace();
    if( !!data.conceptRefs) { result.conceptRefs = data.conceptRefs; }
    return result;
}

export function createConceptReference(data: Partial<PiLangConceptReference>): PiLangConceptReference {
    const result = new PiLangConceptReference(); 
    if(!!data.name) { result.name = data.name; }
    return result;
}
