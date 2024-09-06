import { FreMetaClassifier, FreMetaLimitedConcept } from "../../languagedef/metalanguage/index.js";
import { Names } from "../../utils/index.js";
import { GrammarRule } from "./grammarModel/GrammarRule.js";
import { LimitedRule } from "./grammarModel/LimitedRule.js";

/**
 * Generates the parse rule and syntax analysis method for limited concepts. A
 * projection may be present that consists of a list of keywords. These keywords
 * will be used in stead of the names of the predefined instance of this concept.
 */

export class LimitedMaker {
    generatedParseRules: string[] = [];
    branchNames: string[] = [];
    imports: FreMetaClassifier[] = [];

    generateLimitedRules(limitedConcepts: FreMetaLimitedConcept[]): GrammarRule[] {
        const rules: GrammarRule[] = [];
        for (const limitedConcept of limitedConcepts) {
            // find the mapping of keywords to predef instances
            // first is the name of the instance, second is the keyword
            const myMap: Map<string, string> = new Map<string, string>();
            limitedConcept.instances.forEach((item) => {
                const myTypeScript: string = `${Names.classifier(limitedConcept)}.${Names.instance(item)}`;
                // set the string to be used to the value of the name property, iff present
                // else use the typescript name of the instance
                let myKeyword: string | undefined = item.nameProperty()?.value.toString();
                if (!myKeyword || myKeyword.length === 0) {
                    myKeyword = Names.instance(item);
                }
                myMap.set(myTypeScript, myKeyword);
            });
            rules.push(new LimitedRule(limitedConcept, myMap));
            this.imports.push(limitedConcept);
        }
        return rules;
    }
}
