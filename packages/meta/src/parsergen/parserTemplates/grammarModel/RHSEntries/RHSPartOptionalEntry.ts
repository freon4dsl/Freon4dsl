import { RHSPropEntry } from "./RHSPropEntry";
import { PiProperty } from "../../../../languagedef/metalanguage";
import { getTypeCall, makeIndent } from "../GrammarUtils";
import { getBaseTypeAsString } from "../../../../utils";
import { internalTransformNode} from "../../ParserGenUtil";

export class RHSPartOptionalEntry extends RHSPropEntry {
    constructor(prop: PiProperty) {
        super(prop);
        this.isList = false;
    }

    toGrammar(): string {
        return `${getTypeCall(this.property.type.referred)}?` + this.doNewline();
    }

    toMethod(propIndex: number, nodeName: string): string {
        getBaseTypeAsString(this.property);
        return `// RHSPartOptionalEntry
            if (!${nodeName}[${propIndex}].isEmptyMatch) {
                // take the first element of the group that represents the optional part  
                const subNode = this.getGroup(${nodeName}[${propIndex}]).nonSkipChildren.toArray()[0];
                ${this.property.name} = this.${internalTransformNode}(subNode);
            }`;
    }

    toString(depth: number): string {
        let indent = makeIndent(depth);
        return indent + "RHSPartEntry: " + this.property.name;
    }
}
