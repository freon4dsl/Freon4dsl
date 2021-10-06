import { RHSPropEntry } from "./RHSPropEntry";
import { PiProperty } from "../../../../languagedef/metalanguage";
import { getBaseTypeAsString } from "../../../../utils";
import { makeIndent, refRuleName } from "../GrammarUtils";

export class RHSRefOptionalEntry extends RHSPropEntry {
    constructor(prop: PiProperty) {
        super(prop);
        this.isList = false;
    }

    toGrammar(): string {
        return `${refRuleName}?` + this.doNewline();
    }

    toMethod(propIndex: number, nodeName: string): string {
        const baseType: string = getBaseTypeAsString(this.property);
        return `// RHSRefOptionalEntry
            if (!${nodeName}[${propIndex}].isEmptyMatch) {
                // take the first element of the group that represents the optional part  
                const subNode = this.getGroup(${nodeName}[${propIndex}]).nonSkipChildren.toArray()[0];
                ${this.property.name} = this.piElemRef<${baseType}>(subNode, '${baseType}');
            }`;
    }

    toString(depth: number): string {
        let indent = makeIndent(depth);
        return indent + "RHSRefEntry: " + this.property.name;
    }
}
