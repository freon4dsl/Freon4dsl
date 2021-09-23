import { PiBinaryExpressionConcept, PiClassifier, PiConcept, PiInterface, PiLimitedConcept } from "../../../languagedef/metalanguage";
import { LangUtil, Names } from "../../../utils";
import { BinaryExpMaker } from "./BinaryExpMaker";
import { ParserGenUtil } from "./ParserGenUtil";

export class ChoiceRuleMaker {
    generatedParseRules: string[] = [];
    generatedSyntaxAnalyserMethods: string[] = [];
    branchNames: string[] = [];
    imports: PiClassifier[] = [];

    // for interfaces and abstract concepts we create a parse rule that is a choice between all classifiers
    // that either implement or extend the concept
    // because limited concepts can only be used as reference, these are excluded for this choice
    generateChoiceRules(interfacesAndAbstractsUsed: PiClassifier[]) {
        for (const piClassifier of interfacesAndAbstractsUsed) {
            // parse rule(s)
            const branchName = Names.classifier(piClassifier);
            // find the choices for this rule: all concepts that implement or extend the concept
            let implementors: PiClassifier[] = [];
            if (piClassifier instanceof PiInterface) {
                // do not include sub-interfaces, because then we might have 'multiple inheritance' problems
                // instead find the direct implementors and add them
                for (const intf of piClassifier.allSubInterfacesDirect()) {
                    implementors.push(...LangUtil.findImplementorsDirect(intf))
                }
                implementors.push(...LangUtil.findImplementorsDirect(piClassifier));
            } else if (piClassifier instanceof PiConcept) {
                implementors = piClassifier.allSubConceptsDirect();
            }
            // sort the concepts: concepts that have literals in them should go last, because the parser treats them with priority
            implementors = implementors.filter(sub => !(sub instanceof PiLimitedConcept));
            implementors = this.sortImplementors(implementors);

            let rule: string = "";
            if (implementors.length > 0) {
                // normal choice rule
                rule = `${branchName} = ${implementors.map(implementor =>
                    `${Names.classifier(implementor)} `).join("\n    | ")} ;`;

                // test to see if there is a binary expression concept here
                let implementorsNoBinaries = implementors.filter(sub => !(sub instanceof PiBinaryExpressionConcept));
                if (implementors.length != implementorsNoBinaries.length) {
                    // override the choice rule to exclude binary expression concepts
                    rule = `${branchName} = ${implementorsNoBinaries.map(implementor =>
                        `${Names.classifier(implementor)} `).join("\n    | ")}`;
                    // add the special binary concept rule as choice
                    rule += `\n    | ${BinaryExpMaker.specialBinaryRuleName} ;`
                }
                this.generatedParseRules.push(rule);
            } else {
                this.generatedParseRules.push(`${branchName} = "ERROR: there are no concepts that implement this interface or extends this abstract concept."`);
            }

            // to be used as part of the if-statement in transformBranch()
            this.branchNames.push(branchName);

            // syntax analysis methods
            this.imports.push(piClassifier);
            this.generatedSyntaxAnalyserMethods.push(`
            ${ParserGenUtil.makeComment(rule)}
            private transform${branchName}(branch: SPPTBranch) : ${Names.classifier(piClassifier)} {
                // console.log("transform${branchName} called");
                return this.transformNode(branch.nonSkipChildren.toArray()[0]);
            }`);
        }
    }

    /**
     * returns the list of classifiers with all classifiers that have primitive properties
     * as last
     * @param implementors
     * @private
     */
    private sortImplementors(implementors: PiClassifier[]): PiClassifier[] {
        // TODO should be done recursively!!!
        // TODO if this works then the ref-correction can be done differently
        let result: PiClassifier[] = [];
        let withPrims: PiClassifier[] = [];
        for (const concept of implementors) {
            if (concept.primProperties.length > 0 ) {
                // there are primitive props, move this implementor to the end
                withPrims.push(concept);
            } else {
                result.push(concept);
            }
        }
        result.push(...withPrims);
        return result;
    }
}
