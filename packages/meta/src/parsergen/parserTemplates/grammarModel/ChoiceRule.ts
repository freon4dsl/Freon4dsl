import { GrammarRule } from "./GrammarRule.js";
import type { FreMetaClassifier } from "../../../languagedef/metalanguage/index.js";
import { FreMetaBinaryExpressionConcept } from "../../../languagedef/metalanguage/index.js";
import { getTypeCall } from "./GrammarUtils.js";
import { BinaryExpMaker } from "../BinaryExpMaker.js";
import { ParserGenUtil } from "../ParserGenUtil.js";
import { Names } from '../../../utils/on-lang/index.js';

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
                // there are binaries
                // exclude binary expression concepts
                rule = `${this.ruleName} = ${implementorsNoBinaries
                    .map((implementor) => `${getTypeCall(implementor)} `)
                    .join("\n    | ")}`;
                // add the special binary concept rule(s) as choice
                const expBases = ParserGenUtil.findAllExpressionBases(
                    this.implementors.filter(
                        (sub) => sub instanceof FreMetaBinaryExpressionConcept,
                    ) as FreMetaBinaryExpressionConcept[],
                );
                if (implementorsNoBinaries.length > 0) {
                    // there are already choices present in the rule, so add a '|' as separator
                    rule += "\n    | ";
                }
                expBases.forEach((base) => {
                    rule += `${BinaryExpMaker.getBinaryRuleName(base)} ;`;
                });
            } else {
                // normal choice rule
                rule = `${this.ruleName} = ${this.implementors
                    .map((implementor) => `${getTypeCall(implementor)} `)
                    .join("\n    | ")} ;`;
            }
        } else {
            rule = `${this.ruleName} = 'ERROR' ; // there are no concepts that implement this interface or extend this abstract concept`;
        }
        return rule;
    }

    toMethod(): string {
        const baseType: string = Names.classifier(this.myConcept);
        return `
            ${ParserGenUtil.makeComment(this.toGrammar())}
            public transform${this.ruleName}(nodeInfo: SpptDataNodeInfo, children: KtList<object>, sentence: Sentence) : ${baseType} {
                // console.log('3 transform${this.ruleName} called: ' + children.toString());
                return children.asJsReadonlyArrayView()[0] as ${baseType};
            }`;
    }
}
