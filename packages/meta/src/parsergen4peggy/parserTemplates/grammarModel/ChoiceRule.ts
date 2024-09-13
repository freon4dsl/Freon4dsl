import { GrammarRule } from "./GrammarRule.js";
import { FreMetaBinaryExpressionConcept, FreMetaClassifier } from "../../../languagedef/metalanguage/index.js";
import { getTypeCall } from "./GrammarUtils.js";
import { BinaryExpMaker } from "../BinaryExpMaker.js";
import { internalTransformNode, ParserGenUtil } from "../ParserGenUtil.js";
import { Names } from "../../../utils/index.js";

export class ChoiceRule extends GrammarRule {
    implementors: FreMetaClassifier[];
    myConcept: FreMetaClassifier;

    constructor(ruleName: string, myConcept: FreMetaClassifier, implementors: FreMetaClassifier[]) {
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
            const implementorsNoBinaries = this.implementors.filter(
                (sub) => !(sub instanceof FreMetaBinaryExpressionConcept),
            );
            if (this.implementors.length !== implementorsNoBinaries.length) {
                // There are binaries, make two separate rules, one with the 'single' expression,
                // the second with the choice between single and binary expression(s).
                rule = this.makeRulesWithBinaries(implementorsNoBinaries);
            } else {
                // Make a normal choice rule
                rule = `${this.ruleName} = ${this.makeNormalChoice(implementorsNoBinaries)}`;
            }
        } else {
            rule = `${this.ruleName} = 'ERROR' ; // there are no concepts that implement this interface or extend this abstract concept`;
        }
        return rule;
    }

    protected makeNormalChoice(implementorsNoBinaries: FreMetaClassifier[]): string {
        const choices: string[] = [];
        for(let i=0; i <implementorsNoBinaries.length; i++) {
            let negations: string = '';
            for(let j=i+1; j <implementorsNoBinaries.length; j++) {
                negations += `!${getTypeCall(implementorsNoBinaries[j])} `
            }
            choices.push(`${negations}__choice:${getTypeCall(implementorsNoBinaries[i])} {return __choice}`);
        }
        return `${choices.join("\n    / ")}`;
    }

    private makeRulesWithBinaries(implementorsNoBinaries: FreMetaClassifier[]): string {
        let rule: string = `${BinaryExpMaker.getNonBinaryRuleName(this.myConcept)} = ${this.makeNormalChoice(implementorsNoBinaries)}`;
        // Add the special binary concept rule(s) as choice in the second rule
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
        return rule;
    }

    nameToImport(): string {
        return '';
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
