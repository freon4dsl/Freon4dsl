import { RHSPropEntry } from "./RHSPropEntry";
import { PiPrimitiveProperty } from "../../../../languagedef/metalanguage";
import { getPrimCall, makeIndent } from "../GrammarUtils";
import { internalTransformNode, ParserGenUtil } from "../../ParserGenUtil";

export class RHSPrimEntry extends RHSPropEntry {
    constructor(prop: PiPrimitiveProperty) {
        super(prop);
        this.isList = false;
    }

    toGrammar(): string {
        return `${getPrimCall(this.property.type.referred)}` + this.doNewline();
    }

    toMethod(propIndex: number, nodeName: string): string {
        return `${ParserGenUtil.internalName(this.property.name)} = this.${internalTransformNode}(${nodeName}[${propIndex}]); // RHSPrimEntry\n`;
    }

    toString(depth: number): string {
        let indent = makeIndent(depth);
        return indent + "RHSPrimEntry: " + this.property.name;
    }
}
