import { RHSPropPartWithSeparator } from "./RHSPropPartWithSeparator.js";
import { FreMetaProperty } from "../../../../languagedef/metalanguage/index.js";
import { getPrimCall, makeIndent } from "../GrammarUtils.js";
import { internalTransformPrimList, ParserGenUtil } from "../../ParserGenUtil.js";
import { GenerationUtil } from "../../../../utils/index.js";

export class RHSPrimListEntryWithSeparator extends RHSPropPartWithSeparator {
    constructor(prop: FreMetaProperty, separatorText: string) {
        super(prop, separatorText);
        this.isList = true;
    }

    toGrammar(): string {
        return `[ ${getPrimCall(this.property.type)} / '${this.separatorText}' ]*` + this.doNewline();
    }

    toMethod(index: number, nodeName: string, mainAnalyserName: string): string {
        const baseType: string = GenerationUtil.getBaseTypeAsString(this.property);
        return `${ParserGenUtil.internalName(this.property.name)} = 
            this.${mainAnalyserName}.${internalTransformPrimList}<${baseType}>(${nodeName}.asJsReadonlyArrayView()[${index}].toArray(), PrimValueType.${baseType}, '${this.separatorText}') as ${baseType}[]; // RHSPrimListEntryWithSeparator\n`;
    }

    toString(depth: number): string {
        const indent = makeIndent(depth);
        return indent + "RHSPrimListEntryWithSeparator: " + this.property.name;
    }
}
