import { RHSPropEntry } from "./RHSPropEntry";
import { PiProperty } from "../../../../languagedef/metalanguage";
import { getTypeCall, makeIndent } from "../GrammarUtils";
import { getBaseTypeAsString, Names } from "../../../../utils";
import { internalTransformRefList} from "../../ParserGenUtil";

export class RHSLimitedRefListEntry extends RHSPropEntry {
    constructor(prop: PiProperty) {
        super(prop);
        this.isList = false;
    }

    toGrammar(): string {
        return `${getTypeCall(this.property.type.referred)}*` + this.doNewline();
    }

    toMethod(propIndex: number, nodeName: string): string {
        const propType: string = Names.classifier(this.property.type.referred);
        const baseType: string = getBaseTypeAsString(this.property);
        return `${this.property.name} = this.${internalTransformRefList}<${baseType}>(${nodeName}[${propIndex}], '${propType}'); // RHSLimitedRefListEntry\n`;
    }

    toString(depth: number): string {
        let indent = makeIndent(depth);
        return indent + "RHSLimitedRefListEntry: " + this.property.name;
    }
}
