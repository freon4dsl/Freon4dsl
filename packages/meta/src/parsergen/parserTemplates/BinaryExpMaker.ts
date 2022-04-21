import { PiBinaryExpressionConcept, PiClassifier, PiExpressionConcept, PiLanguage } from "../../languagedef/metalanguage";
import { PiEditProjectionGroup, PiEditUnit } from "../../editordef/metalanguage";
import { GrammarRule } from "./grammarModel/GrammarRule";
import { BinaryExpressionRule } from "./grammarModel/BinaryExpressionRule";
import { GenerationUtil } from "../../utils";

export class BinaryExpMaker {
    private static specialBinaryRuleName = `__pi_binary_`;
    imports: PiClassifier[] = [];

    public static getBinaryRuleName(expBase:PiExpressionConcept) {
        return BinaryExpMaker.specialBinaryRuleName + expBase.name;
    }

    public generateBinaryExpressions(language:PiLanguage, projectionGroup: PiEditProjectionGroup, binaryConceptsUsed: PiBinaryExpressionConcept[]): GrammarRule[] {
        const result: GrammarRule[] = [];

        // in case there are multiple expression hierarchies, we need to group the binaries based on their expressionBase
        const groups: Map<PiExpressionConcept, PiBinaryExpressionConcept[]> = new Map<PiBinaryExpressionConcept, PiBinaryExpressionConcept[]>();
        binaryConceptsUsed.forEach(bin => {
            const expBase: PiExpressionConcept = GenerationUtil.findExpressionBase(bin);
            if (groups.has(expBase)) {
                groups.get(expBase).push(bin);
            } else {
                groups.set(expBase, [bin]);
            }
        });

        groups.forEach((binaries: PiBinaryExpressionConcept[], expBase: PiExpressionConcept) => {
            // common information
            const editDefs: Map<PiClassifier, string> = this.findEditDefs(binaries, projectionGroup);
            const branchName = BinaryExpMaker.getBinaryRuleName(expBase);

            this.imports.push(expBase);
            this.imports.push(...binaries);

            result.push( new BinaryExpressionRule(branchName, expBase, editDefs));
        })

        return result;
    }

    private findEditDefs(binaryConceptsUsed: PiBinaryExpressionConcept[], projectionGroup: PiEditProjectionGroup): Map<PiClassifier, string> {
        let result: Map<PiClassifier, string> = new Map<PiClassifier, string>();
        for (const binCon of binaryConceptsUsed) {
            const mySymbol = projectionGroup.findExtrasForType(binCon).symbol;
            result.set(binCon, mySymbol);
        }
        return result;
    }
}
