import { RHSPropEntry } from "./RHSPropEntry.js";
import { FreMetaProperty } from "../../../../languagedef/metalanguage/index.js";
import { getTypeCall, makeIndent } from "../GrammarUtils.js";
import { GenerationUtil } from "../../../../utils/index.js";
import { ParserGenUtil } from "../../ParserGenUtil.js";

export class RHSLimitedRefEntry extends RHSPropEntry {
    constructor(prop: FreMetaProperty) {
        super(prop);
        this.isList = false;
    }

    toGrammar(): string {
        return `${getTypeCall(this.property.type)}` + this.doNewline();
    }

    toMethod(index: number, nodeName: string): string {
        const baseType: string = GenerationUtil.getBaseTypeAsString(this.property);
        return `// RHSLimitedRefEntry
            // console.log('===> ' + " type: " + ${nodeName}.constructor.name  + ${nodeName} );
            if (${nodeName} instanceof ${baseType}) {
                ${ParserGenUtil.internalName(this.property.name)} = FreNodeReference.create<${baseType}>(${nodeName}, "${baseType}");
            } else {
                ${ParserGenUtil.internalName(this.property.name)} = FreNodeReference.create<${baseType}>(${nodeName}.asJsReadonlyArrayView()[${index}], "${baseType}");
            }
            // end RHSLimitedRefEntry\n`;
    }

    toString(depth: number): string {
        const indent = makeIndent(depth);
        return indent + "RHSLimitedRefEntry: " + this.property.name;
    }
}
