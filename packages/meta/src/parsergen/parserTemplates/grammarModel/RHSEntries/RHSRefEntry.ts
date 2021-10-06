import { RHSPropEntry } from "./RHSPropEntry";
import { PiProperty } from "../../../../languagedef/metalanguage";
import { getBaseTypeAsString } from "../../../../utils";
import { makeIndent, refRuleName } from "../GrammarUtils";

export class RHSRefEntry extends RHSPropEntry {
    constructor(prop: PiProperty) {
        super(prop);
        this.isList = false;
    }

    toGrammar(): string {
        return refRuleName + this.doNewline();
    }

    toMethod(propIndex: number, nodeName: string): string {
        const baseType: string = getBaseTypeAsString(this.property);
        return `${this.property.name} = this.piElemRef<${baseType}>(${nodeName}[${propIndex}], '${baseType}'); // RHSRefEntry\n`;
    }

    toString(depth: number): string {
        let indent = makeIndent(depth);
        return indent + "RHSRefEntry: " + this.property.name;
    }
}
