import { RHSPropEntry } from "./RHSPropEntry.js";
import { FreMetaBinaryExpressionConcept, FreMetaProperty } from "../../../../languagedef/metalanguage/index.js";
import { makeIndent } from "../GrammarUtils.js";
import { BinaryExpMaker } from "../../BinaryExpMaker.js";
import { GenerationUtil } from "../../../../utils/index.js";
import { ParserGenUtil } from "../../ParserGenUtil.js";

export class RHSBinExpListWithInitiator extends RHSPropEntry {
    type: FreMetaBinaryExpressionConcept;
    private readonly separatorText: string = "";
    entry: RHSPropEntry;

    constructor(
        prop: FreMetaProperty,
        type: FreMetaBinaryExpressionConcept,
        entry: RHSPropEntry,
        separatorText: string,
    ) {
        super(prop);
        this.entry = entry;
        this.type = type;
        this.isList = true;
        this.separatorText = separatorText;
    }

    toGrammar(): string {
        return (
            `${ParserGenUtil.internalName(this.property.name)}:( '${this.separatorText}' inner:${BinaryExpMaker.getBinaryRuleName(GenerationUtil.findExpressionBase(this.type))} { return inner })*` +
            this.doNewline()
        );
    }

    // @ts-ignore
    toMethod(index: number, nodeName: string, mainAnalyserName: string): string {
        // TODO this method is equal to the one in RHSPartListWithInitiator
        return `${this.property.name}: ${ParserGenUtil.internalName(this.property.name)} // RHSBinExpListWithInitiator
        `;
    }

    toString(depth: number): string {
        const indent = makeIndent(depth);
        return indent + "RHSBinaryExp: " + this.property.name + ": " + this.type.name;
    }
}
