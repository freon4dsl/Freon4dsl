import { RHSPropEntry } from "./RHSPropEntry.js";
import { FreMetaProperty } from "../../../../languagedef/metalanguage/index.js";
import { GenerationUtil } from "../../../../utils/index.js";
import { makeIndent, refRuleName } from "../GrammarUtils.js";
import { ParserGenUtil } from "../../ParserGenUtil.js";

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
        // todo nonSkip, getGroup
        return `// RHSRefOptionalEntry
            if (!!${nodeName}[${index}]) {
                // take the first element of the group that represents the optional part
                const subNode = this.${mainAnalyserName}.getGroup(${nodeName}[${index}]).nonSkipChildren.toArray()[0];
                ${ParserGenUtil.internalName(this.property.name)} = this.${mainAnalyserName}.freNodeRef<${baseType}>(subNode, '${baseType}');
            }`;
    }

    toString(depth: number): string {
        const indent = makeIndent(depth);
        return indent + "RHSRefEntry: " + this.property.name;
    }
}
