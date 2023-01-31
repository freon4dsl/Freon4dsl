import { RHSPropEntry } from "./RHSPropEntry";
import { FreProperty } from "../../../../languagedef/metalanguage";
import { getTypeCall, makeIndent } from "../GrammarUtils";
import { GenerationUtil } from "../../../../utils";
import { internalTransformList, internalTransformNode, ParserGenUtil } from "../../ParserGenUtil";

export class RHSPartListEntry extends RHSPropEntry {
    constructor(prop: FreProperty) {
        super(prop);
        this.property = prop;
        this.isList = true;
    }

    toGrammar(): string {
        return `${getTypeCall(this.property.type)}*` + this.doNewline();
    }

    toMethod(index: number, nodeName: string, mainAnalyserName: string): string {
        const baseType: string = GenerationUtil.getBaseTypeAsString(this.property);
        return `// RHSPartListEntry
        if (children[${index}].name !== "${getTypeCall(this.property.type)}") {
            ${ParserGenUtil.internalName(this.property.name)} = this.${mainAnalyserName}.${internalTransformList}<${baseType}>(${nodeName}[${index}]); 
        } else { // special case: only when this entry is the single rhs entry of this rule
            ${ParserGenUtil.internalName(this.property.name)} = [];
            for (const child of children) {
                ${ParserGenUtil.internalName(this.property.name)}.push(this.${mainAnalyserName}.${internalTransformNode}(child));
            }
        }`
    }

    toString(depth: number): string {
        let indent = makeIndent(depth);
        return indent + "RHSPartListEntry: " + this.property.name;
    }
}
