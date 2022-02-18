import { RHSPropEntry } from "./RHSPropEntry";
import { PiBinaryExpressionConcept, PiProperty } from "../../../../languagedef/metalanguage";
import { makeIndent } from "../GrammarUtils";
import { BinaryExpMaker } from "../../BinaryExpMaker";
import { findExpressionBase } from "../../../../utils";
import { internalTransformNode, ParserGenUtil } from "../../ParserGenUtil";

export class RHSBinaryExp extends RHSPropEntry {
    type: PiBinaryExpressionConcept = null;

    constructor(prop: PiProperty, type: PiBinaryExpressionConcept) {
        super(prop);
        this.type = type;
        this.isList = false;
    }

    toGrammar(): string {
        return `${BinaryExpMaker.getBinaryRuleName(findExpressionBase(this.type))}` + this.doNewline();
    }

    toMethod(index: number, nodeName: string, mainAnalyserName: string): string {
        return `
                ${ParserGenUtil.internalName(this.property.name)} = this.${mainAnalyserName}.${internalTransformNode}(${nodeName}[${index}]) // RHSBinaryExp`;
    }

    toString(depth: number): string {
        let indent = makeIndent(depth);
        return indent + "RHSBinaryExp: " + this.property.name + ": " + this.type.name;
    }
}
