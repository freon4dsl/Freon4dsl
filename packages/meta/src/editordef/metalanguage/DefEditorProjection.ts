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

    toString(): string {
        return "[-[" + this.propertyName + (!!this.listJoin ? " " + this.listJoin.toString() : "") + "]-]";
    }
}

export class DefEditorProjectionExpression {
    propertyName: string = "";
}

type DefEditorProjectionItem = DefEditorProjectionIndent | DefEditorProjectionText | DefEditorSubProjection | DefEditorProjectionExpression;

export class MetaEditorProjectionLine {
    items: DefEditorProjectionItem[];

    toString(): string {
        return this.items.map(item => item.toString()).join("");
    }
}

export class DefEditorProjection {
    name: string;
    conceptEditor: DefEditorConcept;
    lines: MetaEditorProjectionLine[];

    toString() {
        return `projection ${this.name}
${this.lines.map(line => line.toString()).join("")}
`;
    }
}
