import { RHSPropPartWithSeparator } from "./RHSPropPartWithSeparator.js";
import { RHSPropEntry } from "./RHSPropEntry.js";
import { FreMetaProperty } from "../../../../languagedef/metalanguage/index.js";
import { internalTransformRefList, ParserGenUtil } from "../../ParserGenUtil.js";
import { makeIndent } from "../GrammarUtils.js";
import { GenerationUtil } from '../../../../utils/on-lang/GenerationUtil.js';


export class RHSRefListWithTerminator extends RHSPropPartWithSeparator {
    // (propTypeName 'joinText' )*
    private entry: RHSPropEntry;
    // @ts-ignore
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

    toMethod(index: number, nodeName: string, mainAnalyserName: string): string {
        // When this RHS is the only entry in the grammar rule, e.g. "Concept1 = ( FretExp ';' )* ;",
        // the actual list that must be transformed cannot be found using 'getChildren'.
        // TODO ask David
        // let myListStatement: string = `${nodeName}.asJsReadonlyArrayView()[${index}]`;
        // if (this.isSingleEntry) {
        //     myListStatement = `${nodeName}`;
        // }
        const baseType: string = GenerationUtil.getBaseTypeAsString(this.property);
        return `// RHSRefListWithTerminator
        if (!!${nodeName}.asJsReadonlyArrayView()[${index}]) {
            ${ParserGenUtil.internalName(this.property.name)} = [];
            for (const child of (${nodeName}.asJsReadonlyArrayView()[${index}] as KtList<any>).asJsReadonlyArrayView()) {
                const _transformed = this.${mainAnalyserName}.${internalTransformRefList}<${baseType}>(child, "${baseType}");
                if (!!_transformed) {
                    ${ParserGenUtil.internalName(this.property.name)}.push(_transformed[0]);
                }
            }   
         }// end RHSRefListWithTerminator`
    }

    toString(depth: number): string {
        const indent = makeIndent(depth + 1);
        return indent + "RHSListGroup: " + indent + this.entry.toString(depth + 1) + " " + this.separatorText;
    }
}
