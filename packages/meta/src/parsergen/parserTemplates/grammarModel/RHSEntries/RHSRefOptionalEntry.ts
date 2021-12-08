import { RHSPropEntry } from "./RHSPropEntry";
import { PiProperty } from "../../../../languagedef/metalanguage";
import { getBaseTypeAsString } from "../../../../utils";
import { makeIndent, refRuleName } from "../GrammarUtils";
import { ParserGenUtil } from "../../ParserGenUtil";

export class RHSRefOptionalEntry extends RHSPropEntry {
    constructor(prop: PiProperty) {
        super(prop);
        this.isList = false;
    }

    toGrammar(): string {
        return `${refRuleName}?` + this.doNewline();
    }

    toMethod(index: number, nodeName: string, mainAnalyserName: string): string {
        const baseType: string = getBaseTypeAsString(this.property);
        return `// RHSRefOptionalEntry
            if (!${nodeName}[${index}].isEmptyMatch) {
                // take the first element of the group that represents the optional part  
                const subNode = this.${mainAnalyserName}.getGroup(${nodeName}[${index}]).nonSkipChildren.toArray()[0];
                ${ParserGenUtil.internalName(this.property.name)} = this.${mainAnalyserName}.piElemRef<${baseType}>(subNode, '${baseType}');
            }`;
    }

    toString(depth: number): string {
        let indent = makeIndent(depth);
        return indent + "RHSRefEntry: " + this.property.name;
    }
}
