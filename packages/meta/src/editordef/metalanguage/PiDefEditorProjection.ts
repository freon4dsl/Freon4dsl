import { PiDefEditorConcept } from "./PiDefEditorConcept";

export class PiDefEditorProjectionIndent {
    indent: string = ";"
}

export class PiDefEditorProjectionText {
    text: string = "";
}

export class PiDefEditorProjectionPropertyReference {
    propertyName: string = "";
}

type PiDefEditorProjectionItem = PiDefEditorProjectionIndent | PiDefEditorProjectionText | PiDefEditorProjectionPropertyReference;

export class  PiDefEditorProjectionLine {
    items: PiDefEditorProjectionItem[];
}

export class PiDefEditorProjection {
    conceptEditor: PiDefEditorConcept;
    lines: PiDefEditorProjectionLine[];

    // asString() : string {
    //     return this.lines.map()
    // }
}
