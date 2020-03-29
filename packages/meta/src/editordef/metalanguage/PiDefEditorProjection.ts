import { PiDefEditorConcept } from "./PiDefEditorConcept";

export class PiDefEditorNewline {
    toString(): string {
        return "\n";
    }
}

export class PiDefEditorProjectionIndent {
    indent: string = ";";

    toString() : string {
        return this.indent.replace(/ /g, "_");
    }
}

export class PiDefEditorProjectionText {
    text: string = "";
    toString() : string {
        return this.text;
    }
}

export enum Direction {
    NONE="NONE",
    Horizontal="Horizontal",
    Vertical="Vertical"
}

export enum ListJoinType {
    NONE= "NONE",
    Terminator="Terminator",
    Separator="Separator"
}

export class ListJoin {
    direction: Direction = Direction.Horizontal;
    joinType?: ListJoinType;
    joinText?: string;

    toString(): string {
        return `direction ${this.direction} joinType: ${this.joinType} text: "${this.joinText}"`;
    }
}

export class PiDefEditorSubProjection {
    propertyName: string = "";
    listJoin: ListJoin;

    toString() : string {
        return "[-[" + this.propertyName + (!!(this.listJoin)? " " + this.listJoin.toString() : "" ) + "]-]";
    }

}

export class PiDefEditorProjectionExpression {
    propertyName: string = "";
}

type PiDefEditorProjectionItem =
    PiDefEditorProjectionIndent
    | PiDefEditorProjectionText
    | PiDefEditorSubProjection
    | PiDefEditorProjectionExpression;

export class PiDefEditorProjectionLine {
    items: PiDefEditorProjectionItem[];

    toString(): string {
        return this.items.map(item => item.toString()).join("");
    }
}

export class PiDefEditorProjection {
    name: string;
    conceptEditor: PiDefEditorConcept;
    lines: PiDefEditorProjectionLine[];

    toString() {
        return `projection ${this.name}
${this.lines.map(line => line.toString()).join("")}
`
    }
}
