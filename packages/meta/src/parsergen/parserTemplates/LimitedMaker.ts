import { PiEditUnit } from "../../editordef/metalanguage";
import { PiClassifier, PiLimitedConcept } from "../../languagedef/metalanguage";
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
    imports: PiClassifier[] = [];

    generateLimitedRules(limitedConcepts: PiLimitedConcept[]): GrammarRule[] {
        let rules: GrammarRule[] = [];
        for (const piClassifier of limitedConcepts) {
            // find the mapping of keywords to predef instances
            // first is the name of the instance, second is the keyword
            let myMap: Map<string, string> = new Map<string, string>();
            piClassifier.instances.forEach(item => {
                const myTypeScript: string = `${Names.classifier(piClassifier)}.${Names.instance(item)}`;
                // set the string to be used to the value of the name property, iff present
                // else use the typescript name of the instance
                let myKeyword: string = item.nameProperty().value.toString();
                if (!myKeyword ) {
                    console.log("no keyword")
                }
                if (myKeyword.length === 0) {
                    console.log("no lengthy keyword")
                }

                if (!myKeyword || myKeyword.length === 0) {
                    myKeyword = Names.instance(item);
                }
                myMap.set(myTypeScript, myKeyword);
            });
            rules.push(new LimitedRule(piClassifier, myMap));
            this.imports.push(piClassifier);
        }
        return rules;
    }
}
