import { RHSPropEntry } from "./RHSPropEntry.js";
import {
    FreMetaBinaryExpressionConcept,
    FreMetaProperty,
    LangUtil
} from '../../../../languagedef/metalanguage/index.js';
import { makeIndent } from "../GrammarUtils.js";
import { BinaryExpMaker } from "../../BinaryExpMaker.js";

import { ParserGenUtil } from "../../ParserGenUtil.js";

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
            `( ${BinaryExpMaker.getBinaryRuleName(LangUtil.findExpressionBase(this.type))} '${this.separatorText}' )*` +
            this.doNewline()
        );
    }

    toMethod(index: number, nodeName: string): string {
        // TODO this method is equal to the one in RHSPartListWithTerminator
        // When this RHS is the only entry in the grammar rule, e.g. "Concept1 = ( FretExp ';' )* ;",
        // the actual list that must be transformed cannot be found using 'getChildren'.
        // TODO ask David
        let myListStatement: string = `${nodeName}.asJsReadonlyArrayView()[${index}].toArray()`;
        if (this.isSingleEntry) {
            myListStatement = `${nodeName}.toArray()`;
        }
        return `// RHSBinExpListWithTerminator
            ${ParserGenUtil.internalName(this.property.name)} = [];
            ${myListStatement}.forEach((subNode: KtList<any>)  => {
                const _transformed = subNode.asJsReadonlyArrayView()[0];
                if (!!_transformed) {
                    ${ParserGenUtil.internalName(this.property.name)}.push(_transformed);
                }
            }); // end RHSBinExpListWithTerminator`;
    }

    toString(depth: number): string {
        const indent = makeIndent(depth);
        return indent + "RHSBinaryExp: " + this.property.name + ": " + this.type.name;
    }
}
