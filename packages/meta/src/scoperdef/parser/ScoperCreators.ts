import {
    ScopeDef,
    ScopeConceptDef,
    FreNamespaceAddition,
    FreReplacementNamespace,
    FreNamespaceExpression
} from '../metalanguage/index.js';
import { MetaLogger } from "../../utils/no-dependencies/index.js";

const LOGGER = new MetaLogger("ScoperCreator").mute();

let currentFileName: string = "SOME_FILENAME";
export function setCurrentFileName(newName: string) {
    currentFileName = newName;
}

export function createScopeDef(data: Partial<ScopeDef>): ScopeDef {
    LOGGER.log("createScopeDef");
    const result = new ScopeDef();

    if (!!data.languageName) {
        result.languageName = data.languageName;
    }
    if (!!data.parsedNamespaces) {
        result.parsedNamespaces = data.parsedNamespaces;
    }
    if (!!data.scopeConceptDefs) {
        result.scopeConceptDefs = data.scopeConceptDefs;
    }
    if (!!data.location) {
        result.location = data.location;
        result.location.filename = currentFileName;
    }
    return result;
}

export function createScoperConceptDef(data: Partial<ScopeConceptDef>): ScopeConceptDef {
    LOGGER.log("createScoperConceptDef");
    const result = new ScopeConceptDef();
    if (!!data.classifierRef) {
        result.classifierRef = data.classifierRef;
    }
    if (!!data.namespaceAddition) {
        result.namespaceAddition = data.namespaceAddition;
    }
    if (!!data.namespaceReplacement) {
        result.namespaceReplacement = data.namespaceReplacement;
    }
    if (!!data.location) {
        result.location = data.location;
        result.location.filename = currentFileName;
    }
    return result;
}

export function createNamespaceAddition(data: Partial<FreNamespaceAddition>): FreNamespaceAddition {
    LOGGER.log("createNamespaceAddition");
    const result = new FreNamespaceAddition();
    if (!!data.expressions) {
        result.expressions = data.expressions;
    }
    if (!!data.location) {
        result.location = data.location;
        result.location.filename = currentFileName;
    }
    return result;
}

export function createNamespaceReplacement(data: Partial<FreReplacementNamespace>): FreReplacementNamespace {
    LOGGER.log("createNamespaceReplacement");
    const result = new FreReplacementNamespace();
    if (!!data.expressions) {
        result.expressions = data.expressions;
    }
    if (!!data.location) {
        result.location = data.location;
        result.location.filename = currentFileName;
    }
    return result;
}

export function createNamespaceExpression(data: Partial<FreNamespaceExpression>): FreNamespaceExpression {
    LOGGER.log("createNamespaceExpression");
    const result = new FreNamespaceExpression();
    if (!!data.expression) {
        result.expression = data.expression;
    }
    if (!!data.recursive) {
        result.recursive = data.recursive;
    }
    if (!!data.location) {
        result.location = data.location;
        result.location.filename = currentFileName;
    }
    return result;
}
