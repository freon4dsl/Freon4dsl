import { PiDefinitionElement } from "../../utils";
import { PiClassifier, PiLanguage, PiLangElement, PiLangExp } from "../../languagedef/metalanguage";
// The next import should be separate and the last of the imports.
// Otherwise, the run-time error 'Cannot read property 'create' of undefined' occurs.
// See: https://stackoverflow.com/questions/48123645/error-when-accessing-static-properties-when-services-include-each-other
// and: https://stackoverflow.com/questions/45986547/property-undefined-typescript
import { PiElementReference } from "../../languagedef/metalanguage/PiElementReference";

export class PiTypeDefinition extends PiDefinitionElement {
    name: string;
    languageName: string;
    language: PiLanguage;
    typerRules: PiTypeRule[];
    classifierRules: PiTypeClassifierRule[] = [];
    typeroot: PiElementReference<PiClassifier>;
    types: PiElementReference<PiClassifier>[] = [];
}

export abstract class PiTypeRule extends PiDefinitionElement {
    toPiString(): string {
        return "SHOULD BE IMPLEMENTED BY SUBCLASSES OF 'PiTyperDefLang.PiTypeRule'";
    }
}
export class PiTypeIsTypeRule extends PiTypeRule {
    types: PiElementReference<PiClassifier>[] = [];

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

export class PiTypeClassifierRule extends PiTypeRule {
    conceptRef: PiElementReference<PiClassifier>;
    statements: PiTypeStatement[] = [];

    toPiString(): string {
        return `${this.conceptRef.name} { ${this.statements.map( t => t.toPiString() ).join("\n")} }`;
    }
}

export class PiTypeStatement extends PiDefinitionElement {
    statementtype: string;
    exp: PiLangExp;
    isAbstract: boolean;

    toPiString(): string {
        return `${this.isAbstract ? `abstract ` : ``}${this.statementtype} ${this.exp?.toPiString()}`;
    }
}
