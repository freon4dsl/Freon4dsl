import { RHSPropPartWithSeparator } from "./RHSPropPartWithSeparator.js";
import { FreMetaProperty } from "../../../../languagedef/metalanguage/index.js";
import { getTypeCall, makeIndent } from "../GrammarUtils.js";
import { GenerationUtil } from "../../../../utils/index.js";
import { internalTransformPartList, ParserGenUtil } from "../../ParserGenUtil.js";

export class RHSPartListWithSeparator extends RHSPropPartWithSeparator {
    constructor(prop: FreMetaProperty, separatorText: string) {
        super(prop, separatorText);
        this.isList = true;
    }

    toGrammar(): string {
        return `[ ${getTypeCall(this.property.type)} / '${this.separatorText}' ]*` + this.doNewline();
    }

    toMethod(index: number, nodeName: string, mainAnalyserName: string): string {
        const baseType: string = GenerationUtil.getBaseTypeAsString(this.property);
        return `${ParserGenUtil.internalName(this.property.name)} = this.${mainAnalyserName}.${internalTransformPartList}<${baseType}>(${nodeName}.asJsReadonlyArrayView()[${index}], '${this.separatorText}'); // RHSPartListWithSeparator\n`;
    }

    toString(depth: number): string {
        const indent = makeIndent(depth);
        return indent + "RHSPartListEntryWithSeparator: " + this.property.name;
    }
}
