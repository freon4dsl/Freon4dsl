import { ScopeDef, ScopeConceptDef, FreNamespaceAddition, FreAlternativeScope } from "../metalanguage";
import { MetaLogger } from "../../utils/MetaLogger";

const LOGGER = new MetaLogger("ScoperCreator").mute();

// let currentFileName: string = "SOME_FILENAME";
// export function setCurrentFileName(newName: string) {
//     currentFileName = newName;
// }

export function createScopeDef(data: Partial<ScopeDef>): ScopeDef {
    LOGGER.log("createScopeDef");
    const result = new ScopeDef();

    if (!!data.scoperName) {
        result.scoperName = data.scoperName;
    }
    if (!!data.languageName) {
        result.languageName = data.languageName;
    }
    if (!!data.namespaces) {
        result.namespaces = data.namespaces;
    }
    if (!!data.scopeConceptDefs) {
        result.scopeConceptDefs = data.scopeConceptDefs;
    }
    if (!!data.location) { result.location = data.location; }
    // result.namespaces.forEach(ns => {
    //     LOGGER.log("namespace: " + ns.unitName + " created");
    // });
    return result;
}

export function createScoperConceptDef(data: Partial<ScopeConceptDef>): ScopeConceptDef {
    LOGGER.log("createScoperConceptDef");
    const result = new ScopeConceptDef();
    if (!!data.conceptRef) { result.conceptRef = data.conceptRef; }
    if (!!data.namespaceAdditions) { result.namespaceAdditions = data.namespaceAdditions; }
    if (!!data.alternativeScope) { result.alternativeScope = data.alternativeScope; }
    if (!!data.location) { result.location = data.location; }
    return result;
}

export function createNamespaceDef(data: Partial<FreNamespaceAddition>): FreNamespaceAddition {
    LOGGER.log("createNamespaceDef");
    const result = new FreNamespaceAddition();
    if (!!data.expressions) { result.expressions = data.expressions; }
    if (!!data.location) { result.location = data.location; }
    return result;
}

export function createAlternativeScope(data: Partial<FreAlternativeScope>): FreAlternativeScope {
    LOGGER.log("createAlternativeScope");
    const result = new FreAlternativeScope();
    if (!!data.expression) { result.expression = data.expression; }
    if (!!data.location) { result.location = data.location; }
    return result;
}
