import { RHSPropPartWithSeparator } from "./RHSPropPartWithSeparator.js";
import { RHSPropEntry } from "./RHSPropEntry.js";
import { FreMetaProperty } from "../../../../languagedef/metalanguage/index.js";

import { internalTransformPrimList, ParserGenUtil } from "../../ParserGenUtil.js";
import { makeIndent } from "../GrammarUtils.js";
import { GenerationUtil } from '../../../../utils/on-lang/GenerationUtil.js';

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
        const tsBaseType: string = GenerationUtil.getBaseTypeAsString(this.property);
        const freonBaseType: string = GenerationUtil.getFreonBaseTypeAsString(this.property);
        return  `// RHSPrimListGroupWithInitiator
            if (!!${nodeName}.asJsReadonlyArrayView()[${index}]) {
            ${ParserGenUtil.internalName(this.property.name)} = [];
            const subNode = ${nodeName}.asJsReadonlyArrayView()[2];
            for (let child of subNode.asJsReadonlyArrayView()) {
                const res = this.${mainAnalyserName}.${internalTransformPrimList}<${tsBaseType}>(child.asJsReadonlyArrayView(), PrimValueType.${freonBaseType}, '${this.separatorText}')
                ${ParserGenUtil.internalName(this.property.name)}.push(...res);
            }
        } // end RHSPrimListGroupWithInitiator`;
    }

    toString(depth: number): string {
        const indent = makeIndent(depth + 1);
        return indent + "RHSPrimListGroupWithInitiator: " + indent + this.entry.toString(depth + 1) + " " + this.separatorText;
    }
}
