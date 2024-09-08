import { RHSPropEntry } from "./RHSPropEntry.js";
import { FreMetaBinaryExpressionConcept, FreMetaProperty } from "../../../../languagedef/metalanguage/index.js";
import { makeIndent } from "../GrammarUtils.js";
import { BinaryExpMaker } from "../../BinaryExpMaker.js";
import { GenerationUtil, Names } from "../../../../utils/index.js";
import { internalTransformList, ParserGenUtil } from "../../ParserGenUtil.js";

export class RHSBinExpListWithSeparator extends RHSPropEntry {
    type: FreMetaBinaryExpressionConcept;
    private readonly separatorText: string = "";

    constructor(prop: FreMetaProperty, type: FreMetaBinaryExpressionConcept, separatorText: string) {
        super(prop);
        this.type = type;
        this.isList = true;
        this.separatorText = separatorText;
    }

    toGrammar(varName?: string): string {
        if (!varName || varName.length <= 0) {
            varName = ParserGenUtil.internalName(this.property.name);
        }
        const binCall: string = BinaryExpMaker.getBinaryRuleName(GenerationUtil.findExpressionBase(this.type));
        return `${varName}:${binCall}|.., "${this.separatorText}"|` + this.doNewline();
    }

    toMethod(index: number, nodeName: string, mainAnalyserName: string): string {
        // TODO this method is almost equal to the one in RHSPartListWithSeparator, only baseType differs
        const baseType: string = Names.classifier(this.type);
        return `${ParserGenUtil.internalName(this.property.name)} = this.${mainAnalyserName}.${internalTransformList}<${baseType}>(${nodeName}[${index}], '${this.separatorText}'); // RHSBinExpListWithSeparator\n`;
    }

    toString(depth: number): string {
        const indent = makeIndent(depth);
        return indent + "RHSBinaryExp: " + this.property.name + ": " + this.type.name;
    }
}
