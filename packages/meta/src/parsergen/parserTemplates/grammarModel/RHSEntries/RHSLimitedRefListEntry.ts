import { RHSPropEntry } from "./RHSPropEntry.js";
import { FreMetaProperty } from "../../../../languagedef/metalanguage/index.js";
import { getTypeCall, makeIndent } from "../GrammarUtils.js";

import { internalTransformLimitedList, ParserGenUtil } from '../../ParserGenUtil.js';
import { GenerationUtil } from '../../../../utils/on-lang/GenerationUtil.js';

export class RHSLimitedRefListEntry extends RHSPropEntry {
    constructor(prop: FreMetaProperty) {
        super(prop);
        this.isList = false;
    }

    toGrammar(): string {
        return `${getTypeCall(this.property.type)}*` + this.doNewline();
    }

    toMethod(index: number, nodeName: string, mainAnalyserName: string): string {
        const baseType: string = GenerationUtil.getBaseTypeAsString(this.property);
        return `${ParserGenUtil.internalName(this.property.name)} = this.${mainAnalyserName}.${internalTransformLimitedList}<${baseType}>(${nodeName}.asJsReadonlyArrayView()[${index}]); // RHSLimitedRefListEntry\n`;
    }

    toString(depth: number): string {
        const indent = makeIndent(depth);
        return indent + "RHSLimitedRefListEntry: " + this.property.name;
    }
}
