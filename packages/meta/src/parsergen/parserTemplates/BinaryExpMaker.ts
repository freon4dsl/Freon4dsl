import {
    FreMetaBinaryExpressionConcept,
    FreMetaClassifier,
    FreMetaExpressionConcept, LangUtil
} from '../../languagedef/metalanguage/index.js';
import { FreEditExtraClassifierInfo, FreEditProjectionGroup } from "../../editordef/metalanguage/index.js";
import { GrammarRule, BinaryExpressionRule } from "./grammarModel/index.js";

export class BinaryExpMaker {
    private static specialBinaryRuleName = `__fre_binary_`;
    public static getBinaryRuleName(expBase: FreMetaExpressionConcept) {
        return BinaryExpMaker.specialBinaryRuleName + expBase.name;
    }

    imports: FreMetaClassifier[] = [];

    public generateBinaryExpressions(
        projectionGroup: FreEditProjectionGroup,
        binaryConceptsUsed: FreMetaBinaryExpressionConcept[],
    ): GrammarRule[] {
        const result: GrammarRule[] = [];

        // in case there are multiple expression hierarchies, we need to group the binaries based on their expressionBase
        const groups: Map<FreMetaExpressionConcept, FreMetaBinaryExpressionConcept[]> = new Map<
            FreMetaBinaryExpressionConcept,
            FreMetaBinaryExpressionConcept[]
        >();
        binaryConceptsUsed.forEach((bin) => {
            const expBase: FreMetaExpressionConcept = LangUtil.findExpressionBase(bin);
            if (groups.has(expBase)) {
                // @ts-ignore
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

            result.push(new BinaryExpressionRule(branchName, expBase, editDefs));
        });

        return result;
    }

    private findEditDefs(
        binaryConceptsUsed: FreMetaBinaryExpressionConcept[],
        projectionGroup: FreEditProjectionGroup,
    ): Map<FreMetaClassifier, string> {
        const result: Map<FreMetaClassifier, string> = new Map<FreMetaClassifier, string>();
        for (const binCon of binaryConceptsUsed) {
            const myExtras: FreEditExtraClassifierInfo | undefined = projectionGroup.findExtrasForType(binCon);
            if (!!myExtras) {
                const mySymbol: string = myExtras.symbol;
                result.set(binCon, mySymbol);
            }
        }
        return result;
    }
}
