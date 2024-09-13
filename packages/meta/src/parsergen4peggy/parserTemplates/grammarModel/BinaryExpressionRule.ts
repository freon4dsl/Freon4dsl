import { GrammarRule } from "./GrammarRule.js";
import { FreMetaClassifier, FreMetaExpressionConcept } from "../../../languagedef/metalanguage/index.js";
import { Names } from "../../../utils/index.js";
import { getTypeCall } from "./GrammarUtils.js";
import {BinaryExpMaker} from "../BinaryExpMaker.js";

export class BinaryExpressionRule extends GrammarRule {
    expressionBase: FreMetaExpressionConcept;
    private readonly symbolToConcept: Map<FreMetaClassifier, string> = new Map<FreMetaClassifier, string>();

    constructor(
        ruleName: string,
        expressionBase: FreMetaExpressionConcept,
        symbolToConcept: Map<FreMetaClassifier, string>,
    ) {
        super();
        this.ruleName = ruleName;
        this.expressionBase = expressionBase;
        this.symbolToConcept = symbolToConcept;
    }

    toGrammar(): string {
        return `${this.rule1()}\n${this.rule2()}`;
    }

    nameToImport(): string {
        if (!!this.expressionBase) {
            return Names.classifier(this.expressionBase);
        } else {
            return '';
        }
    }

    toMethod(): string {
        const cases: string[] = [];
        for (const [key, value] of this.symbolToConcept) {
            // TODO add parse location: $parseLocation: this.mainAnalyser.location(branch)
            cases.push(`
                case '${value}': {
                    combined = ${Names.classifier(key)}.create({left: left, right: right, parseLocation: left.parseLocation});
                    break;
                }`);
        }
        return `
        /**
* Generic method to transform binary expressions, which are parsed
* according to these rules:
* ${this.rule1()}
* ${this.rule2()}
*
* In this method we build a crooked tree, which in a later phase needs to be balanced
* according to the priorities of the operators.
* @param left
* @param operator
* @param right
*/
        export function createBinaryExpression(left: ${Names.concept(this.expressionBase)}, operator: string, right: ${Names.concept(this.expressionBase)}): ${Names.concept(this.expressionBase)} | undefined {
        let combined: ${Names.concept(this.expressionBase)} = undefined;
        switch (operator) {
            ${cases.map((c) => `${c}`).join("")}
                default: {
                    combined = null;
                }
            }
            return combined;
        }`
    }

    // toMethod(mainAnalyserName: string): string {
    //     const cases: string[] = [];
    //     for (const [key, value] of this.symbolToConcept) {
    //         // TODO add parse location: $parseLocation: this.mainAnalyser.location(branch)
    //         cases.push(`
    //             case '${value}': {
    //                 combined = ${Names.classifier(key)}.create({left: left, right: right, parseLocation: left.parseLocation});
    //                 break;
    //             }`);
    //     }
    //     return `
    //     /**
    //      * Generic method to transform binary expressions, which are parsed
    //      * according to these rules:
    //      * ${this.rule1()}
    //      * ${this.rule2()}
    //      *
    //      * In this method we build a crooked tree, which in a later phase needs to be balanced
    //      * according to the priorities of the operators.
    //      * @param branch
    //      * @private
    //      */
    //     public transform${this.ruleName}(branch: SPPTBranch) : ${Names.concept(this.expressionBase)} {
    //         // console.log('transform${this.ruleName} called: ' + branch.name);
    //         const children = branch.nonSkipChildren.toArray();
    //         let index = 0;
    //         let first = this.${mainAnalyserName}.${internalTransformNode}(children[index++]);
    //         while (index < children.length) {
    //             let operator = this.${mainAnalyserName}.${internalTransformNode}(children[index++]);
    //             let second = this.${mainAnalyserName}.${internalTransformNode}(children[index++]);
    //             let combined: ${Names.concept(this.expressionBase)} = null;
    //             switch (operator) {
    //             ${cases.map((c) => `${c}`).join("")}
    //                 default: {
    //                     combined = null;
    //                 }
    //             }
    //             first = combined;
    //         }
    //         return first;
    //     }`;
    // }

    private rule1(): string {
        const singleExpressionRule: string = BinaryExpMaker.getNonBinaryRuleName(this.expressionBase);
        return `${this.ruleName} = __left:${singleExpressionRule} ws __op:__fre_binary_operator ws __right:${getTypeCall(this.expressionBase)}
{ return helper.createBinaryExpression(__left, __op, __right) }\n`
    }

    private rule2(): string {
        let cases: string[] = [];
        for (const value of this.symbolToConcept.values()) {
            cases.push(`'${value}'`);
        }
        // We need to sort the operands, because longer operands may start with a shorter one.
        // The longer ones must be given precedence by putting them first in the parse rule.
        // E.g. "==>" needs to come before "==".
        cases = this.sortOnLength(cases);
        return `__fre_binary_operator = ${cases.map((c) => `${c}`).join(" / ")} ;`;
    }

    private sortOnLength(cases: string[]) {
        let result: string[];
        result = cases.sort((a, b): number => {
            return a.length > b.length ? -1 : a.length === b.length ? 0 : 1;
        });
        return result;
    }

    helperImports(): FreMetaClassifier[] {
        const result: FreMetaClassifier[] = [this.expressionBase];
        for (let key of this.symbolToConcept.keys() ) {
            result.push(key);
        }
        return result;
    }
}
