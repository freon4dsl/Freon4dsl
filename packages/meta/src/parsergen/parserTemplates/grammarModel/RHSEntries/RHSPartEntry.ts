import { RHSPropEntry } from "./RHSPropEntry.js";
import type { FreMetaProperty } from "../../../../languagedef/metalanguage/index.js";
import { getTypeCall, makeIndent } from "../GrammarUtils.js";
import { ParserGenUtil } from "../../ParserGenUtil.js";
import { GenerationUtil } from '../../../../utils/on-lang/GenerationUtil.js';

export class RHSPartEntry extends RHSPropEntry {
    private readonly projectionName: string = "";

    constructor(prop: FreMetaProperty, projectionName: string) {
        super(prop);
        this.isList = false;
        this.projectionName = projectionName;
    }

    toGrammar(): string {
        return `${getTypeCall(this.property.type, this.projectionName)}` + this.doNewline();
    }

    toMethod(index: number, nodeName: string): string {
        const baseType: string = GenerationUtil.getBaseTypeAsString(this.property);
        return `${ParserGenUtil.internalName(this.property.name)} = ${nodeName}.asJsReadonlyArrayView()[${index}] as ${baseType}; // RHSPartEntry\n`;
    }

    toString(depth: number): string {
        const indent = makeIndent(depth);
        return indent + "RHSPartEntry: " + this.property.name;
    }
}
