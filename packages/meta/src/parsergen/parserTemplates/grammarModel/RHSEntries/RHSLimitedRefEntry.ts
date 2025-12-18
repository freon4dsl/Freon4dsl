import { RHSPropEntry } from "./RHSPropEntry.js";
import type { FreMetaProperty } from "../../../../languagedef/metalanguage/index.js";
import { getTypeCall, makeIndent } from "../GrammarUtils.js";
import { ParserGenUtil } from '../../ParserGenUtil.js';
import { GenerationUtil } from '../../../../utils/on-lang/index.js';

export class RHSLimitedRefEntry extends RHSPropEntry {
    constructor(prop: FreMetaProperty) {
        super(prop);
        this.isList = false;
    }

    toGrammar(): string {
        return `${getTypeCall(this.property.type)}` + this.doNewline();
    }

    toMethod(index: number, nodeName: string): string {
        const baseType: string = GenerationUtil.getBaseTypeAsString(this.property);
        return `${ParserGenUtil.internalName(this.property.name)} = ${nodeName}.asJsReadonlyArrayView()[${index}] as FreNodeReference<${baseType}>; // RHSLimitedRefEntry\n`
    }

    toString(depth: number): string {
        const indent = makeIndent(depth);
        return indent + "RHSLimitedRefEntry: " + this.property.name;
    }
}
