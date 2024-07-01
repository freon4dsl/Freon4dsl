import { RHSPropEntry } from "./RHSPropEntry";
import { FreMetaBinaryExpressionConcept, FreMetaProperty } from "../../../../languagedef/metalanguage";
import { makeIndent } from "../GrammarUtils";
import { BinaryExpMaker } from "../../BinaryExpMaker";
import { GenerationUtil } from "../../../../utils";
import { internalTransformNode, ParserGenUtil } from "../../ParserGenUtil";

export class RHSBinaryExp extends RHSPropEntry {
    type: FreMetaBinaryExpressionConcept;

    constructor(prop: FreMetaProperty, type: FreMetaBinaryExpressionConcept) {
        super(prop);
        this.type = type;
        this.isList = false;
    }

    toGrammar(): string {
        return `${BinaryExpMaker.getBinaryRuleName(GenerationUtil.findExpressionBase(this.type))}` + this.doNewline();
    }

    toMethod(index: number, nodeName: string, mainAnalyserName: string): string {
        return `
                ${ParserGenUtil.internalName(this.property.name)} = this.${mainAnalyserName}.${internalTransformNode}(${nodeName}[${index}]) // RHSBinaryExp`;
    }

    toString(depth: number): string {
        const indent = makeIndent(depth);
        return indent + "RHSBinaryExp: " + this.property.name + ": " + this.type.name;
    }
}
