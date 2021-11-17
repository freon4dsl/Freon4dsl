import { GrammarRule } from "./GrammarRule";
import { PiClassifier, PiExpressionConcept } from "../../../languagedef/metalanguage";
import { Names } from "../../../utils";
import { internalTransformNode } from "../ParserGenUtil";
import { getTypeCall } from "./GrammarUtils";

export class BinaryExpressionRule extends GrammarRule {
    expressionBase: PiExpressionConcept;
    symbolToConcept: Map<PiClassifier, string> = new Map<PiClassifier, string>();

    constructor(ruleName: string, expressionBase: PiExpressionConcept, symbolToConcept: Map<PiClassifier, string>) {
        super();
        this.ruleName = ruleName;
        this.expressionBase = expressionBase;
        this.symbolToConcept = symbolToConcept;
    }

    toGrammar(): string {
        return `${this.rule1()}\n${this.rule2()}`;
    }

    toMethod(): string {
        // TODO get the right type for 'BinaryExpression' in stead of ${Names.concept(expressionBase)}
        let cases: string[] = [];
        for (const [key, value] of this.symbolToConcept) {
            cases.push(`
                case '${value}': {
                    combined = ${Names.classifier(key)}.create({left: first, right: second});
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
        private transform${this.ruleName}(branch: SPPTBranch) : ${Names.concept(this.expressionBase)} {
            // console.log('transform${this.ruleName} called: ' + branch.name);
            const children = branch.nonSkipChildren.toArray();
            const actualList = children[0].nonSkipChildren.toArray();
            let index = 0;
            let first = this.${internalTransformNode}(actualList[index++]);
            while (index < actualList.length) {
                let operator = this.${internalTransformNode}(actualList[index++]);
                let second = this.${internalTransformNode}(actualList[index++]);
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
        return `${(this.ruleName)} = [${getTypeCall(this.expressionBase)} / __pi_binary_operator]2+ ;`;
    }

    private rule2(): string {
        let cases: string[] = [];
        for (const value of this.symbolToConcept.values()) {
            cases.push(`'${value}'`);
        }
        return `leaf __pi_binary_operator = ${cases.map(c => `${c}`).join(" | ")} ;`;
    }
}
