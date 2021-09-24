import { PiBinaryExpressionConcept, PiClassifier, PiExpressionConcept, PiLanguage } from "../../../languagedef/metalanguage";
import { PiEditConcept, PiEditUnit } from "../../metalanguage";
import { BinaryExpressionRule, GrammarRule } from "./grammarModel/GrammarRules";

export class BinaryExpMaker {
    static specialBinaryRuleName = `__pi_binary_expression`;
    generatedParseRules: string[] = [];
    generatedSyntaxAnalyserMethods: string[] = [];
    branchNames: string[] = [];
    imports: PiClassifier[] = [];

    public generateBinaryExpressions(language:PiLanguage, editUnit: PiEditUnit, binaryConceptsUsed: PiBinaryExpressionConcept[]): GrammarRule {
        // common information
        const expressionBase: PiExpressionConcept = language.findExpressionBase();
        const editDefs: PiEditConcept[] = this.findEditDefs(binaryConceptsUsed, editUnit);
        const branchName = BinaryExpMaker.specialBinaryRuleName;

        this.imports.push(expressionBase);
        this.imports.push(...binaryConceptsUsed);

        return new BinaryExpressionRule(branchName, expressionBase, editDefs);
    }

    private findEditDefs(binaryConceptsUsed: PiBinaryExpressionConcept[], editUnit: PiEditUnit): PiEditConcept[] {
        let result: PiEditConcept[] = [];
        for (const binCon of binaryConceptsUsed) {
            result.push(editUnit.findConceptEditor(binCon));
        }
        return result;
    }
}
