import { RHSPropEntry } from "./RHSPropEntry";
import { PiPrimitiveProperty } from "../../../../languagedef/metalanguage";
import { getPrimCall, makeIndent } from "../GrammarUtils";
import { getBaseTypeAsString } from "../../../../utils";

export class RHSPrimListEntry extends RHSPropEntry {
    constructor(prop: PiPrimitiveProperty) {
        super(prop);
        this.isList = true;
    }

    toGrammar(): string {
        return `${getPrimCall(this.property.type.referred)}*` + this.doNewline();
    }

    toMethod(propIndex: number, nodeName: string): string {
        const baseType: string = getBaseTypeAsString(this.property);
        return `${this.property.name} = this.transformSharedPackedParseTreeList<${baseType}>(${nodeName}[${propIndex}]); // RHSPrimListEntry\n`;
    }

    toString(depth: number): string {
        let indent = makeIndent(depth);
        return indent + "RHSPrimListEntry: " + this.property.name;
    }
}
