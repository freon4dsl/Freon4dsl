import { RHSPropEntry } from "./RHSPropEntry.js";
import { FreMetaProperty } from "../../../../languagedef/metalanguage/index.js";
import { getTypeCall, makeIndent } from "../GrammarUtils.js";
import { GenerationUtil } from "../../../../utils/index.js";
import { internalTransformNode, ParserGenUtil } from "../../ParserGenUtil.js";

export class RHSPartOptionalEntry extends RHSPropEntry {
    private readonly projectionName: string = "";

    constructor(prop: FreMetaProperty, projectionName: string) {
        super(prop);
        this.isList = false;
        this.projectionName = projectionName;
    }

    toGrammar(): string {
        return `${getTypeCall(this.property.type, this.projectionName)}?` + this.doNewline();
    }

    toMethod(index: number, nodeName: string, mainAnalyserName: string): string {
        GenerationUtil.getBaseTypeAsString(this.property);
        return `// RHSPartOptionalEntry
            if (!${nodeName}[${index}].isEmptyMatch) {
                // take the first element of the group that represents the optional part
                const subNode = this.${mainAnalyserName}.getGroup(${nodeName}[${index}]).nonSkipChildren.toArray()[0];
                ${ParserGenUtil.internalName(this.property.name)} = this.${mainAnalyserName}.${internalTransformNode}(subNode);
            }`;
    }

    toString(depth: number): string {
        const indent = makeIndent(depth);
        return indent + "RHSPartEntry: " + this.property.name;
    }
}
