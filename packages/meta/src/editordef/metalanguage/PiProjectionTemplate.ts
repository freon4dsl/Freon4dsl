import { PiConceptEditor } from "./PiConceptEditor";

export class PiProjectionIndent {
    indent: string = ";"
}

export class PiProjectionText {
    text: string = "";
}

export class PiProjectionPropertyReference {
    propertyName: string = "";
}

type ProjectionItem = PiProjectionIndent | PiProjectionText | PiProjectionPropertyReference;

export class  PiProjectionLine {
    items: ProjectionItem[];
}

export class PiProjectionTemplate {
    conceptEditor: PiConceptEditor;
    lines: PiProjectionLine[];

    // asString() : string {
    //     return this.lines.map()
    // }
}
