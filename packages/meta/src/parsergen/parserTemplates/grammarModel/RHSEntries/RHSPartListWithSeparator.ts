import { RHSPropPartWithSeparator } from "./RHSPropPartWithSeparator";
import { FreProperty } from "../../../../languagedef/metalanguage";
import { getTypeCall, makeIndent } from "../GrammarUtils";
import { GenerationUtil } from "../../../../utils";
import { internalTransformList, ParserGenUtil } from "../../ParserGenUtil";

export class RHSPartListWithSeparator extends RHSPropPartWithSeparator {
    constructor(prop: FreProperty, separatorText: string) {
        super(prop, separatorText);
        this.isList = true;
    }

    toGrammar(): string {
        return `[ ${getTypeCall(this.property.type)} / '${this.separatorText}' ]*` + this.doNewline();
    }

    toMethod(index: number, nodeName: string, mainAnalyserName: string): string {
        const baseType: string = GenerationUtil.getBaseTypeAsString(this.property);
        return `${ParserGenUtil.internalName(this.property.name)} = this.${mainAnalyserName}.${internalTransformList}<${baseType}>(${nodeName}[${index}], '${this.separatorText}'); // RHSPartListWithSeparator\n`;
    }

    toString(depth: number): string {
        let indent = makeIndent(depth);
        return indent + "RHSPartListEntryWithSeparator: " + this.property.name;
    }
}
