import { RHSPropEntry } from "./RHSPropEntry.js";
import type { FreMetaProperty } from "../../../../languagedef/metalanguage/index.js";
import { getTypeCall, makeIndent } from "../GrammarUtils.js";
import { ParserGenUtil } from '../../ParserGenUtil.js';

export class RHSLimitedRefOptionalEntry extends RHSPropEntry {
    constructor(prop: FreMetaProperty) {
        super(prop);
        this.isList = false;
    }

    toGrammar(): string {
        return `${getTypeCall(this.property.type)}?` + this.doNewline();
    }

    toMethod(index: number, nodeName: string): string {
        return  `// RHSLimitedRefOptionalEntry
            if (!!${nodeName}.asJsReadonlyArrayView()[${index}]) {
                ${ParserGenUtil.internalName(this.property.name)} = ${nodeName}.asJsReadonlyArrayView()[${index}];
        } // end RHSLimitedRefOptionalEntry`;
    }

    toString(depth: number): string {
        const indent = makeIndent(depth);
        return indent + "RHSLimitedRefEntry: " + this.property.name;
    }
}
