import { RHSPropEntry } from "./RHSPropEntry.js";
import { FreMetaProperty } from "../../../../languagedef/metalanguage/index.js";
import { GenerationUtil } from "../../../../utils/index.js";
import { makeIndent, refRuleName } from "../GrammarUtils.js";

export class RHSRefOptionalEntry extends RHSPropEntry {
    constructor(prop: FreMetaProperty) {
        super(prop);
        this.isList = false;
    }

    toGrammar(): string {
        return `${refRuleName}?` + this.doNewline();
    }

    toMethod(index: number, nodeName: string): string {
        const baseType: string = GenerationUtil.getBaseTypeAsString(this.property);
        return `// RHSRefOptionalEntry
            if (!!${nodeName}.asJsReadonlyArrayView()[${index}]) {
            __optContent = FreNodeReference.create<${baseType}>(${nodeName}.asJsReadonlyArrayView()[${index}], "${baseType}");
        } // end RHSRefOptionalEntry`;
    }

    toString(depth: number): string {
        const indent = makeIndent(depth);
        return indent + "RHSRefEntry: " + this.property.name;
    }
}
