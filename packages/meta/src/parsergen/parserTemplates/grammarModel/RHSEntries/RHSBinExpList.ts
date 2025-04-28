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
        return `${BinaryExpMaker.getBinaryRuleName(GenerationUtil.findExpressionBase(this.type))}*` + this.doNewline();
    }

    toMethod(index: number, nodeName: string): string {
        // TODO this method is equal to the one in RHSPartListEntry
        // TODO there used to be a special case for when this entry is the single rhs entry of this rule. Do we still need it?
        return `${ParserGenUtil.internalName(this.property.name)} = ${nodeName}.asJsReadonlyArrayView()[${index}].asJsReadonlyArrayView(); // RHSBinExpList\n`;
        // return `// RHSBinExpList
        // if (children[${index}].name !== "${getTypeCall(this.property.type)}") {
        //     ${ParserGenUtil.internalName(this.property.name)} = this.${mainAnalyserName}.${internalTransformPartList}<${baseType}>(${nodeName}[${index}]);
        // } else { // special case: only when this entry is the single rhs entry of this rule
        //     ${ParserGenUtil.internalName(this.property.name)} = [];
        //     for (const child of children) {
        //         ${ParserGenUtil.internalName(this.property.name)}.push(child);
        //     }
        // }`;
    }

    toString(depth: number): string {
        const indent = makeIndent(depth);
        return indent + "RHSBinaryExp: " + this.property.name + ": " + this.type.name;
    }
}
