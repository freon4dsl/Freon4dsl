import { GrammarRule } from "./GrammarRule";
import { PiBinaryExpressionConcept, PiClassifier } from "../../../languagedef/metalanguage";
import { Names } from "../../../utils";
import { BinaryExpMaker } from "../BinaryExpMaker";
import { internalTransformNode, ParserGenUtil } from "../ParserGenUtil";
import { getTypeCall } from "./GrammarUtils";

export class SuperChoiceRule extends GrammarRule {
    // the same as ChoiceRule, except that the call to the implementors is never to '__pi_super_...'
    implementors: PiClassifier[];
    myConcept: PiClassifier;

    constructor(ruleName: string, myConcept: PiClassifier, implementors: PiClassifier[]) {
        super();
        this.ruleName = ruleName;
        this.implementors = implementors;
        this.myConcept = myConcept;
    }

    toGrammar(): string {
        let rule: string = "";
        if (this.implementors.length > 0) {
            // test to see if there is a binary expression concept here
            let implementorsNoBinaries = this.implementors.filter(sub => !(sub instanceof PiBinaryExpressionConcept));
            if (this.implementors.length != implementorsNoBinaries.length) { // there are binaries
                // exclude binary expression concepts
                rule = `${(this.ruleName)} = ${implementorsNoBinaries.map(implementor =>
                    `${this.getTypeCallExcludeSelf(implementor)} `).join("\n    | ")}`;
                // add the special binary concept rule(s) as choice
                const expBases = ParserGenUtil.findAllExpressionBases(this.implementors.filter(sub => sub instanceof PiBinaryExpressionConcept) as PiBinaryExpressionConcept[]);
                expBases.forEach(base => {
                    rule += `\n    | ${BinaryExpMaker.getBinaryRuleName(base)} ;`;
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

    getTypeCallExcludeSelf(propType: PiClassifier) : string {
        if (propType === this.myConcept) {
            return Names.classifier(propType);
        } else {
            return getTypeCall(propType);
        }

    }
}
