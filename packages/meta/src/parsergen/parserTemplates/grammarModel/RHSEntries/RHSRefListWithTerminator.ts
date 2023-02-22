import { RHSPropPartWithSeparator } from "./RHSPropPartWithSeparator";
import { RHSPropEntry } from "./RHSPropEntry";
import { FreProperty } from "../../../../languagedef/metalanguage";
import { internalTransformFreNodeRef, ParserGenUtil } from "../../ParserGenUtil";
import { makeIndent } from "../GrammarUtils";
import { GenerationUtil } from "../../../../utils";

export class RHSRefListWithTerminator extends RHSPropPartWithSeparator {
    // (propTypeName 'joinText' )*
    private entry: RHSPropEntry;
    private readonly isSingleEntry: boolean;

    constructor(prop: FreProperty, entry: RHSPropEntry, separator: string, isSingleEntry: boolean) {
        super(prop, separator);
        this.entry = entry;
        this.isList = true;
        this.isSingleEntry = isSingleEntry;
    }

    toGrammar(): string {
        return `( ${this.entry.toGrammar()} '${this.separatorText}' )*` + this.doNewline();
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
