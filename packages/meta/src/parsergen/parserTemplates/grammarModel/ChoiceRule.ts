import { GrammarRule } from "./GrammarRule";
import { PiBinaryExpressionConcept, PiClassifier } from "../../../languagedef/metalanguage";
import { getTypeCall } from "./GrammarUtils";
import { BinaryExpMaker } from "../BinaryExpMaker";
import { internalTransformNode, ParserGenUtil } from "../ParserGenUtil";
import { Names } from "../../../utils";

export class ChoiceRule extends GrammarRule {
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
                    `${getTypeCall(implementor)} `).join("\n    | ")}`;
                // add the special binary concept rule as choice
                rule += `\n    | ${BinaryExpMaker.specialBinaryRuleName} ;`;
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
