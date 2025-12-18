import { RHSPropEntry } from "./RHSPropEntry.js";
import type { FreMetaPrimitiveProperty } from "../../../../languagedef/metalanguage/index.js";
import { getPrimCall, makeIndent } from "../GrammarUtils.js";

import { internalTransformPrimList, ParserGenUtil } from "../../ParserGenUtil.js";
import { GenerationUtil } from '../../../../utils/on-lang/GenerationUtil.js';

export class RHSPrimListEntry extends RHSPropEntry {
    constructor(prop: FreMetaPrimitiveProperty) {
        super(prop);
        this.isList = true;
    }

    toGrammar(): string {
        return `${getPrimCall(this.property.type)}*` + this.doNewline();
    }

    toMethod(index: number, nodeName: string, mainAnalyserName: string): string {
        const tsBaseType: string = GenerationUtil.getBaseTypeAsString(this.property);
        const freonBaseType: string = GenerationUtil.getFreonBaseTypeAsString(this.property);
        return `${ParserGenUtil.internalName(this.property.name)} = 
            this.${mainAnalyserName}.${internalTransformPrimList}<${tsBaseType}>(${nodeName}.asJsReadonlyArrayView()[${index}].asJsReadonlyArrayView(), PrimValueType.${freonBaseType}); // RHSPrimListEntry\n`;
    }

    toString(depth: number): string {
        const indent = makeIndent(depth);
        return indent + "RHSPrimListEntry: " + this.property.name;
    }
}
