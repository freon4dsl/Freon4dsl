import { RHSPropPartWithSeparator } from "./RHSPropPartWithSeparator.js";
import { RHSPropEntry } from "./RHSPropEntry.js";
import { FreMetaProperty } from "../../../../languagedef/metalanguage/index.js";
import { ParserGenUtil } from "../../ParserGenUtil.js";
import { makeIndent } from "../GrammarUtils.js";

export class RHSPartListWithInitiator extends RHSPropPartWithSeparator {
    // `("joinText" propTypeName)*`
    private entry: RHSPropEntry;

    constructor(prop: FreMetaProperty, entry: RHSPropEntry, separator: string) {
        super(prop, separator);
        this.entry = entry;
        this.isList = true;
    }

    toGrammar(): string {
        return `( '${this.separatorText}' ${this.entry.toGrammar()} )*` + this.doNewline();
    }

    toMethod(index: number, nodeName: string): string {
        return `
        // RHSPartListWithInitiator
        if (${nodeName}.asJsReadonlyArrayView()[${index}].asJsReadonlyArrayView().length > 1 ) {
            ${ParserGenUtil.internalName(this.property.name)} = [];
            for (const child of ${nodeName}.asJsReadonlyArrayView()[${index}].asJsReadonlyArrayView()) {
                ${ParserGenUtil.internalName(this.property.name)}.push(child.asJsReadonlyArrayView()[1]);
            }
        } // end RHSPartListWithInitiator
        `;
    }

    toString(depth: number): string {
        const indent = makeIndent(depth + 1);
        return indent + "RHSListGroup: " + indent + this.separatorText + " " + this.entry.toString(depth + 1);
    }
}
