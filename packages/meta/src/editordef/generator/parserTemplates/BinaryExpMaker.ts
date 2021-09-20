import { PiBinaryExpressionConcept, PiClassifier, PiExpressionConcept, PiLanguage } from "../../../languagedef/metalanguage";
import { PiEditConcept, PiEditUnit } from "../../metalanguage";
import { Names } from "../../../utils";

export class BinaryExpMaker {
    static specialBinaryRuleName = `__pi_binary_expression`;
    generatedParseRules: string[] = [];
    generatedSyntaxAnalyserMethods: string[] = [];
    branchNames: string[] = [];
    imports: PiClassifier[] = [];

    public generateBinaryExpressions(language:PiLanguage, editUnit: PiEditUnit, binaryConceptsUsed: PiBinaryExpressionConcept[]) {

        // common information
        const expressionBase: PiExpressionConcept = language.findExpressionBase();
        const editDefs: PiEditConcept[] = this.findEditDefs(binaryConceptsUsed, editUnit);
        const branchName = BinaryExpMaker.specialBinaryRuleName;

        // parse rule(s)
        this.imports.push(expressionBase);
        const rule1: string = `${branchName} = [${Names.concept(expressionBase)} / __pi_binary_operator]2+`;
        const rule2: string = `leaf __pi_binary_operator = ${editDefs.map(def => `'${def.symbol}'`).join(" | ")}`
        this.generatedParseRules.push(rule1);
        this.generatedParseRules.push(rule2);

        // to be used as part of the if-statement in transformBranch()
        this.branchNames.push(branchName);

        // syntax analysis method(s)
        // TODO get the right type for 'BinaryExpression' in stead of ${Names.concept(expressionBase)}

        this.imports.push(...binaryConceptsUsed);
        this.generatedSyntaxAnalyserMethods.push(`
        /**
         * Generic method to transform binary expressions.
         * Binary expressions are parsed according to these rules:
         * ${rule1}
         * ${rule2}
         *
         * In this method we build a crooked tree, which in a later phase needs to be balanced
         * according to the priorities of the operators.
         * @param branch
         * @private
         */
        private transform${branchName}(branch: SPPTBranch) : ${Names.concept(expressionBase)} {
            // console.log("transform${branchName} called");
            const children = branch.nonSkipChildren.toArray();
            const actualList = children[0].nonSkipChildren.toArray();
            let index = 0;
            let first = this.transformNode(actualList[index++]);
            while (index < actualList.length) {
                let operator = this.transformNode(actualList[index++]);
                let second = this.transformNode(actualList[index++]);
                let combined: ${Names.concept(expressionBase)} = null;
                switch (operator) {
                ${editDefs.map(def => `
                    case '${def.symbol}': {
                        combined = ${Names.concept(def.concept.referred)}.create({left: first, right: second});
                        break;
                    }`).join("")}
                    default: {
                        combined = null;
                    }
                }
                first = combined;
            }
            return first;
        }`);
    }

    private findEditDefs(binaryConceptsUsed: PiBinaryExpressionConcept[], editUnit: PiEditUnit): PiEditConcept[] {
        let result: PiEditConcept[] = [];
        for (const binCon of binaryConceptsUsed) {
            result.push(editUnit.findConceptEditor(binCon));
        }
        return result;
    }
}
