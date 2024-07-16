import { RHSPropPartWithSeparator } from "./RHSPropPartWithSeparator.js";
import { RHSPropEntry } from "./RHSPropEntry.js";
import { FreMetaProperty } from "../../../../languagedef/metalanguage/index.js";
import { internalTransformNode, ParserGenUtil } from "../../ParserGenUtil.js";
import { makeIndent } from "../GrammarUtils.js";

export class RHSPartListWithInitiator extends RHSPropPartWithSeparator {
    // `("joinText" propTypeName)*`
    private entry: RHSPropEntry;

    constructor(prop: FreMetaProperty, entry: RHSPropEntry, separator: string) {
        super(prop, separator);
        this.entry = entry;
        this.isList = true;
    }

    toGrammar(): string {
        return `( '${this.separatorText}' ${this.entry.toGrammar()} )*` + this.doNewline();
    }

    toMethod(index: number, nodeName: string, mainAnalyserName: string): string {
        return `
        // RHSPartListWithInitiator
        if (!${nodeName}[${index}].isEmptyMatch) {
            ${ParserGenUtil.internalName(this.property.name)} = [];
            const group = this.${mainAnalyserName}.getGroup(${nodeName}[${index}]);
            if (group !== ${nodeName}[${index}]) {
                for (const child of ${nodeName}[${index}].nonSkipChildren.toArray()) {
                    ${ParserGenUtil.internalName(this.property.name)}.push(this.${mainAnalyserName}.${internalTransformNode}(child.nonSkipChildren.toArray()[1]));
                }
            } else {
                for (const child of ${nodeName}) {
                    ${ParserGenUtil.internalName(this.property.name)}.push(this.${mainAnalyserName}.${internalTransformNode}(child.nonSkipChildren.toArray()[1]));
                }
            }
        } // end RHSPartListWithInitiator
        `;
    }

    toString(depth: number): string {
        const indent = makeIndent(depth + 1);
        return indent + "RHSListGroup: " + indent + this.separatorText + " " + this.entry.toString(depth + 1);
    }
}
