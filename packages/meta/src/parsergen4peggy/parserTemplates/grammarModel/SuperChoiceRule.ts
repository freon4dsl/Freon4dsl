import { FreMetaBinaryExpressionConcept, FreMetaClassifier } from "../../../languagedef/metalanguage/index.js";
import { Names } from "../../../utils/index.js";
import { BinaryExpMaker } from "../BinaryExpMaker.js";
import { ParserGenUtil } from "../ParserGenUtil.js";
import { getTypeCall } from "./GrammarUtils.js";
import { ChoiceRule } from "./ChoiceRule.js";

export class SuperChoiceRule extends ChoiceRule {
    // the same as ChoiceRule, except that the call to the implementors is never to '__fre_super_...'

    constructor(ruleName: string, myConcept: FreMetaClassifier, implementors: FreMetaClassifier[]) {
        super(ruleName, myConcept, implementors);
    }

    toGrammar(): string {
        // TODO this code is the same as in ChoiceRule.ts => see whether these can be merged
        let rule: string = "";
        if (this.implementors.length > 0) {
            // test to see if there is a binary expression concept here
            const implementorsNoBinaries = this.implementors.filter(
                (sub) => !(sub instanceof FreMetaBinaryExpressionConcept),
            );
            if (this.implementors.length !== implementorsNoBinaries.length) {
                // There are binaries, make two separate rules, one with the 'single' expression,
                // the second with the choice between single and binary expression(s).
                rule = `${BinaryExpMaker.getNonBinaryRuleName(this.myConcept)} = ${implementorsNoBinaries
                    .map((implementor) => `${this.getTypeCallExcludeSelf(implementor)} `)
                    .join("\n    / ")}`;
                // add the special binary concept rule(s) as choice
                const expBases = ParserGenUtil.findAllExpressionBases(
                    this.implementors.filter(
                        (sub) => sub instanceof FreMetaBinaryExpressionConcept,
                    ) as FreMetaBinaryExpressionConcept[],
                );
                // Make the second rule
                rule += `\n\n${this.ruleName} = `;
                expBases.forEach((base) => {
                    rule += `${BinaryExpMaker.getBinaryRuleName(base)} / `;
                });
                rule += `${BinaryExpMaker.getNonBinaryRuleName(this.myConcept)}`;
            } else {
                // Make a normal choice rule
                rule = `${this.ruleName} = ${this.makeNormalChoice(implementorsNoBinaries)}`;
            }
        } else {
            rule = `${this.ruleName} = 'ERROR' ; // there are no concepts that implement this interface or extend this abstract concept`;
        }
        return rule;
    }

    getTypeCallExcludeSelf(propType: FreMetaClassifier): string {
        if (propType === this.myConcept) {
            return Names.classifier(propType);
        } else {
            return getTypeCall(propType);
        }
    }
}
