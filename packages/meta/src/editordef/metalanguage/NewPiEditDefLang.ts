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

/**
 * The root of the complete editor definition
 */
export class PiEditUnit extends PiDefinitionElement {
    language: PiLanguage;
    projectiongroups: PiEditProjectionGroup[] = [];

    findProjectionForType(cls: PiClassifier): PiEditClassifierProjection {
        for (const group of this.projectiongroups) {
            const found = group.findProjectionForType(cls);
            if (!!found) {
                return found;
            }
        }
        return null;
    }

    allTableProjections(): PiEditTableProjection[] {
        let result: PiEditTableProjection[] = [];
        for (const group of this.projectiongroups) {
            result.push(...group.allTableProjections());
        }
        return result;
    }

    findTableProjectionForType(cls: PiClassifier): PiEditTableProjection {
        for (const group of this.projectiongroups) {
            const found = group.findTableProjectionForType(cls);
            if (!!found) {
                return found;
            }
        }
        return null;
    }

    toString(): string {
        return `${this.projectiongroups.map(pr => pr.toString()). join("\n")}`;
    }
}

export class BoolKeywords extends PiDefinitionElement {
    trueKeyword: string = "true";
    falseKeyword?: string;

    toString(): string {
        return `BoolKeywords [ ${this.trueKeyword} | ${this.falseKeyword} ]`;
    }
}

/**
 * A group of projection definitions that share the same name
 */
export class PiEditProjectionGroup extends PiDefinitionElement {
    name: string = null;
    standardBooleanProjection: BoolKeywords;
    standardReferenceSeparator: string;
    projections: PiEditClassifierProjection[] = [];
    extras: ExtraClassifierInfo[] = [];

    findProjectionForType(cls: PiClassifier): PiEditClassifierProjection {
        return this.projections.find(con => con.classifier.referred === cls);
    }

    allTableProjections(): PiEditTableProjection[] {
        return this.projections.filter(con => con instanceof PiEditTableProjection) as PiEditTableProjection[];
    }

    findTableProjectionForType(cls: PiClassifier): PiEditTableProjection {
        return this.allTableProjections().find(con => con.classifier.referred === cls);
    }

    toString(): string {
        return `editor ${this.name}
        ${this.standardBooleanProjection ? `boolean ${this.standardBooleanProjection}` : ``}
        ${this.standardReferenceSeparator ? `referenceSeparator [ ${this.standardReferenceSeparator} ]` : ``}
        
        ${this.projections.map(gr => gr.toString()).join("\n")}

        ${this.extras.map(gr => gr.toString()).join("\n")}`;
    }
}

/**
 * A single projection definition for a single concept or interface
 */
export abstract class PiEditClassifierProjection extends PiDefinitionElement {
    name: string;
    classifier: PiElementReference<PiClassifier>;
    toString(): string {
        return `TO BE IMPLEMENTED BY SUBCLASSES`;
    }
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
        return `${this.classifier?.name} {
        [ // #lines: ${this.lines.length}
        ${this.lines.map(line => line.toString()).join("\n")}
        ]}`;
    }
}

/**
 * A table projection for a concept or interface
 */
export class PiEditTableProjection extends PiEditClassifierProjection {
    headers: string[] = [];
    cells: PiEditPropertyProjection[] = [];

    toString() {
        return `${this.classifier?.name} {
        table [ 
        ${this.headers.map(head => `"${head}"`).join(" | ")}
        ${this.cells.map(it => it.toString()). join(" | ")}
        ]}`;
    }
}

/**
 * Holds extra information, defined in the default editor, per classifier
 */
export class ExtraClassifierInfo extends PiDefinitionElement {
    classifier: PiElementReference<PiClassifier>;
    // The string that in the editor triggers the creation of an object of this class.
    private _trigger: string = null;
    // The name of the reference property for which a shortcut can be used.
    referenceShortcut: PiLangExp = null;
    // Only for binary expressions: the operator between left and right parts.
    symbol: string = null;

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

    toString(): string {
        return `${this.classifier?.name} {
            trigger = ${this._trigger}
            symbol = ${this.symbol}
            referenceShortcut = ${this.referenceShortcut}
        }`;
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
        return "#indents: [" + this.indent + "] " + this.items.map(item => item.toString()).join("");
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
    // TODO should style be here?
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
    // expression used during parsing, should not be used after that phase
    expression: PiLangExp = null;
    // projection info if the referred property is a list
    listInfo: ListInfo = null;
    // projection info if the referred property is a primitive of boolean type
    boolInfo: BoolKeywords = null;

    toString(): string {
        let extraText: string;
        if (!!this.listInfo) {
            extraText = `\n/* list */ ${this.listInfo}`;
        }
        if (!!this.boolInfo) {
            extraText = `\n/* boolean */ ${this.boolInfo}`;
        }
        return `\${ ${this.expression} /* found ${this.property?.referred?.name} */ }${extraText}`;
    }
}

/**
 * An element of a line in a projection definition that represents the projection of a property that is optional.
 */
export class PiOptionalPropertyProjection extends PiEditPropertyProjection {
    lines: PiEditProjectionLine[] = [];
    toString(): string {
        return `[? /* found ${this.property?.referred?.name} */ 
        // #lines ${this.lines.length}
            ${this.lines.map(line => line.toString()).join("\n")}\`;
        ]`;
    }
}

/**
 * Information on how a list property should be projected: as list or table;
 * horizontal or vertical, row or columns based; with a terminator, separator, initiator, or
 * without any of these.
 */
export class ListInfo extends PiDefinitionElement {
    // isTable === true                 => joinType === ListJoinType.NONE && joinText === ""
    // joinType !== ListJoinType.NONE   => isTable === false;
    isTable: boolean = false;
    direction: PiEditProjectionDirection = PiEditProjectionDirection.Horizontal;
    joinType: ListJoinType = ListJoinType.NONE;
    joinText: string = "";

    toString(): string {
        if (this.isTable) {
            return `table ${this.direction}`
        } else {
            return `direction: ${this.direction} joinType: ${this.joinType} [${this.joinText}]`;
        }
    }
}

/**
 * An element of a line in a projection definition that represents the projection of a superconcept or interface.
 */
export class PiEditSuperProjection extends PiDefinitionElement {
    superRef: PiElementReference<PiClassifier> = null;
    projectionName: string = "";
    toString(): string {
        return `[=> ${this.superRef?.name} /* found ${this.superRef?.referred?.name} */ ${this.projectionName.length > 0 ? `:${this.projectionName}` : ``}]`;
    }
}

////////////////////////////////////

/**
 * This class is only used during parsing. It is removed from the model in the creation phase.
 */
export class PiEditParsedClassifier extends PiEditClassifierProjection {
    projection: PiEditProjection = null;
    tableProjection: PiEditTableProjection = null;
    classifierInfo: ExtraClassifierInfo = null;
    toString(): string {
        return `ParsedClassifier ${this.classifier?.name}`
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

///////////////////////////////
