import { RHSPropEntry } from "./RHSPropEntry.js";
import { FreMetaProperty } from "../../../../languagedef/metalanguage/index.js";
import { getTypeCall, makeIndent } from "../GrammarUtils.js";
import { ParserGenUtil } from "../../ParserGenUtil.js";

export class RHSPartListEntry extends RHSPropEntry {
    constructor(prop: FreMetaProperty) {
        super(prop);
        this.property = prop;
        this.isList = true;
    }

    toGrammar(): string {
        return `${ParserGenUtil.internalName(this.property.name)}:${getTypeCall(this.property.type)}*` + this.doNewline();
    }

    // @ts-ignore
    toMethod(index: number, nodeName: string, mainAnalyserName: string): string {
        // const baseType: string = GenerationUtil.getBaseTypeAsString(this.property);
        return `${this.property.name}: ${ParserGenUtil.internalName(this.property.name)} // RHSPartListEntry
        `;
    }

    toString(depth: number): string {
        const indent = makeIndent(depth);
        return indent + "RHSPartListEntry: " + this.property.name;
    }
}
