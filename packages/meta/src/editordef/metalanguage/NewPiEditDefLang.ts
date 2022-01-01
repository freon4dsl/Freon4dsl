import { PiClassifier, PiLangExp, PiLanguage, PiProperty } from "../../languagedef/metalanguage";
import { PiElementReference } from "../../languagedef/metalanguage/PiElementReference";
import { PiDefinitionElement } from "../../utils";
import { Roles } from "../../utils/Roles";

/**
 * Super type of all elements that may be part of a projection definition
 */
export type PiEditProjectionItem =
    PiEditParsedProjectionIndent    // removed after parsing, by PiEditProjectionUtil.normalize()
    | PiEditParsedNewline           // removed after parsing, by PiEditProjectionUtil.normalize()
    | PiEditProjectionText
    | PiEditPropertyProjection
    | PiEditSuperProjection ;

/**
 * The direction of a property that is a list
 */
export enum PiEditProjectionDirection {
    NONE = "NONE",
    Horizontal = "Horizontal",
    Vertical = "Vertical"
}

/**
 * The manner in which elements of a list are combined
 */
export enum ListJoinType {
    NONE = "NONE",
    Terminator = "Terminator",  // the accompanying string is placed after each list element
    Separator = "Separator",    // the accompanying string is placed between each list element
    Initiator = "Initiator"     // the accompanying string is placed before each list element
}

export class BoolKeywords extends PiDefinitionElement {
    trueKeyword: string = "true";
    falseKeyword?: string;
}

/**
 * The root of the complete editor definition
 */
export class PiEditUnit extends PiDefinitionElement {
    name: string;
    language: PiLanguage;
    standardBooleanProjection: BoolKeywords;
    standardReferenceSeparator: string;
    // classifierInfo: ExtraClassifierInfo[] = [];
    projectiongroups: PiEditProjectionGroup[] = [];
}

/**
 * Holds extra information, defined in the default editor, per classifier
 */
export class ExtraClassifierInfo extends PiDefinitionElement {
    classifier: PiElementReference<PiClassifier>;
    private _trigger: string = null;
    // The name of the reference property for which a shortcut can be used
    referenceShortcut: PiLangExp = null;
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
 * A group of projection definitions that share the same name
 */
export class PiEditProjectionGroup extends PiDefinitionElement {
    name: string = null;
    projections: PiEditClassifierProjection[] = [];
}

/**
 * A single projection definition for a single concept or interface
 */
export abstract class PiEditClassifierProjection extends PiDefinitionElement {
    name: string;
    classifier: PiElementReference<PiClassifier>;
    classifierInfo: ExtraClassifierInfo = null;
}

/**
 * A 'normal', i.e. not a table projection, for a concept or interface
 */
export class PiEditProjection extends PiEditClassifierProjection {
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

/**
 * A table projection for a concept or interface
 */
export class PiEditTableProjection extends PiEditClassifierProjection {
    headers: string[] = [];
    cells: PiEditPropertyProjection[] = [];

    toString() {
        return `table "${this.name}" headers: ${this.headers.map(head => `"${head}"`).join(" | ")}
        items: ${this.cells.map(it => it.toString()). join(" | ")}`;
    }
}

/**
 * One of the lines in a 'normal' projection definition
 */
export class PiEditProjectionLine extends PiDefinitionElement {
    items: PiEditProjectionItem[] = [];
    indent: number = 0; // this number is calculated by PiEditProjectionUtil.normalize()

    isEmpty(): boolean {
        return this.items.every(i => i instanceof PiEditParsedNewline || i instanceof PiEditParsedProjectionIndent);
    }

    toString(): string {
        return this.items.map(item => item.toString()).join("");
    }
}

/**
 * An element of a line in a projection definition that holds a (simple) text.
 */
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

/**
 * An element of a line in a projection definition that represents the projection of a property.
 * Note that properties that are lists, properties that have boolean type, and optional properties,
 * are represented by subclasses of this class.
 */
export class PiEditPropertyProjection extends PiDefinitionElement {
    property: PiElementReference<PiProperty> = null;
    expression: PiLangExp = null;
}

/**
 * An element of a line in a projection definition that represents the projection of a property that is a list.
 */
export class PiListPropertyProjection extends PiEditPropertyProjection {
    isTable: boolean = false;
    direction: PiEditProjectionDirection = PiEditProjectionDirection.Horizontal;
    listInfo: ListInfo;
}

/**
 * An element of a line in a projection definition that represents the projection of a property that has boolean type.
 */
export class PiBooleanPropertyProjection extends PiEditPropertyProjection {
    info: BoolKeywords;
}

/**
 * An element of a line in a projection definition that represents the projection of a property that is optional.
 */
export class PiOptionalPropertyProjection extends PiEditPropertyProjection {
    myProjection: PiEditProjectionLine[] = [];
}

/**
 * Information on how a list property should be projected, with a terminator, separator, initiator, or
 * without any of these.
 */
export class ListInfo extends PiDefinitionElement {
    joinType: ListJoinType = ListJoinType.NONE;
    joinText: string = "";

    toString(): string {
        return `joinType: ${this.joinType} text: "${this.joinText}"`;
    }
}

/**
 * An element of a line in a projection definition that represents the projection of a superconcept or interface.
 */
export class PiEditSuperProjection extends PiDefinitionElement {
    super: PiClassifier = null;
}

////////////////////////////////////

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

///////////////////////////////
