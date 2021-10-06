import { RHSPropEntry } from "./RHSPropEntry";
import { PiProperty } from "../../../../languagedef/metalanguage";
import { getBaseTypeAsString, Names } from "../../../../utils";
import { internalTransformRefList} from "../../ParserGenUtil";
import { makeIndent, refRuleName } from "../GrammarUtils";

export class RHSRefListEntry extends RHSPropEntry {
    constructor(prop: PiProperty) {
        super(prop);
        this.isList = true;
    }

    toGrammar(): string {
        return `${refRuleName}*` + this.doNewline();
    }

    toMethod(propIndex: number, nodeName: string): string {
        const propType: string = Names.classifier(this.property.type.referred);
        const baseType: string = getBaseTypeAsString(this.property);
        return `${this.property.name} = this.${internalTransformRefList}<${baseType}>(${nodeName}[${propIndex}], '${propType}'); // RHSRefListEntry\n`;
    }

    toString(depth: number): string {
        let indent = makeIndent(depth);
        return indent + "RHSRefListEntry: " + this.property.name;
    }
}
