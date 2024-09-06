import { RHSPropEntry } from "./RHSPropEntry.js";
import { FreMetaProperty } from "../../../../languagedef/metalanguage/index.js";
import { getTypeCall, makeIndent } from "../GrammarUtils.js";
import { ParserGenUtil } from "../../ParserGenUtil.js";

export class RHSLimitedRefOptionalEntry extends RHSPropEntry {
    constructor(prop: FreMetaProperty) {
        super(prop);
        this.isList = false;
    }

    toGrammar(): string {
        return `${ParserGenUtil.internalName(this.property.name)}:${getTypeCall(this.property.type)}?` + this.doNewline();
    }

    //  @ts-ignore
    toMethod(index: number, nodeName: string, mainAnalyserName: string): string {
        return `// RHSLimitedRefOptionalEntry
            ${this.property.name}: ${ParserGenUtil.internalName(this.property.name)}`;
    }

    toString(depth: number): string {
        const indent = makeIndent(depth);
        return indent + "RHSLimitedRefEntry: " + this.property.name;
    }
}
