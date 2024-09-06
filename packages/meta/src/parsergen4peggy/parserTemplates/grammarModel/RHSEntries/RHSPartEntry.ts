import { RHSPropEntry } from "./RHSPropEntry.js";
import { FreMetaProperty } from "../../../../languagedef/metalanguage/index.js";
import { getTypeCall, makeIndent } from "../GrammarUtils.js";
import { ParserGenUtil } from "../../ParserGenUtil.js";

export class RHSPartEntry extends RHSPropEntry {
    private readonly projectionName: string = "";

    constructor(prop: FreMetaProperty, projectionName: string) {
        super(prop);
        this.isList = false;
        this.projectionName = projectionName;
    }

    toGrammar(): string {
        return `${ParserGenUtil.internalName(this.property.name)}:${getTypeCall(this.property.type, this.projectionName)}` + this.doNewline();
    }

    // @ts-ignore
    toMethod(index: number, nodeName: string, mainAnalyserName: string): string {
        return `${this.property.name}: ${ParserGenUtil.internalName(this.property.name)} // RHSPartEntry\n`;
    }

    toString(depth: number): string {
        return makeIndent(depth) + "RHSPartEntry: " + this.property.name;
    }
}
