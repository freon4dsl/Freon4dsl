import { PiLangExp } from "../../languagedef/metalanguage/PiLangExpressions";
import { ParseLocation } from "../../utils";
import { PiConcept, PiElementReference } from "../../languagedef/metalanguage";

export class PiTypeDefinition {
    location: ParseLocation;
    name: string;
    languageName: string;
    typerRules: PiTypeRule[];
    conceptRules: PiTypeConceptRule[];
    typeroot: PiElementReference<PiConcept>;

    constructor() { 
    }
}

export abstract class PiTypeRule {
    location: ParseLocation;
    toPiString() : string {
        return "SHOULD BE IMPLEMENTED BY SUBCLASSES OF 'PiTyperDefLang.PiTypeRule'";
    }
}
export class PiTypeIsTypeRule extends PiTypeRule {
    types: PiElementReference<PiConcept>[] = [];

    toPiString(): string {
        return `isType { ${this.types.map( t => t.name ).join(", ")} }`;
    }
}

export class PiTypeAnyTypeRule extends PiTypeRule {
    statements: PiTypeStatement[] = [];

    toPiString(): string {
        return `anyType { ${this.statements.map( t => t.toPiString() ).join("\n")} }`;
    }
}

export class PiTypeConceptRule extends PiTypeRule {
    conceptRef: PiElementReference<PiConcept>;
    statements: PiTypeStatement[] = [];

    toPiString(): string {
        return `${this.conceptRef.name} { ${this.statements.map( t => t.toPiString() ).join("\n")} }`;
    }
}

export class PiTypeStatement {
    location: ParseLocation;
    statementtype: string;
    exp: PiLangExp;
    isAbstract: boolean;

    toPiString(): string {
        return `${this.isAbstract? `abstract ` : ``}${this.statementtype} ${this.exp?.toPiString()}`;
    }
}

