import { RHSPropPartWithSeparator } from "./RHSPropPartWithSeparator.js";
import { RHSPropEntry } from "./RHSPropEntry.js";
import { FreMetaProperty } from "../../../../languagedef/metalanguage/index.js";
import { internalTransformFreNodeRef, ParserGenUtil } from "../../ParserGenUtil.js";
import { makeIndent } from "../GrammarUtils.js";
import { GenerationUtil } from "../../../../utils/index.js";

export class RHSRefListWithTerminator extends RHSPropPartWithSeparator {
    // (propTypeName 'joinText' )*
    private entry: RHSPropEntry;
    private readonly isSingleEntry: boolean;

    constructor(prop: FreMetaProperty, entry: RHSPropEntry, separator: string, isSingleEntry: boolean) {
        super(prop, separator);
        this.entry = entry;
        this.isList = true;
        this.isSingleEntry = isSingleEntry;
    }

    toGrammar(varName?: string): string {
        if (!varName || varName.length <= 0) {
            varName = ParserGenUtil.internalName(this.property.name);
        }
        return `${varName}:( ${this.entry.toGrammar("__innerList")} '${this.separatorText}' {return __innerList})*` + this.doNewline();
    }

    toMethod(index: number, nodeName: string, mainAnalyserName: string): string {
        // When this RHS is the only entry in the grammar rule, e.g. "Concept1 = ( FretExp ';' )* ;",
        // the actual list that must be transformed cannot be found using 'getChildren'.
        // TODO ask David
        let myListStatement: string = `const _myList = this.${mainAnalyserName}.getChildren(${nodeName}[${index}]);`;
        if (this.isSingleEntry) {
            myListStatement = `const _myList = ${nodeName};`;
        }
        const baseType: string = GenerationUtil.getBaseTypeAsString(this.property);
        return `// RHSRefListWithTerminator
            ${ParserGenUtil.internalName(this.property.name)} = [];
            ${myListStatement}
            _myList.forEach(subNode => {
                const _transformed = this.${mainAnalyserName}.${internalTransformFreNodeRef}<${baseType}>(subNode.nonSkipChildren?.toArray()[0], '${baseType}');
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
