import { RHSPropEntry } from "./RHSPropEntry";
import { PiProperty } from "../../../../languagedef/metalanguage";
import { getTypeCall, makeIndent } from "../GrammarUtils";
import { getBaseTypeAsString } from "../../../../utils";

export class RHSLimitedRefEntry extends RHSPropEntry {
    constructor(prop: PiProperty) {
        super(prop);
        this.isList = false;
    }

    toGrammar(): string {
        return `${getTypeCall(this.property.type.referred)}` + this.doNewline();
    }

    toMethod(propIndex: number, nodeName: string): string {
        const baseType: string = getBaseTypeAsString(this.property);
        return `${this.property.name} = this.piElemRef<${baseType}>(${nodeName}[${propIndex}], '${baseType}'); // RHSLimitedRefEntry\n`;
    }

    toString(depth: number): string {
        let indent = makeIndent(depth);
        return indent + "RHSLimitedRefEntry: " + this.property.name;
    }
}
