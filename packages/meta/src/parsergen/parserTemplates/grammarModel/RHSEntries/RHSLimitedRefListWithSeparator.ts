import { RHSPropPartWithSeparator } from "./RHSPropPartWithSeparator";
import { PiProperty } from "../../../../languagedef/metalanguage";
import { getTypeCall, makeIndent } from "../GrammarUtils";
import { getBaseTypeAsString, Names } from "../../../../utils";
import { internalTransformRefList, ParserGenUtil } from "../../ParserGenUtil";

export class RHSLimitedRefListWithSeparator extends RHSPropPartWithSeparator {
    constructor(prop: PiProperty, separatorText: string) {
        super(prop, separatorText);
        this.isList = true;
    }

    toGrammar(): string {
        return `[ ${getTypeCall(this.property.type)} / '${this.separatorText}' ]*` + this.doNewline();
    }

    toMethod(index: number, nodeName: string, mainAnalyserName: string): string {
        const propType: string = Names.classifier(this.property.type);
        const baseType: string = getBaseTypeAsString(this.property);
        return `${ParserGenUtil.internalName(this.property.name)} = this.${mainAnalyserName}.${internalTransformRefList}<${baseType}>(${nodeName}[${index}], '${propType}', '${this.separatorText}'); // RHSLimitedRefListEntryWithSeparator\n`;
    }

    toString(depth: number): string {
        let indent = makeIndent(depth);
        return indent + "RHSLimitedRefListWithSeparator: " + this.property.name;
    }
}
