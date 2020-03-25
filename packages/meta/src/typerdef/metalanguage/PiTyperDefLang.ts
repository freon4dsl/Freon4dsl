import { PiLangConceptReference } from "../../languagedef/metalanguage/PiLangReferences";
import { PiLangExp } from "../../languagedef/metalanguage/PiLangExpressions";

export class PiTypeDefinition {
    name: string;
    languageName: string;
    typerRules: PiTypeRule[];
    typeroot: PiLangConceptReference;

    constructor() { 
    }
}

export abstract class PiTypeRule {   
    toPiString() : string {
        return "SHOULD BE IMPLEMENTED BY SUBCLASSES OF 'PiTyperDefLang.PiTypeRule'";
    }
}
export class PiTypeIsTypeRule extends PiTypeRule {
    types: PiLangConceptReference[] = [];

    toPiString(): string {
        return `@isType { ${this.types.map( t => t.name ).join(", ")} }`;
    }
}

export class PiTypeAnyTypeRule extends PiTypeRule {
    statements: PiTypeStatement[] = [];

    toPiString(): string {
        return `@anyType { ${this.statements.map( t => t.toPiString() ).join("\n")} }`;
    }
}

export class PiTypeConceptRule extends PiTypeRule {
    conceptRef: PiLangConceptReference;
    statements: PiTypeStatement[] = [];

    toPiString(): string {
        return `${this.conceptRef.name} { ${this.statements.map( t => t.toPiString() ).join("\n")} }`;
    }
}

export class PiTypeStatement {
    statementtype: string;
    exp: PiLangExp;
    isAbstract: boolean;

    toPiString(): string {
        return `${this.isAbstract? `abstract ` : ``}@${this.statementtype} ${this.exp?.toPiString()}`;
    }
}

