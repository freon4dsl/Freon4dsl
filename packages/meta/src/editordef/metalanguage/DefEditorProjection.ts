import { PiLangExp } from "../../languagedef/metalanguage";
import { DefEditorConcept } from "./DefEditorConcept";

export class DefEditorNewline {
    toString(): string {
        return "\n";
    }
}

export class DefEditorProjectionIndent {
    indent: string = ";";

    toString(): string {
        return this.indent.replace(/ /g, "_");
    }
}

export class DefEditorProjectionText {
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
    direction: Direction = Direction.Horizontal;
    joinType?: ListJoinType;
    joinText?: string;

    toString(): string {
        return `direction ${this.direction} joinType: ${this.joinType} text: "${this.joinText}"`;
    }
}

export class DefEditorSubProjection {
    propertyName: string = "";
    listJoin: ListJoin;
    expression: PiLangExp;

    toString(): string {
        return "[-[" + this.expression.sourceName + "." + this.expression.appliedfeature.sourceName + (!!this.listJoin ? " " + this.listJoin.toString() : "") + "]-]";
    }
}

export class DefEditorProjectionExpression {
    propertyName: string = "";
}

type DefEditorProjectionItem = DefEditorProjectionIndent | DefEditorProjectionText | DefEditorSubProjection | DefEditorProjectionExpression;

export class MetaEditorProjectionLine {
    items: DefEditorProjectionItem[] = [];

    toString(): string {
        return this.items.map(item => item.toString()).join("");
    }
}

export class DefEditorProjection {
    name: string;
    conceptEditor: DefEditorConcept;
    lines: MetaEditorProjectionLine[];

    breakLines() {
        const result: MetaEditorProjectionLine[] = [];
        let currentLine = new MetaEditorProjectionLine();
        this.lines[0].items.forEach(item => {
            currentLine.items.push(item);
            if( item instanceof DefEditorNewline ){
                result.push(currentLine);
                currentLine = new MetaEditorProjectionLine();
            }
        });
        this.lines = result;
    }

    toString() {
        return `projection ${this.name}
${this.lines.map(line => line.toString()).join("")}
`;
    }
}
