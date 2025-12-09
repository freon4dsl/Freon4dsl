import { RHSPropEntry } from "./RHSPropEntry.js";
import type { FreMetaProperty } from "../../../../languagedef/metalanguage/index.js";
import { getTypeCall, makeIndent } from "../GrammarUtils.js";
import { ParserGenUtil } from "../../ParserGenUtil.js";
import { GenerationUtil } from '../../../../utils/on-lang/index.js';

export class RHSPartListEntry extends RHSPropEntry {
    constructor(prop: FreMetaProperty) {
        super(prop);
        this.property = prop;
        this.isList = true;
    }

    toGrammar(): string {
        return `${getTypeCall(this.property.type)}*` + this.doNewline();
    }

    toMethod(index: number, nodeName: string): string {
        const baseType: string = GenerationUtil.getBaseTypeAsString(this.property);
        return `${ParserGenUtil.internalName(this.property.name)} = (${nodeName}.asJsReadonlyArrayView()[${index}] as KtList<any>).asJsReadonlyArrayView() as ${baseType}[]; // RHSPartListEntry\n`;
    }

    toString(depth: number): string {
        const indent = makeIndent(depth);
        return indent + "RHSPartListEntry: " + this.property.name;
    }
}
