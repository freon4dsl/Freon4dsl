import { RHSPropPartWithSeparator } from "./RHSPropPartWithSeparator";
import { RHSPropEntry } from "./RHSPropEntry";
import { PiProperty } from "../../../../languagedef/metalanguage";
import { internalTransformNode, ParserGenUtil } from "../../ParserGenUtil";
import { makeIndent } from "../GrammarUtils";

export class RHSListGroup extends RHSPropPartWithSeparator {
    // (propTypeName 'joinText' )*
    private entry: RHSPropEntry;
    private isSingleEntry: boolean;

    constructor(prop: PiProperty, entry: RHSPropEntry, separator: string, isSingleEntry: boolean) {
        super(prop, separator);
        this.entry = entry;
        this.isList = true;
        this.isSingleEntry = isSingleEntry;
    }

    toGrammar(): string {
        return `( ${this.entry.toGrammar()} '${this.separatorText}' )*\n\t`;
    }

    toMethod(index: number, nodeName: string, mainAnalyserName: string): string {
        // When this RHS is the only entry in the grammar rule, e.g. "Concept1 = ( PitExp ';' )* ;",
        // the actual list that must be transformed cannot be found using 'getChildren'.
        // TODO ask David
        let myListStatement: string = `const _myList = this.${mainAnalyserName}.getChildren(${nodeName}[${index}]);`;
        if (this.isSingleEntry) {
            myListStatement = `const _myList = ${nodeName};`;
        }
        return `// RHSListGroup  
            ${ParserGenUtil.internalName(this.property.name)} = [];
            ${myListStatement}
            _myList.forEach(subNode => {  
                const _transformed = this.${mainAnalyserName}.${internalTransformNode}(subNode.nonSkipChildren?.toArray()[0]);  
                if (!!_transformed) {      
                    ${ParserGenUtil.internalName(this.property.name)}.push(_transformed);
                }
            });`;
    }

    toString(depth: number): string {
        let indent = makeIndent(depth + 1);
        return indent + "RHSListGroup: " + indent + this.entry.toString(depth + 1) + " " + this.separatorText;
    }
}
