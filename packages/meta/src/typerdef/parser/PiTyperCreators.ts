import {  PiTypeDefinition, PiTypeIsTypeRule, PiTypeStatement, PiTypeConceptRule, PiTypeAnyTypeRule } from "../metalanguage/PiTyperDefLang";

// Functions used to create instances of the language classes (in TyperDefLang) from the parsed data objects (from TyperGrammar.pegjs). 

export function createTyperDef(data: Partial<PiTypeDefinition>): PiTypeDefinition {
    const result = new PiTypeDefinition();

    if( !!data.name) {
        result.name = data.name;
    }
    if( !!data.languageName) {
        result.languageName = data.languageName; 
    }
    if( !!data.typerRules) {
        result.typerRules = data.typerRules;
    }

    return result;
}

export function createIsType(data: Partial<PiTypeIsTypeRule>): PiTypeIsTypeRule {
    const result = new PiTypeIsTypeRule();

    if( !!data.types) {
        result.types = data.types;
    }

    return result;
}

export function createAnyTypeRule(data: Partial<PiTypeAnyTypeRule>): PiTypeAnyTypeRule {
    const result = new PiTypeAnyTypeRule();

    if( !!data.statements) {
        result.statements = data.statements;
    }

    return result;
}

export function createConceptRule(data: Partial<PiTypeConceptRule>): PiTypeConceptRule {
    const result = new PiTypeConceptRule();

    if( !!data.conceptRef) {
        result.conceptRef = data.conceptRef;
    }
    if( !!data.statements) {
        result.statements = data.statements;
    }

    return result;
}

export function createStatement(data: Partial<PiTypeStatement>) : PiTypeStatement {
    const result = new PiTypeStatement();

    if( !!data.statementtype) {
        result.statementtype = data.statementtype;
    }
    if( !!data.exp) {
        result.exp = data.exp;
    }
    if( !!data.isAbstract) {
        result.isAbstract = data.isAbstract;
    }

    return result;
}

