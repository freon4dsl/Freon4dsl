import { RHSPropEntry } from "./RHSPropEntry";
import { PiBinaryExpressionConcept, PiProperty } from "../../../../languagedef/metalanguage";
import { makeIndent } from "../GrammarUtils";
import { BinaryExpMaker } from "../../BinaryExpMaker";
import { findExpressionBase } from "../../../../utils";
import { internalTransformNode, ParserGenUtil } from "../../ParserGenUtil";

export class RHSBinExpListWithTerminator extends RHSPropEntry {
    type: PiBinaryExpressionConcept = null;
    private entry: RHSPropEntry;
    private separatorText: string = "";
    private isSingleEntry: boolean;

    constructor(prop: PiProperty, type: PiBinaryExpressionConcept, entry: RHSPropEntry, separatorText: string, isSingleEntry: boolean) {
        super(prop);
        this.type = type;
        this.entry = entry;
        this.isList = true;
        this.isSingleEntry = isSingleEntry;
        this.separatorText = separatorText;
    }

    toGrammar(): string {
        return `( ${BinaryExpMaker.getBinaryRuleName(findExpressionBase(this.type))} '${this.separatorText}' )*` + this.doNewline();
    }

    toMethod(index: number, nodeName: string, mainAnalyserName: string): string {
        // TODO this method is equal to the one in RHSPartListWithTerminator
        // When this RHS is the only entry in the grammar rule, e.g. "Concept1 = ( PitExp ';' )* ;",
        // the actual list that must be transformed cannot be found using 'getChildren'.
        // TODO ask David
        let myListStatement: string = `const _myList = this.${mainAnalyserName}.getChildren(${nodeName}[${index}]);`;
        if (this.isSingleEntry) {
            myListStatement = `const _myList = ${nodeName};`;
        }
        return `// RHSBinExpListWithTerminator  
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
        let indent = makeIndent(depth);
        return indent + "RHSBinaryExp: " + this.property.name + ": " + this.type.name;
    }
}
