import { GrammarRule } from "./GrammarRule";
import { FreClassifier, FreExpressionConcept } from "../../../languagedef/metalanguage";
import { Names } from "../../../utils";
import { internalTransformNode } from "../ParserGenUtil";
import { getTypeCall } from "./GrammarUtils";

export class BinaryExpressionRule extends GrammarRule {
    expressionBase: FreExpressionConcept;
    private symbolToConcept: Map<FreClassifier, string> = new Map<FreClassifier, string>();

    constructor(ruleName: string, expressionBase: FreExpressionConcept, symbolToConcept: Map<FreClassifier, string>) {
        super();
        this.ruleName = ruleName;
        this.expressionBase = expressionBase;
        this.symbolToConcept = symbolToConcept;
    }

    toGrammar(): string {
        return `${this.rule1()}\n${this.rule2()}`;
    }

    toMethod(mainAnalyserName: string): string {
        let cases: string[] = [];
        for (const [key, value] of this.symbolToConcept) {
            // TODO add parse location: $parseLocation: this.mainAnalyser.location(branch)
            cases.push(`
                case '${value}': {
                    combined = ${Names.classifier(key)}.create({left: first, right: second, parseLocation: this.${mainAnalyserName}.location(branch)});
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
         * @param branch
         * @private
         */
        public transform${this.ruleName}(branch: SPPTBranch) : ${Names.concept(this.expressionBase)} {
            // console.log('transform${this.ruleName} called: ' + branch.name);
            const children = branch.nonSkipChildren.toArray();
            let index = 0;
            let first = this.${mainAnalyserName}.${internalTransformNode}(children[index++]);
            while (index < children.length) {
                let operator = this.${mainAnalyserName}.${internalTransformNode}(children[index++]);
                let second = this.${mainAnalyserName}.${internalTransformNode}(children[index++]);
                let combined: ${Names.concept(this.expressionBase)} = null;
                switch (operator) {
                ${cases.map(c => `${c}`).join("")}
                    default: {
                        combined = null;
                    }
                }
                first = combined;
            }
            return first;
        }`;
    }

    private rule1(): string {
        return `${(this.ruleName)} = [${getTypeCall(this.expressionBase)} / __fre_binary_operator]2+ ;`;
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
        return `leaf __fre_binary_operator = ${cases.map(c => `${c}`).join(" | ")} ;`;
    }

    private sortOnLength(cases: string[]) {
        let result: string[] = [];
        result = cases.sort((a, b): number => {
            return a.length > b.length ? -1 : (a.length === b.length ? 0 : 1);
        });
        return result;
    }
}
