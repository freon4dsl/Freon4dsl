import { FreBinaryExpressionConcept, FreClassifier, FreExpressionConcept, FreLanguage } from "../../languagedef/metalanguage";
import { PiEditProjectionGroup, PiEditUnit } from "../../editordef/metalanguage";
import { GrammarRule } from "./grammarModel/GrammarRule";
import { BinaryExpressionRule } from "./grammarModel/BinaryExpressionRule";
import { GenerationUtil } from "../../utils";

export class BinaryExpMaker {
    private static specialBinaryRuleName = `__pi_binary_`;
    imports: FreClassifier[] = [];

    public static getBinaryRuleName(expBase:FreExpressionConcept) {
        return BinaryExpMaker.specialBinaryRuleName + expBase.name;
    }

    public generateBinaryExpressions(language:FreLanguage, projectionGroup: PiEditProjectionGroup, binaryConceptsUsed: FreBinaryExpressionConcept[]): GrammarRule[] {
        const result: GrammarRule[] = [];

        // in case there are multiple expression hierarchies, we need to group the binaries based on their expressionBase
        const groups: Map<FreExpressionConcept, FreBinaryExpressionConcept[]> = new Map<FreBinaryExpressionConcept, FreBinaryExpressionConcept[]>();
        binaryConceptsUsed.forEach(bin => {
            const expBase: FreExpressionConcept = GenerationUtil.findExpressionBase(bin);
            if (groups.has(expBase)) {
                groups.get(expBase).push(bin);
            } else {
                groups.set(expBase, [bin]);
            }
        });

        groups.forEach((binaries: FreBinaryExpressionConcept[], expBase: FreExpressionConcept) => {
            // common information
            const editDefs: Map<FreClassifier, string> = this.findEditDefs(binaries, projectionGroup);
            const branchName = BinaryExpMaker.getBinaryRuleName(expBase);

            this.imports.push(expBase);
            this.imports.push(...binaries);

            result.push( new BinaryExpressionRule(branchName, expBase, editDefs));
        })

        return result;
    }

    private findEditDefs(binaryConceptsUsed: FreBinaryExpressionConcept[], projectionGroup: PiEditProjectionGroup): Map<FreClassifier, string> {
        let result: Map<FreClassifier, string> = new Map<FreClassifier, string>();
        for (const binCon of binaryConceptsUsed) {
            const mySymbol = projectionGroup.findExtrasForType(binCon).symbol;
            result.set(binCon, mySymbol);
        }
        return result;
    }
}
