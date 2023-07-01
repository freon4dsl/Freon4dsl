import { RHSPropEntry } from "./RHSPropEntry";
import { FreMetaBinaryExpressionConcept, FreMetaProperty } from "../../../../languagedef/metalanguage";
import { makeIndent } from "../GrammarUtils";
import { BinaryExpMaker } from "../../BinaryExpMaker";
import { GenerationUtil } from "../../../../utils";
import { internalTransformNode, ParserGenUtil } from "../../ParserGenUtil";

export class RHSBinExpListWithInitiator extends RHSPropEntry {
    type: FreMetaBinaryExpressionConcept = null;
    private readonly separatorText: string = "";
    entry: RHSPropEntry;

    constructor(prop: FreMetaProperty, type: FreMetaBinaryExpressionConcept, entry: RHSPropEntry, separatorText: string) {
        super(prop);
        this.entry = entry;
        this.type = type;
        this.isList = true;
        this.separatorText = separatorText;
    }

    toGrammar(): string {
        return `( '${this.separatorText}' ${BinaryExpMaker.getBinaryRuleName(GenerationUtil.findExpressionBase(this.type))} )*` + this.doNewline();
    }

    toMethod(index: number, nodeName: string, mainAnalyserName: string): string {
        // TODO this method is equal to the one in RHSPartListWithInitiator
        return `
        // RHSBinExpListWithInitiator
        if (!${nodeName}[${index}].isEmptyMatch) {
            ${ParserGenUtil.internalName(this.property.name)} = [];
            const group = this.${mainAnalyserName}.getGroup(${nodeName}[${index}]);
            if (group !== ${nodeName}[${index}]) {
                for (const child of ${nodeName}[${index}].nonSkipChildren.toArray()) {
                    ${ParserGenUtil.internalName(this.property.name)}.push(this.${mainAnalyserName}.${internalTransformNode}(child.nonSkipChildren.toArray()[1]));
                }
            } else {
                for (const child of ${nodeName}) {
                    ${ParserGenUtil.internalName(this.property.name)}.push(this.${mainAnalyserName}.${internalTransformNode}(child.nonSkipChildren.toArray()[1]));
                }
            }
        } // end RHSBinExpListWithInitiator
        `;
    }

    toString(depth: number): string {
        const indent = makeIndent(depth);
        return indent + "RHSBinaryExp: " + this.property.name + ": " + this.type.name;
    }
}
