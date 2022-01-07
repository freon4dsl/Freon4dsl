import { PiEditInstanceProjection, PiEditLimitedProjection, PiEditUnit } from "../../editordef/metalanguage";
import { PiClassifier, PiLimitedConcept } from "../../languagedef/metalanguage";
import { langExpToTypeScript, Names } from "../../utils";
import { GrammarRule } from "./grammarModel/GrammarRule";
import { LimitedRule } from "./grammarModel/LimitedRule";

/**
 * Generates the parse rule and syntax analysis method for limited concepts. A
 * projection may be present that consists of a list of keywords. These keywords
 * will be used in stead of the names of the predefined instance of this concept.
 */

export class LimitedMaker {
    generatedParseRules: string[] = [];
    branchNames: string[] = [];
    imports: PiClassifier[] = [];

    generateLimitedRules(editUnit: PiEditUnit, limitedConcepts: PiLimitedConcept[]): GrammarRule[] {
        let rules: GrammarRule[] = [];
        for (const piClassifier of limitedConcepts) {
            // first, see if there is a projection defined
            const conceptEditor = editUnit.findProjectionForType(piClassifier);
            if ( conceptEditor instanceof PiEditLimitedProjection) {
                // find the mapping of keywords to predef instances
                // first is the name of the instance, second is the keyword
                let myMap: Map<string, string> = new Map<string, string>();
                conceptEditor.instanceProjections.forEach(item => {
                    if (item instanceof PiEditInstanceProjection) {
                        const myTypeScript: string = `${Names.classifier(piClassifier)}.${Names.instance(item.instance.referred)}`;
                        myMap.set(myTypeScript, item.keyword.trueKeyword);
                    }
                });
                rules.push(new LimitedRule(piClassifier, myMap));
                this.imports.push(piClassifier);
            }
        }
        return rules;
    }
}
