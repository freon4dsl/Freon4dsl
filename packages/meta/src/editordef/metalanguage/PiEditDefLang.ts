import { PiClassifier, PiInstance, PiLangExp, PiLanguage, PiProperty } from "../../languagedef/metalanguage";
import { PiElementReference } from "../../languagedef/metalanguage/PiElementReference";
import { Names, PiDefinitionElement } from "../../utils";

/**
 * Super type of all elements that may be part of a projection definition
 */
export type PiEditProjectionItem =
    PiEditParsedProjectionIndent    // removed after parsing, by PiEditParseUtil.normalize()
    | PiEditParsedNewline           // removed after parsing, by PiEditParseUtil.normalize()
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
    Separator = "Separator",    // the accompanying string is placed between list elements
    Initiator = "Initiator"     // the accompanying string is placed before each list element
}

/**
 * The root of the complete editor definition
 */
export class PiEditUnit extends PiDefinitionElement {
    language: PiLanguage;
    projectiongroups: PiEditProjectionGroup[] = [];
    classifiersUsedInSuperProjection: string[] = []; // holds the names of all classifiers that are refered in an PiEditSuperProjection

    getDefaultProjectiongroup(): PiEditProjectionGroup {
        return this.projectiongroups.find(group => group.name == Names.defaultProjectionName);
    }

    /**
     * Returns a list of all projection groups except the default group, sorted by their precedence.
     * Lowest precedence first!
     */
    getAllNonDefaultProjectiongroups(): PiEditProjectionGroup[] {
        const result = this.projectiongroups.filter(group => group.name !== Names.defaultProjectionName);
        result.sort ( (a, b) => {
            return a.precedence - b.precedence;
        });
        result.forEach(g => {
            console.log(`group ${g.name} has precendence ${g.precedence}`);
        })
        return result;
    }

    findProjectionsForType(cls: PiClassifier): PiEditClassifierProjection[] {
        const result: PiEditClassifierProjection[] = [];
        for (const group of this.projectiongroups) {
            const found: PiEditClassifierProjection[] = group.findProjectionsForType(cls);
            if (found.length > 0) {
                result.push(...found);
            }
        }
        return result;
    }

    allTableProjections(): PiEditTableProjection[] {
        let result: PiEditTableProjection[] = [];
        for (const group of this.projectiongroups) {
            result.push(...group.allTableProjections());
        }
        return result;
    }

    findTableProjectionsForType(cls: PiClassifier): PiEditTableProjection[] {
        const result: PiEditTableProjection[] = [];
        for (const group of this.projectiongroups) {
            const found = group.findTableProjectionForType(cls);
            if (!!found) {
                result.push(found);
            }
        }
        return result;
    }

    toString(): string {
        return `${this.projectiongroups.map(pr => pr.toString()). join("\n")}`;
    }

    findExtrasForType(cls: PiClassifier): ExtraClassifierInfo {
        return this.getDefaultProjectiongroup().findExtrasForType(cls);
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
    projections: PiEditClassifierProjection[] = [];
    standardBooleanProjection: BoolKeywords = null; // may only be present in default group
    standardReferenceSeparator: string = null;      // may only be present in default group
    extras: ExtraClassifierInfo[] = null;           // may only be present in default group
    owningDefinition: PiEditUnit;
    precedence: number;

    findProjectionsForType(cls: PiClassifier): PiEditClassifierProjection[] {
        return this.projections.filter(con => con.classifier.referred === cls);
    }

    findTableProjectionForType(cls: PiClassifier): PiEditTableProjection {
        return this.allTableProjections().find(con => con.classifier.referred === cls);
    }

    findNonTableProjectionForType(cls: PiClassifier): PiEditProjection {
        return this.allNonTableProjections().find(con => con.classifier.referred === cls);
    }

    findExtrasForType(cls: PiClassifier): ExtraClassifierInfo {
        if (!!this.extras) {
            return this.extras.find(con => con.classifier.referred === cls);
        } else {
            return null;
        }
    }

    allTableProjections(): PiEditTableProjection[] {
        return this.projections.filter(con => con instanceof PiEditTableProjection) as PiEditTableProjection[];
    }

    allNonTableProjections(): PiEditProjection[] {
        return this.projections.filter(con => con instanceof PiEditProjection) as PiEditProjection[];
    }

    toString(): string {
        return `editor ${this.name}
        ${this.standardBooleanProjection ? `boolean ${this.standardBooleanProjection}` : ``}
        ${this.standardReferenceSeparator ? `referenceSeparator [ ${this.standardReferenceSeparator} ]` : ``}
        
        ${this.projections?.map(gr => gr.toString()).join("\n")}

        ${this.extras?.map(gr => gr.toString()).join("\n")}`;
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

    firstProperty(): PiProperty {
        for (const line of this.lines) {
            for (const item of line.items) {
                if (item instanceof PiEditPropertyProjection) {
                    return item.property.referred;
                }
            }
        }
        return null;
    }

    findAllPartProjections(): PiEditPropertyProjection[] {
        const result: PiEditPropertyProjection[] = [];
        this.lines.forEach(line => {
            line.items.forEach(item => {
                if (item instanceof PiEditPropertyProjection) {
                    result.push(item)
                }
            })
        })
        return result;
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

    /**
     * Find all projections or parts.
     */
    findAllPartProjections(): PiEditPropertyProjection[] {
        return this.cells;
    }

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
    // The string that triggers the creation of an object of this class in the editor.
    trigger: string = null;
    // The property to be used when an element of type 'classifier' is used within a reference.
    referenceShortCut: PiElementReference<PiProperty> = null;
    // The parsed expression that refers to the referenceShortcut. Deleted during checking!
    referenceShortcutExp: PiLangExp = null;
    // Only for binary expressions: the operator between left and right parts.
    symbol: string = null;

    toString(): string {
        return `${this.classifier?.name} {
            trigger = ${this.trigger}
            symbol = ${this.symbol}
            referenceShortcut = ${this.referenceShortCut ? this.referenceShortCut.name : this.referenceShortcutExp}
        }`;
    }
}

/**
 * One of the lines in a 'normal' projection definition
 */
export class PiEditProjectionLine extends PiDefinitionElement {
    items: PiEditProjectionItem[] = [];
    indent: number = 0; // this number is calculated by PiEditParseUtil.normalize()

    isEmpty(): boolean {
        return (this.items.every(i => i instanceof PiEditParsedNewline || i instanceof PiEditParsedProjectionIndent)) || this.items.length === 0 ;
    }

    isOptional(): boolean {
        return this.items.every(i => i instanceof PiOptionalPropertyProjection);
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
    // projection to be used for this property
    // TODO Only used in parser?
    projectionName: string = null;

    toString(): string {
        let extraText: string;
        if (!!this.listInfo) {
            extraText = `\n/* list */ ${this.listInfo}`;
        }
        if (!!this.boolInfo) {
            extraText = `\n/* boolean */ ${this.boolInfo}`;
        }
        return `\${ ${this.expression? this.expression.toPiString() : ``} }${extraText}`;
    }
}

/**
 * An element of a line in a projection definition that represents the projection of a property that is optional.
 */
export class PiOptionalPropertyProjection extends PiEditPropertyProjection {
    lines: PiEditProjectionLine[] = [];

    public findPropertyProjection(): PiEditPropertyProjection {
        let result: PiEditPropertyProjection = null;
        this.lines.forEach(l => {
            if (!result) {
                result = l.items.find(item => item instanceof PiEditPropertyProjection) as PiEditPropertyProjection;
            }
        });
        return result;
    }

    /**
     * Returns the first literal word in the sub projection.
     * Returns the empty string "" if there is no such literal.
     */
    public firstLiteral(): string {
        for (const line of this.lines) {
            for (const item of line.items) {
                if (item instanceof PiEditProjectionText) {
                    return item.text.trim();
                }
            }
        }
        return "";
    }

    toString(): string {
        return `[?  
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
    isTable: boolean = false;
    direction: PiEditProjectionDirection = PiEditProjectionDirection.Vertical;
    joinType: ListJoinType = ListJoinType.NONE; // indicates that user has not inserted join info
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

    toString(): string {
        if (this.amount === 0) {
            return "_0";
        }
        return this.indent.replace(/ /g, "_") + this.amount;
    }
}

///////////////////////////////
