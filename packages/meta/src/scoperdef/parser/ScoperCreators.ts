import { PiScopeDef, PiNamespace } from "../metalanguage";
import { PiLangConceptReference } from "../../languagedef/metalanguage";

export function createScopeDef(data: Partial<PiScopeDef>): PiScopeDef {
    const result = new PiScopeDef();

    if (!!data.scoperName) {
        result.scoperName = data.scoperName
    }
    if (!!data.languageName) {
        result.languageName = data.languageName
    }
    if (!!data.namespaces) {
        result.namespaces = data.namespaces
    }
    if (!!data.location) { result.location = data.location; }
    return result;
}

export function createNamespace(data: Partial<PiNamespace>): PiNamespace {
    const result = new PiNamespace();
    if (!!data.conceptRefs) { result.conceptRefs = data.conceptRefs; }
    if (!!data.location) { result.location = data.location; }
    return result;
}

export function createConceptReference(data: Partial<PiLangConceptReference>): PiLangConceptReference {
    const result = new PiLangConceptReference(); 
    if (!!data.name) { result.name = data.name; }
    if (!!data.location) { result.location = data.location; }
    return result;
}
