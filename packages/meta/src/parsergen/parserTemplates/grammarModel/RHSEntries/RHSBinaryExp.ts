import { RHSPropEntry } from "./RHSPropEntry.js";
import { FreMetaBinaryExpressionConcept, FreMetaProperty } from "../../../../languagedef/metalanguage/index.js";
import { makeIndent } from "../GrammarUtils.js";
import { BinaryExpMaker } from "../../BinaryExpMaker.js";
import { GenerationUtil } from "../../../../utils/index.js";
import { ParserGenUtil } from "../../ParserGenUtil.js";

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

    toMethod(index: number, nodeName: string): string {
        return `${ParserGenUtil.internalName(this.property.name)} = ${nodeName}.asJsReadonlyArrayView()[${index}] // RHSBinaryExp`;
    }

    toString(depth: number): string {
        const indent = makeIndent(depth);
        return indent + "RHSBinaryExp: " + this.property.name + ": " + this.type.name;
    }
}
