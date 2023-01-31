import { RHSPropEntry } from "./RHSPropEntry";
import { FreProperty } from "../../../../languagedef/metalanguage";
import { GenerationUtil } from "../../../../utils";
import { makeIndent, refRuleName } from "../GrammarUtils";
import { ParserGenUtil } from "../../ParserGenUtil";

export class RHSRefEntry extends RHSPropEntry {
    constructor(prop: FreProperty) {
        super(prop);
        this.isList = false;
    }

    toGrammar(): string {
        return refRuleName + this.doNewline();
    }

    toMethod(index: number, nodeName: string, mainAnalyserName: string): string {
        const baseType: string = GenerationUtil.getBaseTypeAsString(this.property);
        return `${ParserGenUtil.internalName(this.property.name)} = this.${mainAnalyserName}.piElemRef<${baseType}>(${nodeName}[${index}], '${baseType}'); // RHSRefEntry\n`;
    }

    toString(depth: number): string {
        let indent = makeIndent(depth);
        return indent + "RHSRefEntry: " + this.property.name;
    }
}
