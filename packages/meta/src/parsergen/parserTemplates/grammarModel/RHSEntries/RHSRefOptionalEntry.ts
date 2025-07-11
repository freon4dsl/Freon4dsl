import { RHSPropEntry } from "./RHSPropEntry.js";
import { FreMetaProperty } from "../../../../languagedef/metalanguage/index.js";
import { makeIndent, refRuleName } from "../GrammarUtils.js";
import { internalTransformTempRef, ParserGenUtil } from '../../ParserGenUtil.js';
import { GenerationUtil } from '../../../../utils/on-lang/GenerationUtil.js';

export class RHSRefOptionalEntry extends RHSPropEntry {
    constructor(prop: FreMetaProperty) {
        super(prop);
        this.isList = false;
    }

    toGrammar(): string {
        return `${refRuleName}?` + this.doNewline();
    }

    toMethod(index: number, nodeName: string, mainAnalyserName: string): string {
        const baseType: string = GenerationUtil.getBaseTypeAsString(this.property);
        return `// RHSRefOptionalEntry
            if (!!${nodeName}.asJsReadonlyArrayView()[${index}]) {
            ${ParserGenUtil.internalName(this.property.name)} = this.${mainAnalyserName}.${internalTransformTempRef}<${baseType}>(${nodeName}.asJsReadonlyArrayView()[${index}], "${baseType}");
        } // end RHSRefOptionalEntry\n`;
    }

    toString(depth: number): string {
        const indent = makeIndent(depth);
        return indent + "RHSRefEntry: " + this.property.name;
    }
}
