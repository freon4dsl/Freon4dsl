import { GrammarRule } from "./GrammarRule.js";
import { FreMetaBinaryExpressionConcept, FreMetaClassifier } from "../../../languagedef/metalanguage/index.js";
import { Names } from "../../../utils/index.js";
import { BinaryExpMaker } from "../BinaryExpMaker.js";
import { internalTransformNode, ParserGenUtil } from "../ParserGenUtil.js";
import { getTypeCall } from "./GrammarUtils.js";

export class SuperChoiceRule extends GrammarRule {
    // the same as ChoiceRule, except that the call to the implementors is never to '__pi_super_...'
    implementors: FreMetaClassifier[];
    myConcept: FreMetaClassifier;

    constructor(ruleName: string, myConcept: FreMetaClassifier, implementors: FreMetaClassifier[]) {
        super();
        this.ruleName = ruleName;
        this.implementors = implementors;
        this.myConcept = myConcept;
    }

    toGrammar(): string {
        // TODO this code is the same as in ChoiceRule.ts => see whether these can be merged
        let rule: string = "";
        if (this.implementors.length > 0) {
            // test to see if there is a binary expression concept here
            const implementorsNoBinaries = this.implementors.filter(sub => !(sub instanceof FreMetaBinaryExpressionConcept));
            if (this.implementors.length !== implementorsNoBinaries.length) { // there are binaries
                // exclude binary expression concepts
                rule = `${(this.ruleName)} = ${implementorsNoBinaries.map(implementor =>
                    `${this.getTypeCallExcludeSelf(implementor)} `).join("\n    | ")}`;
                // add the special binary concept rule(s) as choice
                const expBases = ParserGenUtil.findAllExpressionBases(
                    this.implementors.filter(sub => sub instanceof FreMetaBinaryExpressionConcept) as FreMetaBinaryExpressionConcept[]
                );
                if (implementorsNoBinaries.length > 0) { // there are already choices present in the rule, so add a '|' as separator
                    rule += "\n    | ";
                }
                expBases.forEach(base => {
                    rule += `${BinaryExpMaker.getBinaryRuleName(base)} ;`;
                });

            } else {
                // normal choice rule
                rule = `${(this.ruleName)} = ${this.implementors.map(implementor =>
                    `${this.getTypeCallExcludeSelf(implementor)} `).join("\n    | ")} ;`;
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

    getTypeCallExcludeSelf(propType: FreMetaClassifier): string {
        if (propType === this.myConcept) {
            return Names.classifier(propType);
        } else {
            return getTypeCall(propType);
        }

    }
}
