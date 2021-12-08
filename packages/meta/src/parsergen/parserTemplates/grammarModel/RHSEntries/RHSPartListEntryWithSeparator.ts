import { RHSPropPartWithSeparator } from "./RHSPropPartWithSeparator";
import { PiProperty } from "../../../../languagedef/metalanguage";
import { getTypeCall, makeIndent } from "../GrammarUtils";
import { getBaseTypeAsString } from "../../../../utils";
import { internalTransformList, ParserGenUtil } from "../../ParserGenUtil";

export class RHSPartListEntryWithSeparator extends RHSPropPartWithSeparator {
    constructor(prop: PiProperty, separatorText: string) {
        super(prop, separatorText);
        this.isList = true;
    }

    toGrammar(): string {
        return `[ ${getTypeCall(this.property.type.referred)} / '${this.separatorText}' ]*` + this.doNewline();
    }

    toMethod(index: number, nodeName: string, mainAnalyserName: string): string {
        const baseType: string = getBaseTypeAsString(this.property);
        return `${ParserGenUtil.internalName(this.property.name)} = this.${mainAnalyserName}.${internalTransformList}<${baseType}>(${nodeName}[${index}], '${this.separatorText}'); // RHSPartListEntryWithSeparator\n`;
    }

    toString(depth: number): string {
        let indent = makeIndent(depth);
        return indent + "RHSPartListEntryWithSeparator: " + this.property.name;
    }
}
