import { PiLangExp } from "../../languagedef/metalanguage/PiLangExpressions";
import { ParseLocation } from "../../utils";
import { PiConcept, PiLanguageUnit } from "../../languagedef/metalanguage/PiLanguage";
import { PiLangElement } from "../../languagedef/metalanguage/PiLanguage";
// The next import should be separate and the last of the imports.
// Otherwise, the run-time error 'Cannot read property 'create' of undefined' occurs.
// See: https://stackoverflow.com/questions/48123645/error-when-accessing-static-properties-when-services-include-each-other
// and: https://stackoverflow.com/questions/45986547/property-undefined-typescript
import { PiElementReference } from "../../languagedef/metalanguage/PiElementReference";

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

