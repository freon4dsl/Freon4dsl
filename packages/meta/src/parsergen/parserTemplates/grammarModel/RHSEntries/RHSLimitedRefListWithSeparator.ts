import { RHSPropPartWithSeparator } from "./RHSPropPartWithSeparator.js";
import type { FreMetaProperty } from "../../../../languagedef/metalanguage/index.js";
import { getTypeCall, makeIndent } from "../GrammarUtils.js";

import { internalTransformLimitedList, ParserGenUtil } from '../../ParserGenUtil.js';
import { GenerationUtil } from '../../../../utils/on-lang/GenerationUtil.js';

export class RHSLimitedRefListWithSeparator extends RHSPropPartWithSeparator {
    constructor(prop: FreMetaProperty, separatorText: string) {
        super(prop, separatorText);
        this.isList = true;
    }

    toGrammar(): string {
        return `[ ${getTypeCall(this.property.type)} / '${this.separatorText}' ]*` + this.doNewline();
    }

    toMethod(index: number, nodeName: string, mainAnalyserName: string): string {
        const baseType: string = GenerationUtil.getBaseTypeAsString(this.property);
        return `${ParserGenUtil.internalName(this.property.name)} = 
            this.${mainAnalyserName}.${internalTransformLimitedList}<${baseType}>(${nodeName}.asJsReadonlyArrayView()[${index}] as KtList<any>); // RHSLimitedRefListEntryWithSeparator\n`;
    }

    toString(depth: number): string {
        const indent = makeIndent(depth);
        return indent + "RHSLimitedRefListWithSeparator: " + this.property.name;
    }
}
