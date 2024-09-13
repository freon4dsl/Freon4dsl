import { FreMetaClassifier, FreMetaConcept } from "../../languagedef/metalanguage/index.js";
import {GenerationUtil, Names} from "../../utils/index.js";
import { GrammarRule } from "./grammarModel/GrammarRule.js";
import { ChoiceRule } from "./grammarModel/ChoiceRule.js";
import { SuperChoiceRule } from "./grammarModel/SuperChoiceRule.js";

export class ChoiceRuleMaker {
    static specialSuperName = `__fre_super_`;
    static superNames: Map<FreMetaClassifier, string> = new Map<FreMetaClassifier, string>();
    imports: FreMetaClassifier[] = [];

    // For interfaces and abstract concepts we create a parse rule that is a choice between all classifiers
    // that either implement or extend the concept.
    // Because limited concepts can only be used as reference, these are excluded from this choice.
    generateChoiceRules(interfacesAndAbstractsUsed: Map<FreMetaClassifier, FreMetaClassifier[]>): GrammarRule[] {
        const rules: GrammarRule[] = [];
        for (const [freClassifier, subs] of interfacesAndAbstractsUsed) {
            const branchName = Names.classifier(freClassifier);
            // sort the concepts: more complex concepts should go first
            const implementors = this.sortImplementorsOnComplexity(subs);
            this.imports.push(freClassifier);
            rules.push(new ChoiceRule(branchName, freClassifier, implementors));
        }
        return rules;
    }

    generateSuperRules(conceptsWithSubs: Map<FreMetaConcept, FreMetaClassifier[]>): GrammarRule[] {
        const rules: GrammarRule[] = [];
        for (const [freConcept, subs] of conceptsWithSubs) {
            // make a special rule that is a choice between all subs and 'freClassifier' itself
            const branchName = ChoiceRuleMaker.specialSuperName + Names.classifier(freConcept);
            ChoiceRuleMaker.superNames.set(freConcept, branchName);
            const implementors: FreMetaClassifier[] = [];
            // make sure the concrete class rule is the first of the implementors because
            // that rule gets the least priority in the parser
            implementors.push(freConcept);
            // sort the concepts: more complex concepts should go first
            implementors.push(...this.sortImplementorsOnComplexity(subs));
            this.imports.push(freConcept);
            rules.push(new SuperChoiceRule(branchName, freConcept, implementors));
        }
        return rules;
    }

    /**
     * Returns the list of classifiers with all classifiers that have primitive properties as first
     * @param implementors
     * @private
     */
    private sortImplementorsOnComplexity(implementors: FreMetaClassifier[]): FreMetaClassifier[] {
        const last: FreMetaClassifier[] = [];
        const first: FreMetaClassifier[] = [];
        const middle: FreMetaClassifier[] = [];
        // Sort the implementors such that a base class in the list comes before its subclasses.
        const sorted: FreMetaClassifier[] = GenerationUtil.sortClassifiers(implementors).reverse();
        for (const concept of sorted) {
            // If a concept has subconcepts, make the concept go before others
            if (concept instanceof FreMetaConcept && concept.allSubConceptsDirect().length > 0) {
                first.push(concept);
            } else if (concept.primProperties.length > 0) {
                // We assume that an entry with primitive values is easier to match by the parser,
                // therefore any implementor with primitive props should be tried early.
                middle.push(concept);
            } else {
                last.push(concept);
            }
        }
        first.push(...middle);
        first.push(...last);
        return first;
    }
}
