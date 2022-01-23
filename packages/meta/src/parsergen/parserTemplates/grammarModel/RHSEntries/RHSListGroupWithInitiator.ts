import { RHSPropPartWithSeparator } from "./RHSPropPartWithSeparator";
import { RHSPropEntry } from "./RHSPropEntry";
import { PiProperty } from "../../../../languagedef/metalanguage";
import { internalTransformNode, ParserGenUtil } from "../../ParserGenUtil";
import { makeIndent } from "../GrammarUtils";

export class RHSListGroupWithInitiator extends RHSPropPartWithSeparator {
    // `("joinText" propTypeName)*`
    private entry: RHSPropEntry;

    constructor(prop: PiProperty, entry: RHSPropEntry, separator: string) {
        super(prop, separator);
        this.entry = entry;
        this.isList = true;
    }

    toGrammar(): string {
        return `( '${this.separatorText}' ${this.entry.toGrammar()} )*\n\t`;
    }

    toMethod(index: number, nodeName: string, mainAnalyserName: string): string {
        return `// RHSListGroupWithInitiator  
            if (!${nodeName}[${index}].isEmptyMatch) {          
                ${ParserGenUtil.internalName(this.property.name)} = [];
                for (const subNode of ${nodeName}[${index}].nonSkipChildren.toArray()) {
                    ${ParserGenUtil.internalName(this.property.name)}.push(this.${mainAnalyserName}.${internalTransformNode}(this.${mainAnalyserName}.getGroup(subNode).nonSkipChildren.toArray()[1]));
                }
            }`;
    }

    toString(depth: number): string {
        let indent = makeIndent(depth + 1);
        return indent + "RHSListGroup: " + indent + this.separatorText + " " + this.entry.toString(depth + 1);
    }
}
