import { RHSPropEntry } from "./RHSPropEntry";
import { FreProperty } from "../../../../languagedef/metalanguage";
import { getTypeCall, makeIndent } from "../GrammarUtils";
import { GenerationUtil, Names } from "../../../../utils";
import { internalTransformRefList, ParserGenUtil } from "../../ParserGenUtil";

export class RHSLimitedRefListEntry extends RHSPropEntry {
    constructor(prop: FreProperty) {
        super(prop);
        this.isList = false;
    }

    toGrammar(): string {
        return `${getTypeCall(this.property.type)}*` + this.doNewline();
    }

    toMethod(index: number, nodeName: string, mainAnalyserName: string): string {
        const propType: string = Names.classifier(this.property.type);
        const baseType: string = GenerationUtil.getBaseTypeAsString(this.property);
        return `${ParserGenUtil.internalName(this.property.name)} = this.${mainAnalyserName}.${internalTransformRefList}<${baseType}>(${nodeName}[${index}], '${propType}'); // RHSLimitedRefListEntry\n`;
    }

    toString(depth: number): string {
        const indent = makeIndent(depth);
        return indent + "RHSLimitedRefListEntry: " + this.property.name;
    }
}
