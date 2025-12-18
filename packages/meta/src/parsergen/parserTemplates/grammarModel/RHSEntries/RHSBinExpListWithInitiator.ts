import { RHSPropEntry } from "./RHSPropEntry.js";
import type { FreMetaBinaryExpressionConcept, FreMetaProperty} from "../../../../languagedef/metalanguage/index.js";
import { LangUtil } from "../../../../languagedef/metalanguage/index.js";
import { makeIndent } from "../GrammarUtils.js";
import { BinaryExpMaker } from "../../BinaryExpMaker.js";
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
            `( '${this.separatorText}' ${BinaryExpMaker.getBinaryRuleName(LangUtil.findExpressionBase(this.type))} )*` +
            this.doNewline()
        );
    }

    toMethod(index: number, nodeName: string): string {
        // TODO this method is equal to the one in RHSPartListWithInitiator
        return `
        // RHSBinExpListWithInitiator
        if (${nodeName}.asJsReadonlyArrayView()[${index}].asJsReadonlyArrayView().length > 1 ) {
            ${ParserGenUtil.internalName(this.property.name)} = [];
            for (const child of ${nodeName}.asJsReadonlyArrayView()[${index}].asJsReadonlyArrayView()) {
                ${ParserGenUtil.internalName(this.property.name)}.push(child.asJsReadonlyArrayView()[1]);
            }
            } // end RHSBinExpListWithInitiator
        `;
    }

    toString(depth: number): string {
        const indent = makeIndent(depth);
        return indent + "RHSBinaryExp: " + this.property.name + ": " + this.type.name;
    }
}
