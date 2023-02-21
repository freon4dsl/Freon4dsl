import { GrammarRule } from "./GrammarRule";
import { FreBinaryExpressionConcept, FreClassifier, FreExpressionConcept } from "../../../languagedef/metalanguage";
import { getTypeCall } from "./GrammarUtils";
import { BinaryExpMaker } from "../BinaryExpMaker";
import { internalTransformNode, ParserGenUtil } from "../ParserGenUtil";
import { Names } from "../../../utils";

export class ChoiceRule extends GrammarRule {
    implementors: FreClassifier[];
    myConcept: FreClassifier;

    constructor(ruleName: string, myConcept: FreClassifier, implementors: FreClassifier[]) {
        super();
        this.ruleName = ruleName;
        this.implementors = implementors;
        this.myConcept = myConcept;
    }

    toGrammar(): string {
        // TODO this code is the same as in SuperChoiceRule.ts => see whether these can be merged
        let rule: string = "";
        if (this.implementors.length > 0) {
            // test to see if there is a binary expression concept here
            const implementorsNoBinaries = this.implementors.filter(sub => !(sub instanceof FreBinaryExpressionConcept));
            if (this.implementors.length !== implementorsNoBinaries.length) { // there are binaries
                // exclude binary expression concepts
                rule = `${(this.ruleName)} = ${implementorsNoBinaries.map(implementor =>
                    `${getTypeCall(implementor)} `).join("\n    | ")}`;
                // add the special binary concept rule(s) as choice
                const expBases = ParserGenUtil.findAllExpressionBases(this.implementors
                    .filter(sub => sub instanceof FreBinaryExpressionConcept) as FreBinaryExpressionConcept[]);
                if (implementorsNoBinaries.length > 0) { // there are already choices present in the rule, so add a '|' as separator
                    rule += "\n    | ";
                }
                expBases.forEach(base => {
                    rule += `${BinaryExpMaker.getBinaryRuleName(base)} ;`;
                });
            } else {
                // normal choice rule
                rule = `${(this.ruleName)} = ${this.implementors.map(implementor =>
                    `${getTypeCall(implementor)} `).join("\n    | ")} ;`;
            }
        } else {
            rule = `${this.ruleName} = 'ERROR' ; // there are no concepts that implement this interface or extend this abstract concept`;
        }
        return rule;
    }

    toMethod(mainAnalyserName: string): string {
        return `
            ${ParserGenUtil.makeComment(this.toGrammar())}
            public transform${this.ruleName}(branch: SPPTBranch) : ${Names.classifier(this.myConcept)} {
                // console.log('transform${this.ruleName} called: ' + branch.name);
                return this.${mainAnalyserName}.${internalTransformNode}(branch.nonSkipChildren.toArray()[0]);
            }`;
    }
}
