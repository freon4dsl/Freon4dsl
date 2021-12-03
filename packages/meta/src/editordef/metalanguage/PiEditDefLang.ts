import { PiClassifier, PiConcept, PiInstanceExp, PiLangExp, PiLanguage } from "../../languagedef/metalanguage";
import { PiElementReference } from "../../languagedef/metalanguage/PiElementReference";
import { PiDefinitionElement } from "../../utils";
import { Roles } from "../../utils/Roles";

export class PiEditUnit extends PiDefinitionElement {
    name: string;
    language: PiLanguage;
    languageName: string;
    conceptEditors: PiEditConcept[] = [];

    findConceptEditor(cls: PiClassifier): PiEditConcept {
        return this.conceptEditors.find(con => con.concept.referred === cls);
    }
}

export class PiEditConcept extends PiDefinitionElement {
    languageEditor: PiEditUnit;

    concept: PiElementReference<PiClassifier>;
    projection: PiEditProjection = null;
    tableProjections: PiEditTableProjection[] = [];
    _trigger: string = null;
    // The name of the reference property for which a shortcut can be used
    referenceShortcut: PiLangExp;

    symbol: string = null; // only for binary expressions

    get trigger(): string {
        if (!!(this._trigger)) {
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
export class PiEditParsedProjectionIndent extends PiDefinitionElement {
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

export class PiEditProjectionText extends PiDefinitionElement {
    public static create(text: string): PiEditProjectionText {
        const result = new PiEditProjectionText();
        result.text = text;
        return result;
    }

    text: string = "";
    style: string = "propertykeyword";

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

export class ListJoin extends PiDefinitionElement {
    direction: PiEditProjectionDirection = PiEditProjectionDirection.Horizontal;
    joinType?: ListJoinType = ListJoinType.NONE;
    joinText?: string = "";

    toString(): string {
        return `direction ${this.direction} joinType: ${this.joinType} text: "${this.joinText}"`;
    }
}

export class TableInfo extends PiDefinitionElement {
    direction: PiEditProjectionDirection = PiEditProjectionDirection.Horizontal;
    toString(): string {
        return `@table direction ${this.direction}`;
    }
}

export class PiEditPropertyProjection extends PiDefinitionElement {
    // propertyName: string = "";
    listJoin: ListJoin;
    tableInfo?: TableInfo;
    keyword?: string;
    expression: PiLangExp;

    propertyName(): string {
        // TODO This is a hack to skip "this." Needs to be done properly.
        return this.expression.toPiString().substring(5);
    }

    toString(): string {
        return (
            "${" +
            this.expression.toPiString() + " " +
            (!!this.listJoin ? " " + this.listJoin.toString() : "") +
            (!!this.tableInfo ? " " + this.tableInfo.toString() : "") +
            (!!this.keyword ? " @keyword [" + this.keyword + "]" : "") +
            "}"
        );
    }
}

export class PiEditSubProjection extends PiDefinitionElement {
    optional: boolean;
    items: PiEditProjectionItem[];

    /**
     * Return the first property projection inside this sub projection
     */
    public optionalProperty(): PiEditPropertyProjection {
        for (const item of this.items) {
            if (item instanceof PiEditPropertyProjection) {
                return item;
            }
        }
        return undefined;
        // return this.items.find((value, index, obj) => {
        //     value instanceof PiEditPropertyProjection
        // }) as PiEditPropertyProjection;
    }

    /**
     * Returns the first literal word in the sub projection.
     * Returns the empty string "" if there is no such literal.
     */
    public firstLiteral(): string {
        for (const item of this.items) {
            if (item instanceof PiEditProjectionText) {
                return item.text.trim();
            }
        }
        return "";
    }

    // TODO what about sub-sub-sub... projections: will they all have one language element?
}

export class PiEditInstanceProjection { // instances of this class are created by the checker
    keyword: string;
    expression: PiInstanceExp;
    toString(): string {
        return `${this.expression.toPiString()} @keyword ${this.keyword}`;
    }
}

export type PiEditProjectionItem = PiEditParsedProjectionIndent | PiEditProjectionText | PiEditPropertyProjection | PiEditSubProjection | PiEditInstanceProjection;

export class PiEditProjectionLine extends PiDefinitionElement {
    items: PiEditProjectionItem[] = [];
    indent: number = 0;

    isEmpty(): boolean {
        return this.items.every(i => i instanceof PiEditParsedNewline || i instanceof PiEditParsedProjectionIndent);
    }

    toString(): string {
        return this.items.map(item => item.toString()).join("");
    }
}

export class PiEditProjection extends PiDefinitionElement {
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

export class PiEditTableProjection extends PiDefinitionElement {
    name: string;
    conceptEditor: PiEditConcept;
    headers: string[] = [];
    cells: PiEditPropertyProjection[] = [];

    toString() {
        return `table "${this.name}" headers: ${this.headers.map(head => `"${head}"`).join(" | ")}
        items: ${this.cells.map(it => it.toString()). join(" | ")}`;
    }
}
