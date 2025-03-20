import { RHSPropPartWithSeparator } from "./RHSPropPartWithSeparator.js";
import { RHSPropEntry } from "./RHSPropEntry.js";
import { FreMetaProperty } from "../../../../languagedef/metalanguage/index.js";
import { ParserGenUtil } from "../../ParserGenUtil.js";
import { makeIndent } from "../GrammarUtils.js";

export class RHSPartListWithTerminator extends RHSPropPartWithSeparator {
    // (propTypeName 'joinText' )*
    private entry: RHSPropEntry;
    private readonly isSingleEntry: boolean;

    constructor(prop: FreMetaProperty, entry: RHSPropEntry, separator: string, isSingleEntry: boolean) {
        super(prop, separator);
        this.entry = entry;
        this.isList = true;
        this.isSingleEntry = isSingleEntry;
    }

    toGrammar(): string {
        return `( ${this.entry.toGrammar()} '${this.separatorText}' )*` + this.doNewline();
    }

    toMethod(index: number, nodeName: string): string {
        // When this RHS is the only entry in the grammar rule, e.g. "Concept1 = ( FretExp ';' )* ;",
        // the actual list that must be transformed cannot be found using 'getChildren'.
        // TODO ask David
        let myListStatement: string = `const _myList = ${nodeName}.asJsReadonlyArrayView()[${index}].toArray();`;
        if (this.isSingleEntry) {
            myListStatement = `const _myList = ${nodeName}.toArray();`;
        }
        return `// RHSPartListWithTerminator
            ${ParserGenUtil.internalName(this.property.name)} = [];
            ${myListStatement}
            _myList.forEach(subNode => {
                const _transformed = subNode.asJsReadonlyArrayView()[0];
                if (!!_transformed) {
                    ${ParserGenUtil.internalName(this.property.name)}.push(_transformed);
                }
            });`;
    }

    toString(depth: number): string {
        const indent = makeIndent(depth + 1);
        return indent + "RHSListGroup: " + indent + this.entry.toString(depth + 1) + " " + this.separatorText;
    }
}
