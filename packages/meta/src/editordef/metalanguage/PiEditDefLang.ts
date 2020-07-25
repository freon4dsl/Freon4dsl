import { PiConcept, PiLangExp, PiLanguage } from "../../languagedef/metalanguage";
import { PiElementReference } from "../../languagedef/metalanguage/PiElementReference";
import { Roles } from "../../utils/Roles";
import { ParseLocation } from "../../utils";

export class PiEditUnit {
    location: ParseLocation;
    name: string;
    language: PiLanguage;
    languageName: string;
    conceptEditors: PiEditConcept[] = [];

    constructor() {}

    findConceptEditor(cls: PiConcept): PiEditConcept {
        const result = this.conceptEditors.find(con => con.concept.referred === cls);
        return result;
    }
}

export class PiEditConcept {
    location: ParseLocation;
    languageEditor: PiEditUnit;

    concept: PiElementReference<PiConcept>;
    projection: PiEditProjection = null;
    _trigger: string = null;

    symbol: string = null; // only for binary expressions

    get trigger(): string {
        if (!!this._trigger) {
            return this._trigger;
        } else {
            return this.symbol;
        }
    }

    set trigger(value: string) {
        this._trigger = value;
    }
}

/**
 * This class is only used by the parser and removed from the edit model after normalization.
 */
export class PiEditParsedNewline {
    toString(): string {
        return "\n";
    }
}

/**
 * This class is only used by the parser and removed from the edit model after normalization.
 */
export class PiEditParsedProjectionIndent {
    location: ParseLocation;
    indent: string = "";
    amount: number = 0;

    /**
     * Calculates the `amount` of indentation.
     */
    normalize(): void {
        let spaces = 0;
        for (let char of this.indent) {
            if (char === "\t") {
                spaces += 4;
            } else if (char === " ") {
                spaces += 1;
            }
        }
        this.amount = spaces;
    }

    toString(): string {
        return this.indent.replace(/ /g, "_" + this.amount);
    }
}

export class PiEditProjectionText {
    location: ParseLocation;
    text: string = "";
    style: string = "propertykeyword";

    public static create(text: string): PiEditProjectionText {
        const result = new PiEditProjectionText();
        result.text = text;
        return result;
    }

    toString(): string {
        return this.text;
    }
}

export enum PiEditProjectionDirection {
    NONE = "NONE",
    Horizontal = "Horizontal",
    Vertical = "Vertical"
}

export enum ListJoinType {
    NONE = "NONE",
    Terminator = "Terminator",
    Separator = "Separator"
}

export class ListJoin {
    location: ParseLocation;
    direction: PiEditProjectionDirection = PiEditProjectionDirection.Horizontal;
    joinType?: ListJoinType;
    joinText?: string;

    toString(): string {
        return `direction ${this.direction} joinType: ${this.joinType} text: "${this.joinText}"`;
    }
}

export class PiEditSubProjection {
    location: ParseLocation;
    propertyName: string = "";
    listJoin: ListJoin;
    expression: PiLangExp;

    toString(): string {
        return (
            "${" +
            this.expression.sourceName +
            "." +
            this.expression.appliedfeature.sourceName +
            (!!this.listJoin ? " " + this.listJoin.toString() : "") +
            "}"
        );
    }
}

type PiEditProjectionItem = PiEditParsedProjectionIndent | PiEditProjectionText | PiEditSubProjection;

export class PiEditProjectionLine {
    location: ParseLocation;
    items: PiEditProjectionItem[] = [];
    indent: number = 0;

    isEmpty(): boolean {
        return this.items.every(i => i instanceof PiEditParsedNewline || i instanceof PiEditParsedProjectionIndent);
    }

    toString(): string {
        return this.items.map(item => item.toString()).join("");
    }
}

export class PiEditProjection {
    location: ParseLocation;
    name: string;
    conceptEditor: PiEditConcept;
    lines: PiEditProjectionLine[] = [];

    cursorLocation(): string {
        for (let line of this.lines) {
            for (let item of line.items) {
                if (item instanceof PiEditSubProjection) {
                    return Roles.property(item.expression.appliedfeature.referredElement.referred);
                    // const referred: PiProperty = item.expression.appliedfeature.referredElement.referred;
                    // if (referred.type.referred instanceof PiExpressionConcept) {
                    //     return "expression-placeholder";
                    // } else {
                    // }
                }
            }
        }
        return "";
    }

    toString() {
        return `projection ${this.name} lines: ${this.lines.length}
${this.lines.map(line => line.toString()).join("\n")}`;
    }
}
