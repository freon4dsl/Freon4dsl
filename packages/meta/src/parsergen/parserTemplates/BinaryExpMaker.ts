import { PiBinaryExpressionConcept, PiClassifier, PiExpressionConcept, PiLanguage } from "../../languagedef/metalanguage";
import { PiEditUnit } from "../../editordef/metalanguage";
import { GrammarRule } from "./grammarModel/GrammarRule";
import { BinaryExpressionRule } from "./grammarModel/BinaryExpressionRule";

export class BinaryExpMaker {
    static specialBinaryRuleName = `__pi_binary_expression`;
    imports: PiClassifier[] = [];

    public generateBinaryExpressions(language:PiLanguage, editUnit: PiEditUnit, binaryConceptsUsed: PiBinaryExpressionConcept[]): GrammarRule {
        // common information
        const expressionBase: PiExpressionConcept = language.findExpressionBase();
        const editDefs: Map<PiClassifier, string> = this.findEditDefs(binaryConceptsUsed, editUnit);
        const branchName = BinaryExpMaker.specialBinaryRuleName;

        this.imports.push(expressionBase);
        this.imports.push(...binaryConceptsUsed);

        return new BinaryExpressionRule(branchName, expressionBase, editDefs);
    }

    private findEditDefs(binaryConceptsUsed: PiBinaryExpressionConcept[], editUnit: PiEditUnit): Map<PiClassifier, string> {
        let result: Map<PiClassifier, string> = new Map<PiClassifier, string>();
        for (const binCon of binaryConceptsUsed) {
            const mySymbol = editUnit.findExtrasForType(binCon).symbol;
            result.set(binCon, mySymbol);
        }
        return result;
    }
}
