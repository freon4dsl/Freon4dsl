import { RHSPropEntry } from "./RHSPropEntry.js";
import { FreMetaBinaryExpressionConcept, FreMetaProperty } from "../../../../languagedef/metalanguage/index.js";
import { makeIndent } from "../GrammarUtils.js";
import { BinaryExpMaker } from "../../BinaryExpMaker.js";
import { GenerationUtil } from "../../../../utils/index.js";
import { internalTransformNode, ParserGenUtil } from "../../ParserGenUtil.js";

export class RHSBinExpListWithTerminator extends RHSPropEntry {
    type: FreMetaBinaryExpressionConcept;
    private readonly separatorText: string = "";
    private readonly isSingleEntry: boolean;

    constructor(
        prop: FreMetaProperty,
        type: FreMetaBinaryExpressionConcept,
        separatorText: string,
        isSingleEntry: boolean,
    ) {
        super(prop);
        this.type = type;
        this.isList = true;
        this.isSingleEntry = isSingleEntry;
        this.separatorText = separatorText;
    }

    toGrammar(): string {
        return (
            `( ${BinaryExpMaker.getBinaryRuleName(GenerationUtil.findExpressionBase(this.type))} '${this.separatorText}' )*` +
            this.doNewline()
        );
    }

    toMethod(index: number, nodeName: string, mainAnalyserName: string): string {
        // TODO this method is equal to the one in RHSPartListWithTerminator
        // When this RHS is the only entry in the grammar rule, e.g. "Concept1 = ( FretExp ';' )* ;",
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
        const indent = makeIndent(depth);
        return indent + "RHSBinaryExp: " + this.property.name + ": " + this.type.name;
    }
}
