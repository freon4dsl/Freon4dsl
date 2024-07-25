import { RHSPropEntry } from "./RHSPropEntry.js";
import { FreMetaPrimitiveProperty } from "../../../../languagedef/metalanguage/index.js";
import { getPrimCall, makeIndent } from "../GrammarUtils.js";
import { GenerationUtil } from "../../../../utils/index.js";
import { internalTransformList, ParserGenUtil } from "../../ParserGenUtil.js";

export class RHSPrimListEntry extends RHSPropEntry {
    constructor(prop: FreMetaPrimitiveProperty) {
        super(prop);
        this.isList = true;
    }

    toGrammar(): string {
        return `${getPrimCall(this.property.type)}*` + this.doNewline();
    }

    toMethod(index: number, nodeName: string, mainAnalyserName: string): string {
        const baseType: string = GenerationUtil.getBaseTypeAsString(this.property);
        return `${ParserGenUtil.internalName(this.property.name)} = this.${mainAnalyserName}.${internalTransformList}<${baseType}>(${nodeName}[${index}]); // RHSPrimListEntry\n`;
    }

    toString(depth: number): string {
        const indent = makeIndent(depth);
        return indent + "RHSPrimListEntry: " + this.property.name;
    }
}
