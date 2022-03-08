import { RHSPropPartWithSeparator } from "./RHSPropPartWithSeparator";
import { RHSPropEntry } from "./RHSPropEntry";
import { PiProperty } from "../../../../languagedef/metalanguage";
import { internalTransformNode, ParserGenUtil } from "../../ParserGenUtil";
import { makeIndent } from "../GrammarUtils";

export class RHSListGroup extends RHSPropPartWithSeparator {
    // `(${propTypeName} '${joinText}' )* /* option C */`
    private entry: RHSPropEntry;

    constructor(prop: PiProperty, entry: RHSPropEntry, separator: string) {
        super(prop, separator);
        this.entry = entry;
        this.isList = true;
    }

    toGrammar(): string {
        return `( ${this.entry.toGrammar()} '${this.separatorText}' )*\n\t`;
    }

    // toMethod(index: number, nodeName: string, mainAnalyserName: string): string {
    //     return `// RHSListGroup
    //         if (!${nodeName}[${index}].isEmptyMatch) {
    //             ${ParserGenUtil.internalName(this.property.name)} = [];
    //             for (const subNode of ${nodeName}[${index}].nonSkipChildren.toArray()) {
    //                 if (!!this.${mainAnalyserName}.getGroup(subNode).nonSkipChildren?.toArray()[0]) {
    //                     ${ParserGenUtil.internalName(this.property.name)}.push(this.${mainAnalyserName}.${internalTransformNode}(
    //                         this.${mainAnalyserName}.getGroup(subNode).nonSkipChildren.toArray()[0])
    //                     );
    //                 }
    //             }
    //         }`;
    // }

    toMethod(index: number, nodeName: string, mainAnalyserName: string): string {
        return `// RHSListGroup  
            ${ParserGenUtil.internalName(this.property.name)} = [];
            const _myList = this.${mainAnalyserName}.getChildren(${nodeName}[${index}]);
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
