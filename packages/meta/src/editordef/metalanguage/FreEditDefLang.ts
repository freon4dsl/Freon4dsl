import { FreMetaClassifier, FreLangExp, FreMetaLanguage, FreMetaProperty, MetaElementReference } from "../../languagedef/metalanguage/index.js";
import { Names, FreMetaDefinitionElement } from "../../utils/index.js";

/**
 * Super type of all elements that may be part of a projection definition
 */
export type FreEditProjectionItem =
    FreEditParsedProjectionIndent    // removed after parsing, by FreEditParseUtil.normalize()
    | FreEditParsedNewline           // removed after parsing, by FreEditParseUtil.normalize()
    | FreEditProjectionText
    | FreEditExternalProjection
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
 * The different displayTypes
 */
export enum DisplayType {
    Text = "text",
    Checkbox = "checkbox",
    Radio = "radio",
    Switch = "switch",
    InnerSwitch = "inner-switch",
    Slider = "slider"
}

/**
 * The different strings that may be used as 'for' in a FreEditGlobalProjection
 */
export enum ForType {
    Boolean = "boolean",
    Number = "number",
    Limited = "limited",
    LimitedList = "limitedList",
    ReferenceSeparator = "referenceSeparator",
    Externals = "externals"
}

/**
 * The root of the complete editor definition
 */
export class FreEditUnit extends FreMetaDefinitionElement {
    language: FreMetaLanguage | undefined;
    projectiongroups: FreEditProjectionGroup[] = [];
    classifiersUsedInSuperProjection: string[] = []; // holds the names of all classifiers that are refered in an FreEditSuperProjection

    getDefaultProjectiongroup(): FreEditProjectionGroup | undefined {
        return this.projectiongroups.find(group => group.name === Names.defaultProjectionName);
    }

    /**
     * Returns a list of all projection groups except the default group, sorted by their precedence.
     * Lowest precedence first!
     */
    getAllNonDefaultProjectiongroups(): FreEditProjectionGroup[] {
        const result: FreEditProjectionGroup[] = this.projectiongroups.filter((group: FreEditProjectionGroup): boolean => group.name !== Names.defaultProjectionName);
        result.sort ( (a: FreEditProjectionGroup, b: FreEditProjectionGroup): number => {
            if (a.precedence !== undefined && b.precedence !== undefined) {
                return a.precedence - b.precedence;
            } else {
                return 0;
            }
        });
        return result;
    }

    findProjectionsForType(cls: FreMetaClassifier): FreEditClassifierProjection[] {
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
        const result: FreEditTableProjection[] = [];
        for (const group of this.projectiongroups) {
            result.push(...group.allTableProjections());
        }
        return result;
    }

    findTableProjectionsForType(cls: FreMetaClassifier): FreEditTableProjection[] {
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

    findExtrasForType(cls: FreMetaClassifier): ExtraClassifierInfo | undefined {
        return this.getDefaultProjectiongroup()?.findExtrasForType(cls);
    }
}

export class BoolKeywords extends FreMetaDefinitionElement {
    trueKeyword: string = "true";
    falseKeyword?: string = undefined;

    toString(): string {
        return `BoolKeywords [ ${this.trueKeyword} | ${this.falseKeyword} ]`;
    }
}

export class FreEditKeyValuePair extends FreMetaDefinitionElement {
    key: string = '';
    value: string = '';

    toString(): string {
        return `${this.key} = "${this.value}"`;
    }
}

/**
 * A group of projection definitions that share the same name
 */
export class FreEditProjectionGroup extends FreMetaDefinitionElement {
    name: string = '';
    projections: FreEditClassifierProjection[] = [];
    globalProjections: FreEditGlobalProjection[] = [];      // may only be present in default group
    extras: ExtraClassifierInfo[] = [];                         // may only be present in default group, todo change type to ... | undefined
    owningDefinition: FreEditUnit | undefined;
    precedence: number | undefined;

    findProjectionsForType(cls: FreMetaClassifier): FreEditClassifierProjection[] {
        let tmp: FreEditClassifierProjection[] | undefined = this.projections.filter((con: FreEditClassifierProjection): boolean => con.classifier?.referred === cls);
        if (tmp === undefined) {
            tmp = [];
        }
        return tmp;
    }

    findTableProjectionForType(cls: FreMetaClassifier): FreEditTableProjection | undefined {
        return this.allTableProjections().find(con => con.classifier?.referred === cls);
    }

    findNonTableProjectionForType(cls: FreMetaClassifier): FreEditProjection | undefined {
        return this.allNonTableProjections().find(con => con.classifier?.referred === cls);
    }

    findExtrasForType(cls: FreMetaClassifier): ExtraClassifierInfo | undefined {
        if (!!this.extras) {
            return this.extras.find(con => con.classifier?.referred === cls);
        } else {
            return undefined;
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
        ${this.globalProjections?.map( pr => pr.toString()).join("\n")}

        ${this.projections?.map(gr => gr.toString()).join("\n")}

        ${this.extras?.map(gr => gr.toString()).join("\n")}`;
    }

    findGlobalProjFor(kind: ForType): FreEditGlobalProjection |undefined {
        return this.globalProjections.find(con => con.for === kind);
    }
}

/**
 * A single definition of the global for properties with primitive type, or the reference separator
 */
export class FreEditExternalProjection extends FreMetaDefinitionElement {
    externalName: string = '';
    positionInProjection: string | undefined;
    params: FreEditKeyValuePair[] = [];

    toString(): string {
        const posInProjStr: string = `${!!this.positionInProjection ? `:${this.positionInProjection}` : ``}`;
        const paramsStr: string = `${this.params.length > 0 ? ` ${this.params.map(p => p.toString()).join(" ")}` : ``}`;
        return `external = ${this.externalName}${posInProjStr}${paramsStr}`
    }

    /**
     * To be used in ProjectionTemplate
     */
    roleString(): string {
        return `${this.externalName}${!!this.positionInProjection ? `-${this.positionInProjection}` : ``}`;
    }
}

/**
 * A single definition of the global for properties with primitive type, or the reference separator
 */
export class FreEditGlobalProjection extends FreMetaDefinitionElement {
    for: string = '';
    displayType: DisplayType | undefined; // Possible values: 'text', 'checkbox', 'radio', 'switch', 'inner-switch'. See BooleanBox.ts from core.
    keywords: BoolKeywords | undefined;
    separator: string | undefined;
    externals: string[] = [];

    toString(): string {
        const displayTypeStr: string = `${this.displayType ? ` ${this.displayType}` : ''}`;
        const keywordsStr: string = `${this.keywords ? ` ${this.keywords.toString()}` : ''}`;
        const separatorStr: string = `${this.separator ? ` [${this.separator}]` : ''}`;
        let externalsStr: string = '';
        externalsStr = `${this.externals.length > 0 ? ` { ${this.externals} }` : ''}`;

        return `${this.for}${displayTypeStr}${keywordsStr}${separatorStr}${externalsStr}`;
    }
}

/**
 * A single projection definition for a single concept or interface
 */
export abstract class FreEditClassifierProjection extends FreMetaDefinitionElement {
    name: string = '';
    classifier: MetaElementReference<FreMetaClassifier> | undefined;
    externalChildDefs: FreEditExternalChildDefinition[] = [];

    /**
     * Find all projections or parts.
     */
    findAllPartProjections(): FreEditPropertyProjection[] {
        console.error(`FreEditClassifierProjection.findAllPartProjections() CALLED, IT SHOULD BE IMPLEMENTED BY ALL SUBCLASSES.`);
        return [];
    }

    findAllExternalProjections(): FreEditExternalProjection[] {
        console.error(`FreEditClassifierProjection.findAllExternalProjections() CALLED, IT SHOULD BE IMPLEMENTED BY ALL SUBCLASSES.`);
        return [];
    }

    toString(): string {
        return `TO BE IMPLEMENTED BY SUBCLASSES`;
    }
}

/**
 * A 'normal', i.e. not a table projection, for a concept or interface
 */
export class FreEditProjection extends FreEditClassifierProjection {
    lines: FreEditProjectionLine[] = [];

    firstProperty(): FreMetaProperty | undefined {
        for (const line of this.lines) {
            for (const item of line.items) {
                if (item instanceof FreEditPropertyProjection && !!item.property) {
                    return item.property.referred;
                }
            }
        }
        return undefined;
    }

    findAllPartProjections(): FreEditPropertyProjection[] {
        const result: FreEditPropertyProjection[] = [];
        this.lines.forEach(line => {
            line.items.forEach(item => {
                if (item instanceof FreEditPropertyProjection) {
                    result.push(item);
                }
            });
        });
        return result;
    }

    findAllExternalProjections(): FreEditExternalProjection[] {
        const result: FreEditExternalProjection[] = [];
        this.lines.forEach(line => {
            line.items.forEach(item => {
                if (item instanceof FreEditExternalProjection) {
                    result.push(item);
                }
            });
        });
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

    findAllExternalProjections(): FreEditExternalProjection[] {
        console.error(`FreEditTableProjection.findAllExternalProjections() CALLED, TO BE IMPLEMENTED.`);
        return [];
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
export class ExtraClassifierInfo extends FreMetaDefinitionElement {
    classifier: MetaElementReference<FreMetaClassifier> | undefined;
    // The string that triggers the creation of an object of this class in the editor.
    trigger: string = '';
    // The property to be used when an element of type 'classifier' is used within a reference.
    referenceShortCut?: MetaElementReference<FreMetaProperty> = undefined;
    // The parsed expression that refers to the referenceShortcut. Deleted during checking!
    referenceShortcutExp?: FreLangExp = undefined;
    // Only for binary expressions: the operator between left and right parts.
    symbol: string = '';

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
export class FreEditProjectionLine extends FreMetaDefinitionElement {
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
export class FreEditProjectionText extends FreMetaDefinitionElement {
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
export class FreEditPropertyProjection extends FreMetaDefinitionElement {
    property?: MetaElementReference<FreMetaProperty> = undefined;
    // expression used during parsing, should not be used after that phase
    expression?: FreLangExp = undefined;
    // projection info if the referred property is a list
    listInfo?: ListInfo = undefined;
    // projection info if the referred property is to be displayed by an external component
    externalInfo?: FreEditExternalProjection = undefined;
    // projection info about display
    displayType?: DisplayType = undefined;
    // projection info if the referred property is a primitive of boolean type
    boolKeywords?: BoolKeywords = undefined;
    // projection to be used for this property
    projectionName: string = '';

    toString(): string {
        let extraText: string = '';
        if (!!this.projectionName && this.projectionName.length > 0) {
            extraText = `\n/* projectionName */ ${this.projectionName}`;
        }
        if (!!this.listInfo) {
            extraText = `\n/* list */ ${this.listInfo}`;
        }
        if (!!this.externalInfo) {
            extraText = `\n/* external */ ${this.externalInfo}`;
        }
        if (!!this.displayType ) {
            extraText = `\n/* displayType */ ${this.displayType}`;
        }
        if (!!this.boolKeywords ) {
            extraText = `\n/* boolean */ ${this.boolKeywords}`;
        }
        let nameText: string | undefined = this.expression?.toFreString();
        if (!nameText || nameText.length === 0) {
            nameText = this.property?.name;
        }
        return `\${ ${nameText} }${extraText}`;
    }
}

/**
 * An element of a line in a projection definition that represents the projection of a property that is optional.
 */
export class FreOptionalPropertyProjection extends FreEditPropertyProjection {
    lines: FreEditProjectionLine[] = [];

    public findPropertyProjection(): FreEditPropertyProjection | undefined {
        let result: FreEditPropertyProjection | undefined = undefined;
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
export class ListInfo extends FreMetaDefinitionElement {
    isTable: boolean = false;
    direction: FreEditProjectionDirection = FreEditProjectionDirection.Vertical;
    joinType: ListJoinType = ListJoinType.NONE; // indicates that user has not inserted join info
    joinText: string = "";

    toString(): string {
        if (this.isTable) {
            return `table ${this.direction}`;
        } else {
            return `direction: ${this.direction} joinType: ${this.joinType} [${this.joinText}]`;
        }
    }
}

/**
 * An element of a line in a projection definition that represents the projection of a superconcept or interface.
 */
export class FreEditSuperProjection extends FreMetaDefinitionElement {
    superRef?: MetaElementReference<FreMetaClassifier> = undefined;
    projectionName: string = "";
    toString(): string {
        return `[=> ${this.superRef?.name} /* found ${this.superRef?.referred?.name} */ ${this.projectionName.length > 0 ? `:${this.projectionName}` : ``}]`;
    }
}

export class FreEditExternalChildDefinition extends FreMetaDefinitionElement {
    externalName: string = '';
    positionInProjection: string | undefined = undefined;
    // @ts-ignore this property is set during parsing
    childProjection: FreEditProjection;

    toString(): string {
        const posInProjStr: string = `${!!this.positionInProjection ? `:${this.positionInProjection}` : ``}`;
        return `external = ${this.externalName}${posInProjStr} [${this.childProjection}]`
    }
}

export class FreEditButtonDef extends FreMetaDefinitionElement {
    text: string = '';
    boxRole: string = 'unknown-box-role';

    toString(): string {
        return `[button ${!!this.text && this.text.length > 0 ? `text="${this.text}" ` : ``}boxRole="${this.boxRole}"]`;
    }
}

////////////////////////////////////

/**
 * This class is only used during parsing. It is removed from the model in the creation phase (in FreEditCreators.extractProjections).
 */
export class FreEditParsedClassifier extends FreEditClassifierProjection {
    projection?: FreEditProjection = undefined;
    tableProjection?: FreEditTableProjection = undefined;
    classifierInfo?: ExtraClassifierInfo = undefined;
    toString(): string {
        return `ParsedClassifier ${this.classifier?.name}`;
    }
}
/**
 * This class is only used by the parser and removed from the edit model after normalization in FreEditChecker.normalize.
 */
export class FreEditParsedNewline {
    toString(): string {
        return "\n";
    }
}

/**
 * This class is only used by the parser and removed from the edit model after normalization in FreEditChecker.normalize.
 */
export class FreEditParsedProjectionIndent extends FreMetaDefinitionElement {
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
