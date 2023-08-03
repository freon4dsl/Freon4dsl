import { RHSPropPartWithSeparator } from "./RHSPropPartWithSeparator";
import { FreMetaProperty } from "../../../../languagedef/metalanguage";
import { GenerationUtil, Names } from "../../../../utils";
import { internalTransformRefList, ParserGenUtil } from "../../ParserGenUtil";
import { makeIndent, refRuleName } from "../GrammarUtils";

export class RHSRefListWithSeparator extends RHSPropPartWithSeparator {
    constructor(prop: FreMetaProperty, separatorText: string) {
        super(prop, separatorText);
        this.isList = true;
    }

    toGrammar(): string {
        return `[ ${refRuleName} / '${this.separatorText}' ]*` + this.doNewline();
    }

    toMethod(index: number, nodeName: string, mainAnalyserName: string): string {
        const propType: string = Names.classifier(this.property.type);
        const baseType: string = GenerationUtil.getBaseTypeAsString(this.property);
        return `${ParserGenUtil.internalName(this.property.name)} =
                        this.${mainAnalyserName}.${internalTransformRefList}<${baseType}>(${nodeName}[${index}], '${propType}', '${this.separatorText}'); // RHSRefListWithSeparator\n`;
    }

    toString(depth: number): string {
        const indent = makeIndent(depth);
        return indent + "RHSRefListWithSeparator: " + this.property.name;
    }
}
