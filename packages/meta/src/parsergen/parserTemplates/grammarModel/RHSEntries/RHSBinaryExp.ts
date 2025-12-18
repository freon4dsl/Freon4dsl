import { RHSPropEntry } from "./RHSPropEntry.js";
import type {
    FreMetaBinaryExpressionConcept,
    FreMetaProperty} from '../../../../languagedef/metalanguage/index.js';
import {
    LangUtil
} from '../../../../languagedef/metalanguage/index.js';
import { makeIndent } from "../GrammarUtils.js";
import { BinaryExpMaker } from "../../BinaryExpMaker.js";
import { ParserGenUtil } from "../../ParserGenUtil.js";

export class RHSBinaryExp extends RHSPropEntry {
    type: FreMetaBinaryExpressionConcept;

    constructor(prop: FreMetaProperty, type: FreMetaBinaryExpressionConcept) {
        super(prop);
        this.type = type;
        this.isList = false;
    }

    toGrammar(): string {
        return `${BinaryExpMaker.getBinaryRuleName(LangUtil.findExpressionBase(this.type))}` + this.doNewline();
    }

    toMethod(index: number, nodeName: string): string {
        return `${ParserGenUtil.internalName(this.property.name)} = ${nodeName}.asJsReadonlyArrayView()[${index}] // RHSBinaryExp`;
    }

    toString(depth: number): string {
        const indent = makeIndent(depth);
        return indent + "RHSBinaryExp: " + this.property.name + ": " + this.type.name;
    }
}
