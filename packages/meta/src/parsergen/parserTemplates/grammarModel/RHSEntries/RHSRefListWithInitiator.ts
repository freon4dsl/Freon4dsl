import { RHSPropPartWithSeparator } from "./RHSPropPartWithSeparator.js";
import type { RHSPropEntry } from "./RHSPropEntry.js";
import type { FreMetaProperty } from "../../../../languagedef/metalanguage/index.js";
import {internalTransformRefList, ParserGenUtil} from "../../ParserGenUtil.js";
import { makeIndent } from "../GrammarUtils.js";
import { GenerationUtil } from '../../../../utils/on-lang/GenerationUtil.js';


export class RHSRefListWithInitiator extends RHSPropPartWithSeparator {
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
        const baseType: string = GenerationUtil.getBaseTypeAsString(this.property);
        return `
        // RHSRefListWithInitiator
        if (!!${nodeName}.asJsReadonlyArrayView()[${index}]) {
            ${ParserGenUtil.internalName(this.property.name)} = [];
            for (const child of ${nodeName}.asJsReadonlyArrayView()[${index}].asJsReadonlyArrayView()) {
                const _transformed = this.${mainAnalyserName}.${internalTransformRefList}<${baseType}>(child, "${baseType}");
                if (!!_transformed) {
                    ${ParserGenUtil.internalName(this.property.name)}.push(_transformed[0]);
                }
            }
        } // end RHSRefListWithInitiator`;
    }

    toString(depth: number): string {
        const indent = makeIndent(depth + 1);
        return indent + "RHSListGroup: " + indent + this.separatorText + " " + this.entry.toString(depth + 1);
    }
}
