import { FreClassifier, FreLangExp, FreLanguage, FreProperty, MetaElementReference } from "../../languagedef/metalanguage";
import { Names, FreDefinitionElement } from "../../utils";

/**
 * Super type of all elements that may be part of a projection definition
 */
export type FreEditProjectionItem =
    FreEditParsedProjectionIndent    // removed after parsing, by FreEditParseUtil.normalize()
    | FreEditParsedNewline           // removed after parsing, by FreEditParseUtil.normalize()
    | FreEditProjectionText
    | FreEditPropertyProjection
    | FreEditSuperProjection ;

/**
 * The direction of a property that is a list
 */
export enum FreEditProjectionDirection {
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
export class FreEditUnit extends FreDefinitionElement {
    language: FreLanguage;
    projectiongroups: FreEditProjectionGroup[] = [];
    classifiersUsedInSuperProjection: string[] = []; // holds the names of all classifiers that are refered in an FreEditSuperProjection

    getDefaultProjectiongroup(): FreEditProjectionGroup {
        return this.projectiongroups.find(group => group.name == Names.defaultProjectionName);
    }

    /**
     * Returns a list of all projection groups except the default group, sorted by their precedence.
     * Lowest precedence first!
     */
    getAllNonDefaultProjectiongroups(): FreEditProjectionGroup[] {
        const result = this.projectiongroups.filter(group => group.name !== Names.defaultProjectionName);
        result.sort ( (a, b) => {
            return a.precedence - b.precedence;
        });
        return result;
    }

    findProjectionsForType(cls: FreClassifier): FreEditClassifierProjection[] {
        const result: FreEditClassifierProjection[] = [];
        for (const group of this.projectiongroups) {
            const found: FreEditClassifierProjection[] = group.findProjectionsForType(cls);
            if (found.length > 0) {
                result.push(...found);
            }
        }
        return result;
    }

    allTableProjections(): FreEditTableProjection[] {
        let result: FreEditTableProjection[] = [];
        for (const group of this.projectiongroups) {
            result.push(...group.allTableProjections());
        }
        return result;
    }

    findTableProjectionsForType(cls: FreClassifier): FreEditTableProjection[] {
        const result: FreEditTableProjection[] = [];
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

    findExtrasForType(cls: FreClassifier): ExtraClassifierInfo {
        return this.getDefaultProjectiongroup().findExtrasForType(cls);
    }
}

export class BoolKeywords extends FreDefinitionElement {
    trueKeyword: string = "true";
    falseKeyword?: string;

    toString(): string {
        return `BoolKeywords [ ${this.trueKeyword} | ${this.falseKeyword} ]`;
    }
}

/**
 * A group of projection definitions that share the same name
 */
export class FreEditProjectionGroup extends FreDefinitionElement {
    name: string = null;
    projections: FreEditClassifierProjection[] = [];
    standardBooleanProjection: BoolKeywords = null; // may only be present in default group
    standardReferenceSeparator: string = null;      // may only be present in default group
    extras: ExtraClassifierInfo[] = null;           // may only be present in default group
    owningDefinition: FreEditUnit;
    precedence: number;

    findProjectionsForType(cls: FreClassifier): FreEditClassifierProjection[] {
        return this.projections.filter(con => con.classifier.referred === cls);
    }

    findTableProjectionForType(cls: FreClassifier): FreEditTableProjection {
        return this.allTableProjections().find(con => con.classifier.referred === cls);
    }

    findNonTableProjectionForType(cls: FreClassifier): FreEditProjection {
        return this.allNonTableProjections().find(con => con.classifier.referred === cls);
    }

    findExtrasForType(cls: FreClassifier): ExtraClassifierInfo {
        if (!!this.extras) {
            return this.extras.find(con => con.classifier.referred === cls);
        } else {
            return null;
        }
    }

    allTableProjections(): FreEditTableProjection[] {
        return this.projections.filter(con => con instanceof FreEditTableProjection) as FreEditTableProjection[];
    }

    allNonTableProjections(): FreEditProjection[] {
        return this.projections.filter(con => con instanceof FreEditProjection) as FreEditProjection[];
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
export abstract class FreEditClassifierProjection extends FreDefinitionElement {
    name: string;
    classifier: MetaElementReference<FreClassifier>;
    toString(): string {
        return `TO BE IMPLEMENTED BY SUBCLASSES`;
    }
}

/**
 * A 'normal', i.e. not a table projection, for a concept or interface
 */
export class FreEditProjection extends FreEditClassifierProjection {
    lines: FreEditProjectionLine[] = [];

    firstProperty(): FreProperty {
        for (const line of this.lines) {
            for (const item of line.items) {
                if (item instanceof FreEditPropertyProjection) {
                    return item.property.referred;
                }
            }
        }
        return null;
    }

    findAllPartProjections(): FreEditPropertyProjection[] {
        const result: FreEditPropertyProjection[] = [];
        this.lines.forEach(line => {
            line.items.forEach(item => {
                if (item instanceof FreEditPropertyProjection) {
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
export class FreEditTableProjection extends FreEditClassifierProjection {
    headers: string[] = [];
    cells: FreEditPropertyProjection[] = [];

    /**
     * Find all projections or parts.
     */
    findAllPartProjections(): FreEditPropertyProjection[] {
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
export class ExtraClassifierInfo extends FreDefinitionElement {
    classifier: MetaElementReference<FreClassifier>;
    // The string that triggers the creation of an object of this class in the editor.
    trigger: string = null;
    // The property to be used when an element of type 'classifier' is used within a reference.
    referenceShortCut: MetaElementReference<FreProperty> = null;
    // The parsed expression that refers to the referenceShortcut. Deleted during checking!
    referenceShortcutExp: FreLangExp = null;
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
export class FreEditProjectionLine extends FreDefinitionElement {
    items: FreEditProjectionItem[] = [];
    indent: number = 0; // this number is calculated by FreEditParseUtil.normalize()

    isEmpty(): boolean {
        return (this.items.every(i => i instanceof FreEditParsedNewline || i instanceof FreEditParsedProjectionIndent)) || this.items.length === 0 ;
    }

    isOptional(): boolean {
        return this.items.every(i => i instanceof FreOptionalPropertyProjection);
    }

    toString(): string {
        return "#indents: [" + this.indent + "] " + this.items.map(item => item.toString()).join("");
    }
}

/**
 * An element of a line in a projection definition that holds a (simple) text.
 */
export class FreEditProjectionText extends FreDefinitionElement {
    public static create(text: string): FreEditProjectionText {
        const result = new FreEditProjectionText();
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
export class FreEditPropertyProjection extends FreDefinitionElement {
    property: MetaElementReference<FreProperty> = null;
    // expression used during parsing, should not be used after that phase
    expression: FreLangExp = null;
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
        return `\${ ${this.expression? this.expression.toFreString() : ``} }${extraText}`;
    }
}

/**
 * An element of a line in a projection definition that represents the projection of a property that is optional.
 */
export class FreOptionalPropertyProjection extends FreEditPropertyProjection {
    lines: FreEditProjectionLine[] = [];

    public findPropertyProjection(): FreEditPropertyProjection {
        let result: FreEditPropertyProjection = null;
        this.lines.forEach(l => {
            if (!result) {
                result = l.items.find(item => item instanceof FreEditPropertyProjection) as FreEditPropertyProjection;
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
                if (item instanceof FreEditProjectionText) {
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
export class ListInfo extends FreDefinitionElement {
    isTable: boolean = false;
    direction: FreEditProjectionDirection = FreEditProjectionDirection.Vertical;
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
export class FreEditSuperProjection extends FreDefinitionElement {
    superRef: MetaElementReference<FreClassifier> = null;
    projectionName: string = "";
    toString(): string {
        return `[=> ${this.superRef?.name} /* found ${this.superRef?.referred?.name} */ ${this.projectionName.length > 0 ? `:${this.projectionName}` : ``}]`;
    }
}

////////////////////////////////////

/**
 * This class is only used during parsing. It is removed from the model in the creation phase.
 */
export class FreEditParsedClassifier extends FreEditClassifierProjection {
    projection: FreEditProjection = null;
    tableProjection: FreEditTableProjection = null;
    classifierInfo: ExtraClassifierInfo = null;
    toString(): string {
        return `ParsedClassifier ${this.classifier?.name}`
    }
}
/**
 * This class is only used by the parser and removed from the edit model after normalization.
 */
export class FreEditParsedNewline {
    toString(): string {
        return "\n";
    }
}

/**
 * This class is only used by the parser and removed from the edit model after normalization.
 */
export class FreEditParsedProjectionIndent extends FreDefinitionElement {
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
