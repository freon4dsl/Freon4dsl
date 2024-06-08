import { FreMetaBinaryExpressionConcept, FreMetaClassifier, FreMetaExpressionConcept } from "../../languagedef/metalanguage";
import { FreEditProjectionGroup } from "../../editordef/metalanguage";
import { GrammarRule, BinaryExpressionRule } from "./grammarModel";
import { GenerationUtil } from "../../utils";

export class BinaryExpMaker {
    private static specialBinaryRuleName = `__fre_binary_`;
    public static getBinaryRuleName(expBase: FreMetaExpressionConcept) {
        return BinaryExpMaker.specialBinaryRuleName + expBase.name;
    }

    imports: FreMetaClassifier[] = [];

    public generateBinaryExpressions(
                                     projectionGroup: FreEditProjectionGroup,
                                     binaryConceptsUsed: FreMetaBinaryExpressionConcept[]
                                    ): GrammarRule[] {
        const result: GrammarRule[] = [];

        // in case there are multiple expression hierarchies, we need to group the binaries based on their expressionBase
        const groups: Map<FreMetaExpressionConcept, FreMetaBinaryExpressionConcept[]> = new Map<FreMetaBinaryExpressionConcept, FreMetaBinaryExpressionConcept[]>();
        binaryConceptsUsed.forEach(bin => {
            const expBase: FreMetaExpressionConcept = GenerationUtil.findExpressionBase(bin);
            if (groups.has(expBase)) {
                groups.get(expBase).push(bin);
            } else {
                groups.set(expBase, [bin]);
            }
        });

        groups.forEach((binaries: FreMetaBinaryExpressionConcept[], expBase: FreMetaExpressionConcept) => {
            // common information
            const editDefs: Map<FreMetaClassifier, string> = this.findEditDefs(binaries, projectionGroup);
            const branchName = BinaryExpMaker.getBinaryRuleName(expBase);

            this.imports.push(expBase);
            this.imports.push(...binaries);

            result.push( new BinaryExpressionRule(branchName, expBase, editDefs));
        });

        return result;
    }

    private findEditDefs(binaryConceptsUsed: FreMetaBinaryExpressionConcept[], projectionGroup: FreEditProjectionGroup): Map<FreMetaClassifier, string> {
        const result: Map<FreMetaClassifier, string> = new Map<FreMetaClassifier, string>();
        for (const binCon of binaryConceptsUsed) {
            const mySymbol = projectionGroup.findExtrasForType(binCon).symbol;
            result.set(binCon, mySymbol);
        }
        return result;
    }
}
