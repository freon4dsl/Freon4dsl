import { RHSPropEntry } from "./RHSPropEntry.js";
import { FreMetaProperty } from "../../../../languagedef/metalanguage/index.js";
import { GenerationUtil, Names } from "../../../../utils/index.js";
import { internalTransformRefList, ParserGenUtil } from "../../ParserGenUtil.js";
import { makeIndent, refRuleName } from "../GrammarUtils.js";

export class RHSRefListEntry extends RHSPropEntry {
    constructor(prop: FreMetaProperty) {
        super(prop);
        this.isList = true;
    }

    toGrammar(): string {
        return `${refRuleName}*` + this.doNewline();
    }

    toMethod(index: number, nodeName: string, mainAnalyserName: string): string {
        const propType: string = Names.classifier(this.property.type);
        const baseType: string = GenerationUtil.getBaseTypeAsString(this.property);
        return `${ParserGenUtil.internalName(this.property.name)} = this.${mainAnalyserName}.${internalTransformRefList}<${baseType}>(${nodeName}.asJsReadonlyArrayView()[${index}], '${propType}'); // RHSRefListEntry\n`;
    }

    toString(depth: number): string {
        const indent = makeIndent(depth);
        return indent + "RHSRefListEntry: " + this.property.name;
    }
}
