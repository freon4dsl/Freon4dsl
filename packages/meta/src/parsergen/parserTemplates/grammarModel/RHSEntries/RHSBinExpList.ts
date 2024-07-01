import { RHSPropEntry } from "./RHSPropEntry";
import { FreMetaBinaryExpressionConcept, FreMetaProperty } from "../../../../languagedef/metalanguage";
import { getTypeCall, makeIndent } from "../GrammarUtils";
import { BinaryExpMaker } from "../../BinaryExpMaker";
import { GenerationUtil, Names } from "../../../../utils";
import { internalTransformList, internalTransformNode, ParserGenUtil } from "../../ParserGenUtil";

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

    toMethod(index: number, nodeName: string, mainAnalyserName: string): string {
        // TODO this method is almost equal to the one in RHSPartListEntry, only baseType differs
        const baseType: string = Names.classifier(this.type);
        return `// RHSBinExpList
        if (children[${index}].name !== "${getTypeCall(this.property.type)}") {
            ${ParserGenUtil.internalName(this.property.name)} = this.${mainAnalyserName}.${internalTransformList}<${baseType}>(${nodeName}[${index}]);
        } else { // special case: only when this entry is the single rhs entry of this rule
            ${ParserGenUtil.internalName(this.property.name)} = [];
            for (const child of children) {
                ${ParserGenUtil.internalName(this.property.name)}.push(this.${mainAnalyserName}.${internalTransformNode}(child));
            }
        }`;
    }

    toString(depth: number): string {
        const indent = makeIndent(depth);
        return indent + "RHSBinaryExp: " + this.property.name + ": " + this.type.name;
    }
}
