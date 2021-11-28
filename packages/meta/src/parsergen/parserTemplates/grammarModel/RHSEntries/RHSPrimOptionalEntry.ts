import { RHSPropEntry } from "./RHSPropEntry";
import { PiPrimitiveProperty } from "../../../../languagedef/metalanguage";
import { getPrimCall, makeIndent } from "../GrammarUtils";
import { internalTransformNode, ParserGenUtil } from "../../ParserGenUtil";

export class RHSPrimOptionalEntry extends RHSPropEntry {
    constructor(prop: PiPrimitiveProperty) {
        super(prop);
        this.isList = false;
    }

    toGrammar(): string {
        return `${getPrimCall(this.property.type.referred)}?` + this.doNewline();
    }

    toMethod(propIndex: number, nodeName: string): string {
        return `// RHSPrimOptionalEntry
            if (!${nodeName}[${propIndex}].isEmptyMatch) {
                // take the first element of the group that represents the optional part  
                const subNode = this.getGroup(${nodeName}[${propIndex}]).nonSkipChildren.toArray()[0];
                ${ParserGenUtil.internalName(this.property.name)} = this.${internalTransformNode}(subNode);
            }`;
    }

    toString(depth: number): string {
        let indent = makeIndent(depth);
        return indent + "RHSPrimEntry: " + this.property.name;
    }
}
