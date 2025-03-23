import { RHSPropPartWithSeparator } from "./RHSPropPartWithSeparator.js";
import { RHSPropEntry } from "./RHSPropEntry.js";
import { FreMetaProperty } from "../../../../languagedef/metalanguage/index.js";
import { GenerationUtil } from "../../../../utils/index.js";
import { internalTransformPrimList, ParserGenUtil } from "../../ParserGenUtil.js";
import { makeIndent } from "../GrammarUtils.js";

export class RHSPrimListGroupWithInitiator extends RHSPropPartWithSeparator {
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
        return  `// RHSPrimListGroupWithInitiator
            if (!!${nodeName}.asJsReadonlyArrayView()[${index}]) {
            ${ParserGenUtil.internalName(this.property.name)} = [];
            const subNode = ${nodeName}.asJsReadonlyArrayView()[2];
            for (let child of subNode.asJsReadonlyArrayView()) {
                const res = this.${mainAnalyserName}.${internalTransformPrimList}<${baseType}>(child.asJsReadonlyArrayView(), PrimValueType.${baseType}, '${this.separatorText}')
                ${ParserGenUtil.internalName(this.property.name)}.push(...res);
            }
        } // end RHSPrimListGroupWithInitiator`;
    }

    toString(depth: number): string {
        const indent = makeIndent(depth + 1);
        return indent + "RHSPrimListGroupWithInitiator: " + indent + this.entry.toString(depth + 1) + " " + this.separatorText;
    }
}
