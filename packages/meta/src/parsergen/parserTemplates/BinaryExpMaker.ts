import { PiBinaryExpressionConcept, PiClassifier, PiConcept, PiExpressionConcept, PiLanguage } from "../../languagedef/metalanguage";
import { PiEditUnit } from "../../editordef/metalanguage";
import { GrammarRule } from "./grammarModel/GrammarRule";
import { BinaryExpressionRule } from "./grammarModel/BinaryExpressionRule";

export class BinaryExpMaker {
    static specialBinaryRuleName = `__pi_binary_expression`;
    imports: PiClassifier[] = [];

    public generateBinaryExpressions(language:PiLanguage, editUnit: PiEditUnit, binaryConceptsUsed: PiBinaryExpressionConcept[]): GrammarRule {
        // common information
        const expressionBase: PiExpressionConcept = language.findExpressionBase();
        const editDefs: Map<PiConcept, string> = this.findEditDefs(binaryConceptsUsed, editUnit);
        const branchName = BinaryExpMaker.specialBinaryRuleName;

        this.imports.push(expressionBase);
        this.imports.push(...binaryConceptsUsed);


        return new BinaryExpressionRule(branchName, expressionBase, editDefs);
    }

    private findEditDefs(binaryConceptsUsed: PiBinaryExpressionConcept[], editUnit: PiEditUnit): Map<PiConcept, string> {
        let result: Map<PiConcept, string> = new Map<PiConcept, string>();
        for (const binCon of binaryConceptsUsed) {
            const piEditConcept = editUnit.findConceptEditor(binCon);
            result.set(piEditConcept.concept.referred, piEditConcept.symbol);
        }
        return result;
    }
}
