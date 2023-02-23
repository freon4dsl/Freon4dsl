import { FreClassifier, FreConcept } from "../../languagedef/metalanguage";
import { Names } from "../../utils";
import { GrammarRule } from "./grammarModel/GrammarRule";
import { ChoiceRule } from "./grammarModel/ChoiceRule";
import { SuperChoiceRule } from "./grammarModel/SuperChoiceRule";

export class ChoiceRuleMaker {
    static specialSuperName = `__fre_super_`;
    static superNames: Map<FreClassifier, string> = new Map<FreClassifier, string>();
    imports: FreClassifier[] = [];

    // for interfaces and abstract concepts we create a parse rule that is a choice between all classifiers
    // that either implement or extend the concept
    // because limited concepts can only be used as reference, these are excluded for this choice
    generateChoiceRules(interfacesAndAbstractsUsed: Map<FreClassifier, FreClassifier[]> ): GrammarRule[] {
        const rules: GrammarRule[] = [];
        for (const [freClassifier, subs] of interfacesAndAbstractsUsed) {
            const branchName = Names.classifier(freClassifier);
            // sort the concepts: concepts that have literals in them should go last, because the parser treats them with priority
            const implementors = this.sortImplementorsOnPrimitiveProps(subs);
            this.imports.push(freClassifier);
            rules.push(new ChoiceRule(branchName, freClassifier, implementors));
        }
        return rules;
    }

    generateSuperRules(conceptsWithSubs: Map<FreConcept, FreClassifier[]> ): GrammarRule[] {
        const rules: GrammarRule[] = [];
        for (const [freConcept, subs] of conceptsWithSubs) {
            // make a special rule that is a choice between all subs and 'freClassifier' itself
            const branchName = ChoiceRuleMaker.specialSuperName + Names.classifier(freConcept);
            ChoiceRuleMaker.superNames.set(freConcept, branchName);
            const implementors: FreClassifier[] = [];
            // make sure the concrete class rule is the first of the implementors because
            // that rule gets the least priority in the parser
            implementors.push(freConcept);
            // sort the concepts: concepts that have literals in them should go last, because the parser treats them with priority
            implementors.push(...this.sortImplementorsOnPrimitiveProps(subs));
            this.imports.push(freConcept);
            rules.push(new SuperChoiceRule(branchName, freConcept, implementors));
        }
        return rules;
    }

    /**
     * Returns the list of classifiers with all classifiers that have primitive properties as last
     * @param implementors
     * @private
     */
    private sortImplementorsOnPrimitiveProps(implementors: FreClassifier[]): FreClassifier[] {
        const result: FreClassifier[] = [];
        const withPrims: FreClassifier[] = [];
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
