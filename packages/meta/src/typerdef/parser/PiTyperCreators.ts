import { PiTypeDefinition, PiTypeIsTypeRule, PiTypeStatement, PiTypeClassifierRule, PiTypeAnyTypeRule } from "../metalanguage";

// Functions used to create instances of the language classes (in TyperDefLang) from the parsed data objects (from TyperGrammar.pegjs).

export function createTyperDef(data: Partial<PiTypeDefinition>): PiTypeDefinition {
    const result = new PiTypeDefinition();

    if (!!data.name) {
        result.name = data.name;
    }
    if (!!data.languageName) {
        result.languageName = data.languageName;
    }
    if (!!data.typerRules) {
        result.typerRules = data.typerRules;
    }
    if (!!data.location) {
        result.location = data.location;
    }
    return result;
}

export function createIsType(data: Partial<PiTypeIsTypeRule>): PiTypeIsTypeRule {
    const result = new PiTypeIsTypeRule();

    if (!!data.types) {
        result.types = data.types;
        // for (let t of result.types) {
        //     t.owner = result;
        // }
    }
    if (!!data.location) {
        result.location = data.location;
    }
    return result;
}

export function createAnyTypeRule(data: Partial<PiTypeAnyTypeRule>): PiTypeAnyTypeRule {
    const result = new PiTypeAnyTypeRule();

    if (!!data.statements) {
        result.statements = data.statements;
    }
    if (!!data.location) {
        result.location = data.location;
    }
    return result;
}

export function createConceptRule(data: Partial<PiTypeClassifierRule>): PiTypeClassifierRule {
    const result = new PiTypeClassifierRule();

    if (!!data.conceptRef) {
        result.conceptRef = data.conceptRef;
        // result.conceptRef.owner = result;
    }
    if (!!data.statements) {
        result.statements = data.statements;
    }
    if (!!data.location) {
        result.location = data.location;
    }
    return result;
}

export function createStatement(data: Partial<PiTypeStatement>): PiTypeStatement {
    const result = new PiTypeStatement();

    if (!!data.statementtype) {
        result.statementtype = data.statementtype;
    }
    if (!!data.exp) {
        result.exp = data.exp;
    }
    if (!!data.isAbstract) {
        result.isAbstract = data.isAbstract;
    }
    if (!!data.location) {
        result.location = data.location;
    }
    return result;
}
