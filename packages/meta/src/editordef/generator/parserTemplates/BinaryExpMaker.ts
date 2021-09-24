import { PiBinaryExpressionConcept, PiClassifier, PiExpressionConcept, PiLanguage } from "../../../languagedef/metalanguage";
import { PiEditConcept, PiEditUnit } from "../../metalanguage";
import { BinaryExpressionRule } from "./grammarModel/GrammarModel";

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

        this.imports.push(expressionBase);
        this.imports.push(...binaryConceptsUsed);

        // parse rule(s)
        // BinaryExpressionRule creates two rules in its toGrammar() method
        // const rule1: string = `${branchName} = [${Names.concept(expressionBase)} / __pi_binary_operator]2+ ;`;
        // const rule2: string = `leaf __pi_binary_operator = ${editDefs.map(def => `'${def.symbol}'`).join(" | ")} ;`
        let rule: BinaryExpressionRule = new BinaryExpressionRule(branchName, expressionBase, editDefs);
        this.generatedParseRules.push(rule.toGrammar());

        // to be used as part of the if-statement in transformBranch()
        this.branchNames.push(branchName);

        // syntax analysis method(s)
        // TODO get the right type for 'BinaryExpression' in stead of ${Names.concept(expressionBase)}
        this.generatedSyntaxAnalyserMethods.push(rule.toMethod());
    }

    private findEditDefs(binaryConceptsUsed: PiBinaryExpressionConcept[], editUnit: PiEditUnit): PiEditConcept[] {
        let result: PiEditConcept[] = [];
        for (const binCon of binaryConceptsUsed) {
            result.push(editUnit.findConceptEditor(binCon));
        }
        return result;
    }
}
