import { RHSPropPartWithSeparator } from "./RHSPropPartWithSeparator";
import { PiProperty } from "../../../../languagedef/metalanguage";
import { getPrimCall, makeIndent } from "../GrammarUtils";
import { getBaseTypeAsString } from "../../../../utils";
import { internalTransformList, ParserGenUtil } from "../../ParserGenUtil";

export class RHSPrimListEntryWithSeparator extends RHSPropPartWithSeparator {
    constructor(prop: PiProperty, separatorText: string) {
        super(prop, separatorText);
        this.isList = true;
    }

    toGrammar(): string {
        return `[ ${getPrimCall(this.property.type.referred)} / '${this.separatorText}' ]*` + this.doNewline();
    }

    toMethod(index: number, nodeName: string, mainAnalyserName: string): string {
        const baseType: string = getBaseTypeAsString(this.property);
        return `${ParserGenUtil.internalName(this.property.name)} = this.${mainAnalyserName}.${internalTransformList}<${baseType}>(${nodeName}[${index}], '${this.separatorText}'); // RHSPrimListEntryWithSeparator\n`;
    }

    toString(depth: number): string {
        let indent = makeIndent(depth);
        return indent + "RHSPrimListEntryWithSeparator: " + this.property.name;
    }
}
