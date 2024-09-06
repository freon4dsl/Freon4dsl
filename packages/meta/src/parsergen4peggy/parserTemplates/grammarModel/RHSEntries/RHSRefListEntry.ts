import { RHSPropEntry } from "./RHSPropEntry.js";
import { FreMetaProperty } from "../../../../languagedef/metalanguage/index.js";
import { ParserGenUtil } from "../../ParserGenUtil.js";
import { makeIndent, refRuleName } from "../GrammarUtils.js";

export class RHSRefListEntry extends RHSPropEntry {
    constructor(prop: FreMetaProperty) {
        super(prop);
        this.isList = true;
    }

    toGrammar(): string {
        return `${ParserGenUtil.internalName(this.property.name)}:${refRuleName}*` + this.doNewline();
    }

    //  @ts-ignore
    toMethod(index: number, nodeName: string, mainAnalyserName: string): string {
        return `${this.property.name}: ${ParserGenUtil.internalName(this.property.name)} // RHSRefListEntry\n`;
    }

    toString(depth: number): string {
        const indent = makeIndent(depth);
        return indent + "RHSRefListEntry: " + this.property.name;
    }
}
