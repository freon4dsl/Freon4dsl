import { RHSPropEntry } from "./RHSPropEntry.js";
import { FreMetaPrimitiveProperty } from "../../../../languagedef/metalanguage/index.js";
import { getPrimCall, makeIndent } from "../GrammarUtils.js";
import { internalTransformNode, ParserGenUtil } from "../../ParserGenUtil.js";

// todo remove this class, or change toMethod
// RHSPrimOptionalEntry is never used, because optionality of primitive values is ignored.
export class RHSPrimOptionalEntry extends RHSPropEntry {
    constructor(prop: FreMetaPrimitiveProperty) {
        super(prop);
        this.isList = false;
    }

    toGrammar(): string {
        return `${getPrimCall(this.property.type)}?` + this.doNewline();
    }

    toMethod(index: number, nodeName: string, mainAnalyserName: string): string {
        // todo nonSkip, getGroup
        return `// RHSPrimOptionalEntry
            if (!!${nodeName}[${index}]) {
                // take the first element of the group that represents the optional part
                const subNode = this.${mainAnalyserName}.getGroup(${nodeName}[${index}]).nonSkipChildren.toArray()[0];
                ${ParserGenUtil.internalName(this.property.name)} = this.${mainAnalyserName}.${internalTransformNode}(subNode);
            }`;
    }

    toString(depth: number): string {
        const indent = makeIndent(depth);
        return indent + "RHSPrimEntry: " + this.property.name;
    }
}
