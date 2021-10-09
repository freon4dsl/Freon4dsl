import { RHSPropPartWithSeparator } from "./RHSPropPartWithSeparator";
import { PiProperty } from "../../../../languagedef/metalanguage";
import { getBaseTypeAsString, Names } from "../../../../utils";
import { internalTransformRefList} from "../../ParserGenUtil";
import { makeIndent, refRuleName } from "../GrammarUtils";

export class RHSRefListWithSeparator extends RHSPropPartWithSeparator {
    constructor(prop: PiProperty, separatorText: string) {
        super(prop, separatorText);
        this.isList = true;
    }

    toGrammar(): string {
        return `[ ${refRuleName} / '${this.separatorText}' ]*` + this.doNewline();
    }

    toMethod(propIndex: number, nodeName: string): string {
        const propType: string = Names.classifier(this.property.type.referred);
        const baseType: string = getBaseTypeAsString(this.property);
        return `${this.property.name} = 
                        this.${internalTransformRefList}<${baseType}>(${nodeName}[${propIndex}], '${propType}', '${this.separatorText}'); // RHSRefListWithSeparator\n`;
    }

    toString(depth: number): string {
        let indent = makeIndent(depth);
        return indent + "RHSRefListWithSeparator: " + this.property.name;
    }
}
