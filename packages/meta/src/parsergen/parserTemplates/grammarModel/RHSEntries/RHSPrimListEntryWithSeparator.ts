import { RHSPropPartWithSeparator } from "./RHSPropPartWithSeparator.js";
import { FreMetaProperty } from "../../../../languagedef/metalanguage/index.js";
import { getPrimCall, makeIndent } from "../GrammarUtils.js";
import { internalTransformPrimList, ParserGenUtil } from "../../ParserGenUtil.js";
import { GenerationUtil } from '../../../../utils/on-lang/GenerationUtil.js';


export class RHSPrimListEntryWithSeparator extends RHSPropPartWithSeparator {
    constructor(prop: FreMetaProperty, separatorText: string) {
        super(prop, separatorText);
        this.isList = true;
    }

    toGrammar(): string {
        return `[ ${getPrimCall(this.property.type)} / '${this.separatorText}' ]*` + this.doNewline();
    }

    toMethod(index: number, nodeName: string, mainAnalyserName: string): string {
        const tsBaseType: string = GenerationUtil.getBaseTypeAsString(this.property);
        const freonBaseType: string = GenerationUtil.getFreonBaseTypeAsString(this.property);
        return `${ParserGenUtil.internalName(this.property.name)} = 
            this.${mainAnalyserName}.${internalTransformPrimList}<${tsBaseType}>(${nodeName}.asJsReadonlyArrayView()[${index}].toArray(), PrimValueType.${freonBaseType}, '${this.separatorText}') as ${tsBaseType}[]; // RHSPrimListEntryWithSeparator\n`;
    }

    toString(depth: number): string {
        const indent = makeIndent(depth);
        return indent + "RHSPrimListEntryWithSeparator: " + this.property.name;
    }
}
