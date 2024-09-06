import { RHSPropEntry } from "./RHSPropEntry.js";
import { FreMetaBinaryExpressionConcept, FreMetaProperty } from "../../../../languagedef/metalanguage/index.js";
import { makeIndent } from "../GrammarUtils.js";
import { BinaryExpMaker } from "../../BinaryExpMaker.js";
import { GenerationUtil } from "../../../../utils/index.js";
import { ParserGenUtil } from "../../ParserGenUtil.js";

export class RHSBinExpList extends RHSPropEntry {
    type: FreMetaBinaryExpressionConcept;

    constructor(prop: FreMetaProperty, type: FreMetaBinaryExpressionConcept) {
        super(prop);
        this.type = type;
        this.isList = true;
    }

    toGrammar(): string {
        return `${ParserGenUtil.internalName(this.property.name)}:${BinaryExpMaker.getBinaryRuleName(GenerationUtil.findExpressionBase(this.type))}*` + this.doNewline();
    }

    // @ts-ignore
    toMethod(index: number, nodeName: string, mainAnalyserName: string): string {
        return `${this.property.name}: ${ParserGenUtil.internalName(this.property.name)} // RHSBinExpList`;
    }

    toString(depth: number): string {
        const indent = makeIndent(depth);
        return indent + "RHSBinaryExp: " + this.property.name + ": " + this.type.name;
    }
}
