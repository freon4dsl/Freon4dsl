import { FreClassifier, FreConcept} from "../../languagedef/metalanguage";
import { LangUtil, Names } from "../../utils";
import { GrammarRule } from "./grammarModel/GrammarRule";
import { ChoiceRule } from "./grammarModel/ChoiceRule";
import { SuperChoiceRule } from "./grammarModel/SuperChoiceRule";

export class ChoiceRuleMaker {
    static specialSuperName = `__pi_super_`;
    static superNames: Map<FreClassifier, string> = new Map<FreClassifier, string>();
    imports: FreClassifier[] = [];

    // for interfaces and abstract concepts we create a parse rule that is a choice between all classifiers
    // that either implement or extend the concept
    // because limited concepts can only be used as reference, these are excluded for this choice
    generateChoiceRules(interfacesAndAbstractsUsed: Map<FreClassifier, FreClassifier[]> ): GrammarRule[] {
        let rules: GrammarRule[] = [];
        for (const [FreClassifier, subs] of interfacesAndAbstractsUsed) {
            const branchName = Names.classifier(FreClassifier);
            // sort the concepts: concepts that have literals in them should go last, because the parser treats them with priority
            let implementors = this.sortImplementorsOnPrimitiveProps(subs);
            this.imports.push(FreClassifier);
            rules.push(new ChoiceRule(branchName, FreClassifier, implementors));
        }
        return rules;
    }

    generateSuperRules(conceptsWithSubs: Map<FreConcept, FreClassifier[]> ) : GrammarRule[] {
        let rules: GrammarRule[] = [];
        for (const [piClassifier, subs] of conceptsWithSubs) {
            // make a special rule that is a choice between all subs and 'piClassifier' itself
            const branchName = ChoiceRuleMaker.specialSuperName + Names.classifier(piClassifier);
            ChoiceRuleMaker.superNames.set(piClassifier, branchName);
            let implementors: FreClassifier[] = [];
            // make sure the concrete class rule is the first of the implementors because
            // that rule gets the least priority in the parser
            implementors.push(piClassifier);
            // sort the concepts: concepts that have literals in them should go last, because the parser treats them with priority
            implementors.push(...this.sortImplementorsOnPrimitiveProps(subs));
            this.imports.push(piClassifier);
            rules.push(new SuperChoiceRule(branchName, piClassifier, implementors));
        }
        return rules;
    }

    /**
     * Returns the list of classifiers with all classifiers that have primitive properties as last
     * @param implementors
     * @private
     */
    private sortImplementorsOnPrimitiveProps(implementors: FreClassifier[]): FreClassifier[] {
        let result: FreClassifier[] = [];
        let withPrims: FreClassifier[] = [];
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
