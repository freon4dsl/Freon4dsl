import { PiClassifier, PiElementReference, PiInstance, PiLanguage, PiLimitedConcept, PiProperty } from "../../languagedef/metalanguage";
import { PiDefinitionElement } from "../../utils";

export enum PiTypeStatementKind {
    EQUALS = "equalsto",
    CONFORMS = "conformsto"
}

export class NewPiTyperDefLang {
    language: PiLanguage;
    types: PiElementReference<PiClassifier>[] = [];
    anyTypeRule: PiTypeAnyTypeRule;
    classifierRules: PiTypeClassifierRule[] = [];
}

export class PiTypeAnyTypeRule extends PiDefinitionElement {
    statements: PiTypeStatement[] = [];

    toPiString(): string {
        return `anytype { ${this.statements.map( t => t.toPiString() ).join("\n")} }`;
    }
}

export abstract class PiTypeClassifierRule extends PiDefinitionElement {
    myClassifier: PiElementReference<PiClassifier>;

    toPiString(): string {
        return "SHOULD BE IMPLEMENTED BY SUBCLASSES OF 'PiTypeClassifierRule'";
    }
}

export class PiTypeConformanceOrEqualsRule extends PiTypeClassifierRule {
    otherType: PiProperty; // this object is not part of the AST, it is here to embody e.g. 'x: UnitOfMeasurement'
    conditions: PiTypeStatement[] = []; // may be empty!
    kind: PiTypeStatementKind;
    isEquals: boolean = false; // if true, the statement is an 'equalsto', not a 'conformsto'

    toPiString(): string {
        return `${this.myClassifier.name} { 
            ${this.isEquals ? `equalsto` : `conformsto`} ${this.otherType.name}:${this.otherType.type.name} where {
             ${this.conditions.map( t => t.toPiString() ).join("\n")} 
                }
             }`;
    }
}

export class PiTypeInferenceRule extends PiTypeClassifierRule {
    isAbstract: boolean = false;
    exp: PiTypeExp;

    toPiString(): string {
        if (this.isAbstract) {
            return `\`${this.myClassifier.name} { abstract infertype; }\``;
        } else {
            return `${this.myClassifier.name} { infertype ${this.exp.toPiString()} }`;
        }
    }
}

export class PiTypeStatement extends PiDefinitionElement {
    left: PiTypeExp;
    right: PiTypeExp;
    operand: PiTypeStatementKind; // either 'equalsto' or 'conformsto'

    toPiString(): string {
        return `${this.left.toPiString()} ${this.operand} ${this.right.toPiString()};`;
    }
}

export abstract class PiTypeExp extends PiDefinitionElement {
    toPiString(): string {
        return "SHOULD BE IMPLEMENTED BY SUBCLASSES OF 'PiTypeExp'";
    }
}

export class PiTypeFunctionCallExp extends PiTypeExp {
    functionName: string;
    arguments: PiTypePropertyCallExp[] = [];

    toPiString(): string {
        return `${this.functionName}( ${this.arguments.map((arg => arg.toPiString())).join(", ")} )`;
    }
}

export class PiTypePropertyCallExp extends PiTypeExp {
    sourceName: string;
    myProperty: PiElementReference<PiProperty>;

    toPiString(): string {
        return `${this.sourceName}.${this.myProperty.name}`;
    }
}

export class PiTypeInstanceRef extends PiTypeExp {
    myLimited: PiElementReference<PiLimitedConcept>;
    myInstance: PiElementReference<PiInstance>;

    toPiString(): string {
        let prefix: string = "";
        if (!!this.myLimited) {
            prefix = this.myLimited.name + ":"
        }
        return `${prefix}${this.myInstance.name}`;
    }
}

export class PiTypeAnytypeRef extends PiTypeExp {
    toPiString(): string {
        return `anytype`;
    }
}
