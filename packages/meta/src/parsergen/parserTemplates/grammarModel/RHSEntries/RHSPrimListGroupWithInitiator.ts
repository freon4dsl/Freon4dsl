import { RHSPropPartWithSeparator } from "./RHSPropPartWithSeparator.js";
import { RHSPropEntry } from "./RHSPropEntry.js";
import { FreMetaProperty } from "../../../../languagedef/metalanguage/index.js";
import { GenerationUtil } from "../../../../utils/index.js";
import { internalTransformList, ParserGenUtil } from "../../ParserGenUtil.js";
import { makeIndent } from "../GrammarUtils.js";

export class RHSPrimListGroupWithInitiator extends RHSPropPartWithSeparator {
    // `("joinText" propTypeName)*`
    private entry: RHSPropEntry;

    constructor(prop: FreMetaProperty, entry: RHSPropEntry, separator: string) {
        super(prop, separator);
        this.entry = entry;
    }

    toGrammar(): string {
        return `( '${this.separatorText}' ${this.entry.toGrammar()} )*\n\t`;
    }

    toMethod(index: number, nodeName: string, mainAnalyserName: string): string {
        const baseType: string = GenerationUtil.getBaseTypeAsString(this.property);
        return `// RHSPrimListGroupWithInitiator
            if (!${nodeName}[${index}].isEmptyMatch) {
                // get the group that represents the optional primitive
                // because primitives are leafs in the grammar, there is no need to get the children of this group
                const subNode = this.${mainAnalyserName}.getGroup(${nodeName}[${index}]);
                ${ParserGenUtil.internalName(this.property.name)} = this.${mainAnalyserName}.${internalTransformList}<${baseType}>(subNode, '${this.separatorText}');
            }`;
    }

    toString(depth: number): string {
        const indent = makeIndent(depth + 1);
        return indent + "RHSListGroup: " + indent + this.entry.toString(depth + 1) + " " + this.separatorText;
    }
}
