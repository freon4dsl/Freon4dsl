import { PiScopeDef, ScopeConceptDef, PiNamespaceAddition, PiAlternativeScope } from "../metalanguage";
import { PiLogger } from "../../../../core/src/util/PiLogging";

const LOGGER = new PiLogger("ScoperCreator").mute();

export function createScopeDef(data: Partial<PiScopeDef>): PiScopeDef {
    LOGGER.log("createScopeDef");
    const result = new PiScopeDef();

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

export function createNamespaceDef(data: Partial<PiNamespaceAddition>): PiNamespaceAddition {
    LOGGER.log("createNamespaceDef");
    const result = new PiNamespaceAddition();
    if (!!data.expressions) { result.expressions = data.expressions; }
    if (!!data.location) { result.location = data.location; }
    return result;
}

export function createAlternativeScope(data: Partial<PiAlternativeScope>): PiAlternativeScope {
    LOGGER.log("createAlternativeScope");
    const result = new PiAlternativeScope();
    if (!!data.expression) { result.expression = data.expression; }
    if (!!data.location) { result.location = data.location; }
    return result;
}
