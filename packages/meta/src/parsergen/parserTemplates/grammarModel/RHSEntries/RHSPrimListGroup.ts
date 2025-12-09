import { RHSPropPartWithSeparator } from "./RHSPropPartWithSeparator.js";
import type { RHSPropEntry } from "./RHSPropEntry.js";
import type { FreMetaProperty } from "../../../../languagedef/metalanguage/index.js";
import {internalTransformPrimValue, ParserGenUtil} from "../../ParserGenUtil.js";
import { makeIndent } from "../GrammarUtils.js";
import { GenerationUtil } from '../../../../utils/on-lang/GenerationUtil.js';

export class RHSPrimListGroup extends RHSPropPartWithSeparator {
    // `(${propTypeName} '${joinText}' )* /* option C */`
    private entry: RHSPropEntry;

    constructor(prop: FreMetaProperty, entry: RHSPropEntry, separator: string) {
        super(prop, separator);
        this.entry = entry;
    }

    toGrammar(): string {
        return `( ${this.entry.toGrammar()} '${this.separatorText}' )*\n\t`;
    }

    toMethod(index: number, nodeName: string): string {
        const tsBaseType: string = GenerationUtil.getBaseTypeAsString(this.property);
        const freonBaseType: string = GenerationUtil.getFreonBaseTypeAsString(this.property);
        return `// RHSPrimListGroup
            if (!!${nodeName}.asJsReadonlyArrayView()[${index}]) {
                ${ParserGenUtil.internalName(this.property.name)} = [];
                ${nodeName}.asJsReadonlyArrayView()[${index}].asJsReadonlyArrayView().forEach((item: KtList<any>) => {
                    const val = this.mainAnalyser.${internalTransformPrimValue}<${tsBaseType}>(item.asJsReadonlyArrayView()[0], PrimValueType.${freonBaseType})
                    ${ParserGenUtil.internalName(this.property.name)}.push(val);
                })
            }`;
    }

    toString(depth: number): string {
        const indent = makeIndent(depth + 1);
        return indent + "RHSListGroup: " + indent + this.entry.toString(depth + 1) + " " + this.separatorText;
    }
}
