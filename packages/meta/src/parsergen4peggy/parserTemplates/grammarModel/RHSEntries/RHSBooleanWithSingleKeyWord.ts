import { RHSPropEntry } from "./RHSPropEntry.js";
import { FreMetaPrimitiveProperty } from "../../../../languagedef/metalanguage/index.js";
import { makeIndent } from "../GrammarUtils.js";
import { ParserGenUtil } from "../../ParserGenUtil.js";

export class RHSBooleanWithSingleKeyWord extends RHSPropEntry {
    private readonly keyword: string = "";

    constructor(prop: FreMetaPrimitiveProperty, keyword: string) {
        super(prop);
        this.keyword = keyword;
        this.isList = false;
    }

    toGrammar(varName?: string): string {
        if (!varName || varName.length <= 0) {
            varName = ParserGenUtil.internalName(this.property.name);
        }
        return `${varName}:(ws __keyword:'${this.keyword}'? ws { return !!__keyword })` + this.doNewline();
    }

    // @ts-ignore
    toMethod(index: number, nodeName: string): string {
        return `// RHSBooleanWithSingleKeyWord               
                this.property.name !!${ParserGenUtil.internalName(this.property.name)};
        `;
    }

    toString(depth: number): string {
        const indent = makeIndent(depth);
        return indent + "RHSBooleanWithKeyWord: " + this.property.name + ": " + this.keyword;
    }
}
