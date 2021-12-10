import { PiClassifier, PiConcept} from "../../languagedef/metalanguage";
import { Names } from "../../utils";
import { GrammarRule } from "./grammarModel/GrammarRule";
import { ChoiceRule } from "./grammarModel/ChoiceRule";
import { SuperChoiceRule } from "./grammarModel/SuperChoiceRule";

export class ChoiceRuleMaker {
    static specialSuperName = `__pi_super_`;
    static superNames: Map<PiClassifier, string> = new Map<PiClassifier, string>();
    imports: PiClassifier[] = [];

    // for interfaces and abstract concepts we create a parse rule that is a choice between all classifiers
    // that either implement or extend the concept
    // because limited concepts can only be used as reference, these are excluded for this choice
    generateChoiceRules(interfacesAndAbstractsUsed: Map<PiClassifier, PiClassifier[]> ): GrammarRule[] {
        let rules: GrammarRule[] = [];
        for (const [piClassifier, subs] of interfacesAndAbstractsUsed) {
            const branchName = Names.classifier(piClassifier);
            // sort the concepts: concepts that have literals in them should go last, because the parser treats them with priority
            let implementors = this.sortImplementors(subs);
            this.imports.push(piClassifier);
            rules.push(new ChoiceRule(branchName, piClassifier, implementors));
        }
        return rules;
    }

    generateSuperRules(conceptsWithSubs: Map<PiConcept, PiClassifier[]> ) : GrammarRule[] {
        let rules: GrammarRule[] = [];
        for (const [piClassifier, subs] of conceptsWithSubs) {
            // make a special rule that is a choice between all subs and 'piClassifier' itself
            const branchName = ChoiceRuleMaker.specialSuperName + Names.classifier(piClassifier);
            ChoiceRuleMaker.superNames.set(piClassifier, branchName);
            let implementors: PiClassifier[] = [];
            // make sure the concrete class rule is the first of the implementors because
            // that rule gets the least priority in the parser
            implementors.push(piClassifier);
            // sort the concepts: concepts that have literals in them should go last, because the parser treats them with priority
            implementors.push(...this.sortImplementors(subs));
            this.imports.push(piClassifier);
            rules.push(new SuperChoiceRule(branchName, piClassifier, implementors));
        }
        return rules;
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

    // private reset() {
    //     ChoiceRuleMaker.superNames = new Map<PiClassifier, string>();
    // }
}
