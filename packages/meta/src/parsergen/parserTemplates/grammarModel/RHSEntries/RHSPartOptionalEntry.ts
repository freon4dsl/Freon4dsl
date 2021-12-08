import { RHSPropEntry } from "./RHSPropEntry";
import { PiProperty } from "../../../../languagedef/metalanguage";
import { getTypeCall, makeIndent } from "../GrammarUtils";
import { getBaseTypeAsString } from "../../../../utils";
import { internalTransformNode, ParserGenUtil } from "../../ParserGenUtil";

export class RHSPartOptionalEntry extends RHSPropEntry {
    constructor(prop: PiProperty) {
        super(prop);
        this.isList = false;
    }

    toGrammar(): string {
        return `${getTypeCall(this.property.type.referred)}?` + this.doNewline();
    }

    toMethod(index: number, nodeName: string, mainAnalyserName: string): string {
        getBaseTypeAsString(this.property);
        return `// RHSPartOptionalEntry
            if (!${nodeName}[${index}].isEmptyMatch) {
                // take the first element of the group that represents the optional part  
                const subNode = this.${mainAnalyserName}.getGroup(${nodeName}[${index}]).nonSkipChildren.toArray()[0];
                ${ParserGenUtil.internalName(this.property.name)} = this.${mainAnalyserName}.${internalTransformNode}(subNode);
            }`;
    }

    toString(depth: number): string {
        let indent = makeIndent(depth);
        return indent + "RHSPartEntry: " + this.property.name;
    }
}
