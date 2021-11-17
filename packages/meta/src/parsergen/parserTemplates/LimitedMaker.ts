import { PiEditInstanceProjection, PiEditUnit } from "../../editordef/metalanguage";
import { PiLimitedConcept } from "../../languagedef/metalanguage";
import { langExpToTypeScript } from "../../utils";
import { GrammarRule } from "./grammarModel/GrammarRule";
import { LimitedRule } from "./grammarModel/LimitedRule";

/**
 * Generates the parse rule and syntax analysis method for limited concepts. A
 * projection may be present that consists of a list of keywords. These keywords
 * will be used in stead of the names of the predefined instance of this concept.
 */

export class LimitedMaker {
    generatedParseRules: string[] = [];
    generatedSyntaxAnalyserMethods: string[] = [];
    branchNames: string[] = [];

    generateLimitedRules(editUnit: PiEditUnit, limitedConcepts: PiLimitedConcept[]): GrammarRule[] {
        let rules: GrammarRule[] = [];
        for (const piClassifier of limitedConcepts) {
            // first, see if there is a projection defined
            const conceptEditor = editUnit.findConceptEditor(piClassifier);
            // find the mapping of keywords to predef instances
            // first is the name of the instance, second is the keyword
            let myMap: Map<string, string> = new Map<string, string>();
            conceptEditor.projection.lines.forEach(line => {
                line.items.forEach(item => {
                    // TODO do we allow other projections for limited concepts????
                    if (item instanceof PiEditInstanceProjection) {
                        myMap.set(langExpToTypeScript(item.expression), item.keyword);
                    }
                })
            });
            rules.push(new LimitedRule(piClassifier, myMap));
        }
        return rules;
    }
}
