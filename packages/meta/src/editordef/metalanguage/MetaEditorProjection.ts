import { PiLangExp } from "../../languagedef/metalanguage";
import { DefEditorConcept } from "./DefEditorConcept";
import { ParseLocation } from "../../utils";
import * as os from 'os';

export class DefEditorNewline {
    toString(): string {
        return os.EOL;
    }
}

export class DefEditorProjectionIndent {
    location: ParseLocation;
    indent: string = "";
    amount: number = 0;

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

export class DefEditorProjectionText {
    location: ParseLocation;
    text: string = "";

    toString(): string {
        return this.text;
    }
}

export enum Direction {
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
    direction: Direction = Direction.Horizontal;
    joinType?: ListJoinType;
    joinText?: string;

    toString(): string {
        return `direction ${this.direction} joinType: ${this.joinType} text: "${this.joinText}"`;
    }
}

export class DefEditorSubProjection {
    location: ParseLocation;
    propertyName: string = "";
    listJoin: ListJoin;
    expression: PiLangExp;

    toString(): string {
        return (
            "[-[" +
            this.expression.sourceName +
            "." +
            this.expression.appliedfeature.sourceName +
            (!!this.listJoin ? " " + this.listJoin.toString() : "") +
            "]-]"
        );
    }
}

export class DefEditorProjectionExpression {
    location: ParseLocation;
    propertyName: string = "";
}

type DefEditorProjectionItem = DefEditorProjectionIndent | DefEditorProjectionText | DefEditorSubProjection | DefEditorProjectionExpression;

export class MetaEditorProjectionLine {
    location: ParseLocation;
    items: DefEditorProjectionItem[] = [];
    indent: number = 0;

    isEmpty(): boolean {
        return this.items.every(i => i instanceof DefEditorNewline || i instanceof DefEditorProjectionIndent);
    }

    toString(): string {
        return this.items.map(item => item.toString()).join("");
    }
}

export class MetaEditorProjection {
    location: ParseLocation;
    name: string;
    conceptEditor: DefEditorConcept;
    lines: MetaEditorProjectionLine[];

    /** break lines at newline, remove empty lines,
     */
    normalize() {
        const result: MetaEditorProjectionLine[] = [];
        let currentLine = new MetaEditorProjectionLine();
        const lastItemIndex = this.lines[0].items.length - 1;
        // TODO Empty lines are discarded now, decide how to handle them in general
        this.lines[0].items.forEach((item, index) => {
            if (item instanceof DefEditorProjectionIndent) {
                item.normalize();
            }
            if (item instanceof DefEditorNewline) {
                if (currentLine.isEmpty()) {
                    currentLine = new MetaEditorProjectionLine();
                } else {
                    result.push(currentLine);
                    currentLine = new MetaEditorProjectionLine();
                }
            } else {
                currentLine.items.push(item);
            }
            if (lastItemIndex === index) {
                // push last line if not empty
                if (!currentLine.isEmpty()) {
                    result.push(currentLine);
                }
            }
        });
        this.lines = result;

        let ignoredIndent = 0;
        // find the ignored indent value
        this.lines.forEach(line => {
            const firstItem = line.items[0];
            if (firstItem instanceof DefEditorProjectionIndent) {
                ignoredIndent = ignoredIndent === 0 ? firstItem.amount : Math.min(ignoredIndent, firstItem.amount);
            }
        });
        // find indent of first line and substract that from all other lines
        this.lines.forEach(line => {
            const firstItem = line.items[0];
            if (firstItem instanceof DefEditorProjectionIndent) {
                const indent = firstItem.amount - ignoredIndent;
                line.indent = firstItem.amount - ignoredIndent;
                line.items.splice(0, 1);
            }
        });
        // remove all indent items, as they are not needed anymore
        this.lines.forEach(line => {
            line.items = line.items.filter(item => !(item instanceof DefEditorProjectionIndent));
        });
    }

    toString() {
        return `projection ${this.name} lines: ${this.lines.length}
${this.lines.map(line => line.toString()).join("")}`;
    }
}
