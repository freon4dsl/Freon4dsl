import { RHSPropPartWithSeparator } from "./RHSPropPartWithSeparator";
import { RHSPropEntry } from "./RHSPropEntry";
import { PiProperty } from "../../../../languagedef/metalanguage";
import { getBaseTypeAsString } from "../../../../utils";
import { internalTransformList, ParserGenUtil } from "../../ParserGenUtil";
import { makeIndent } from "../GrammarUtils";

export class RHSPrimListGroup extends RHSPropPartWithSeparator {
    // `(${propTypeName} '${joinText}' )* /* option C */`
    private entry: RHSPropEntry;

    constructor(prop: PiProperty, entry: RHSPropEntry, separator: string) {
        super(prop, separator);
        this.entry = entry;
    }

    toGrammar(): string {
        return `( ${this.entry.toGrammar()} '${this.separatorText}' )*\n\t`;
    }

    toMethod(propIndex: number, nodeName: string): string {
        const baseType: string = getBaseTypeAsString(this.property);
        return `// RHSPrimListGroup 
            if (!${nodeName}[${propIndex}].isEmptyMatch) {
                // get the group that represents the optional primitive
                // because primitives are leafs in the grammar, there is no need to get the children of this group
                const subNode = this.getGroup(${nodeName}[${propIndex}]);
                ${ParserGenUtil.internalName(this.property.name)} = this.${internalTransformList}<${baseType}>(subNode, '${this.separatorText}');
            }`;
    }

    toString(depth: number): string {
        let indent = makeIndent(depth + 1);
        return indent + "RHSListGroup: " + indent + this.entry.toString(depth + 1) + " " + this.separatorText;
    }
}
