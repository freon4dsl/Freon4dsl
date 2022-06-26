import { RHSPropEntry } from "./RHSPropEntry";
import { PiPrimitiveProperty } from "../../../../languagedef/metalanguage";
import { getPrimCall, makeIndent } from "../GrammarUtils";
import { GenerationUtil } from "../../../../utils";
import { internalTransformList, ParserGenUtil } from "../../ParserGenUtil";

export class RHSPrimListEntry extends RHSPropEntry {
    constructor(prop: PiPrimitiveProperty) {
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
        let indent = makeIndent(depth);
        return indent + "RHSPrimListEntry: " + this.property.name;
    }
}
