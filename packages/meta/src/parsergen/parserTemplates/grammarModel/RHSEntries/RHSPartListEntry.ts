import { RHSPropEntry } from "./RHSPropEntry";
import { PiProperty } from "../../../../languagedef/metalanguage";
import { getTypeCall, makeIndent } from "../GrammarUtils";
import { getBaseTypeAsString } from "../../../../utils";
import { internalTransformList} from "../../ParserGenUtil";

export class RHSPartListEntry extends RHSPropEntry {
    constructor(prop: PiProperty) {
        super(prop);
        this.property = prop;
        this.isList = true;
    }

    toGrammar(): string {
        return `${getTypeCall(this.property.type.referred)}*` + this.doNewline();
    }

    toMethod(propIndex: number, nodeName: string): string {
        const baseType: string = getBaseTypeAsString(this.property);
        return `${this.property.name} = this.${internalTransformList}<${baseType}>(${nodeName}[${propIndex}]); // RHSPartListEntry\n`;
    }

    toString(depth: number): string {
        let indent = makeIndent(depth);
        return indent + "RHSPartListEntry: " + this.property.name;
    }
}
