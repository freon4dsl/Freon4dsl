import { FreClassifier, FreLimitedConcept } from "../../languagedef/metalanguage";
import { Names } from "../../utils";
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
    imports: FreClassifier[] = [];

    generateLimitedRules(limitedConcepts: FreLimitedConcept[]): GrammarRule[] {
        const rules: GrammarRule[] = [];
        for (const limitedConcept of limitedConcepts) {
            // find the mapping of keywords to predef instances
            // first is the name of the instance, second is the keyword
            const myMap: Map<string, string> = new Map<string, string>();
            limitedConcept.instances.forEach(item => {
                const myTypeScript: string = `${Names.classifier(limitedConcept)}.${Names.instance(item)}`;
                // set the string to be used to the value of the name property, iff present
                // else use the typescript name of the instance
                let myKeyword: string = item.nameProperty().value.toString();
                if (!myKeyword ) {
                    console.log("no keyword");
                }
                if (myKeyword.length === 0) {
                    console.log("no lengthy keyword");
                }

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
