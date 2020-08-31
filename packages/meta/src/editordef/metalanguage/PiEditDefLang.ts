import { PiClassifier, PiConcept, PiInstanceExp, PiLangExp, PiLanguage } from "../../languagedef/metalanguage";
import { PiElementReference } from "../../languagedef/metalanguage/PiElementReference";
import { Roles } from "../../utils/Roles";
import { ParseLocation } from "../../utils";

export class PiEditElement {
    location: ParseLocation;
}

export class PiEditUnit extends PiEditElement {
    name: string;
    language: PiLanguage;
    languageName: string;
    conceptEditors: PiEditConcept[] = [];

    findConceptEditor(cls: PiClassifier): PiEditConcept {
        const result = this.conceptEditors.find(con => con.concept.referred === cls);
        return result;
    }
}

export class PiEditConcept extends PiEditElement {
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
export class PiEditParsedProjectionIndent extends PiEditElement {
    indent: string = "";
    amount: number = 0;

    /**
     * Calculates the `amount` of indentation.
     */
    normalize(): void {
        let spaces = 0;
        for (const char of this.indent) {
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

export class PiEditProjectionText extends PiEditElement {
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

export class ListJoin extends PiEditElement {
    direction: PiEditProjectionDirection = PiEditProjectionDirection.Horizontal;
    joinType?: ListJoinType = ListJoinType.NONE;
    joinText?: string = ", ";

    toString(): string {
        return `direction ${this.direction} joinType: ${this.joinType} text: "${this.joinText}"`;
    }
}

export class PiEditPropertyProjection extends PiEditElement {
    propertyName: string = "";
    listJoin: ListJoin;
    keyword?: string;
    expression: PiLangExp;

    toString(): string {
        return (
            "${" +
            this.expression.toPiString() + " " +
            (!!this.listJoin ? " " + this.listJoin.toString() : "") +
            (!!this.keyword ? " @keyword [" + this.keyword + "]" : "") +
            "}"
        );
    }
}

export class PiEditSubProjection extends PiEditElement {
    optional: boolean;
    items: PiEditProjectionItem[];
}

export class PiEditInstanceProjection { // instances of this class are created by the checker
    keyword: string;
    expression: PiInstanceExp;
    toString(): string {
        return `${this.expression.toPiString()} @keyword ${this.keyword}`;
    }
}

export type PiEditProjectionItem = PiEditParsedProjectionIndent | PiEditProjectionText | PiEditPropertyProjection | PiEditSubProjection | PiEditInstanceProjection;

export class PiEditProjectionLine extends PiEditElement {
    items: PiEditProjectionItem[] = [];
    indent: number = 0;

    isEmpty(): boolean {
        return this.items.every(i => i instanceof PiEditParsedNewline || i instanceof PiEditParsedProjectionIndent);
    }

    toString(): string {
        return this.items.map(item => item.toString()).join("");
    }
}

export class PiEditProjection extends PiEditElement {
    name: string;
    conceptEditor: PiEditConcept;
    lines: PiEditProjectionLine[] = [];

    cursorLocation(): string {
        for (const line of this.lines) {
            for (const item of line.items) {
                if (item instanceof PiEditPropertyProjection) {
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
