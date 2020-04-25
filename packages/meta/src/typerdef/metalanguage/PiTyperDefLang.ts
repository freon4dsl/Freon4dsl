import { PiLangExp } from "../../languagedef/metalanguage/PiLangExpressions";
import { ParseLocation } from "../../utils";
import { PiElementReference } from "../../languagedef/metalanguage/PiElementReference";
import { PiConcept, PiLanguageUnit } from "../../languagedef/metalanguage/PiLanguage";
import { PiLangElement } from "../../languagedef/metalanguage/PiLangElement";

export class PiTypeDefinition {
    location: ParseLocation;
    name: string;
    languageName: string;
    language: PiLanguageUnit;
    typerRules: PiTypeRule[];
    conceptRules: PiTypeConceptRule[];
    typeroot: PiElementReference<PiConcept>;

    constructor() { 
    }
}

export abstract class PiTypeRule extends PiLangElement {
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

