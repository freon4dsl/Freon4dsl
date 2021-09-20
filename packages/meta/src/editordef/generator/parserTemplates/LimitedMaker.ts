import { PiEditInstanceProjection, PiEditUnit } from "../../metalanguage";
import { PiClassifier, PiInstance } from "../../../languagedef/metalanguage";
import { langExpToTypeScript, Names } from "../../../utils";
import { ParserGenUtil } from "./ParserGenUtil";

/**
 * Generates the parse rule and syntax analysis method for limited concepts. A
 * projection may be present that consists of a list of keywords. These keywords
 * will be used in stead of the names of the predefined instance of this concept.
 */

export class LimitedMaker {
    generatedParseRules: string[] = [];
    generatedSyntaxAnalyserMethods: string[] = [];
    branchNames: string[] = [];

    generateLimitedRules(editUnit: PiEditUnit, limitedConcepts: PiClassifier[]) {
        for (const piClassifier of limitedConcepts) {
            // first, see if there is a projection defined
            const conceptEditor = editUnit.findConceptEditor(piClassifier);
            const myName = Names.classifier(piClassifier);
            // find the mapping of keywords to predef instances
            // fist is the name of the instance, second is the keyword
            let myMap: Map<string, string> = new Map<string, string>();
            conceptEditor.projection.lines.forEach(line => {
                line.items.forEach(item => {
                    // TODO do we allow other projections for limited concepts????
                    if (item instanceof PiEditInstanceProjection) {
                        myMap.set(langExpToTypeScript(item.expression), item.keyword);
                    }
                })
            });
            this.branchNames.push(myName);
            if (myMap.size > 0) { // found a limited concept with a special projection
                const rule: string = this.makeLimitedReferenceRule(myName, myMap);
                this.generatedParseRules.push(rule);
                this.generatedSyntaxAnalyserMethods.push(`
                    ${ParserGenUtil.makeComment(rule)}
                    ${this.makeLimitedSyntaxMethod(myName, myMap)}`);
            } else { // make a 'normal' reference rule
                const rule = `${myName} = identifier`;
                this.generatedParseRules.push(rule);
                this.generatedSyntaxAnalyserMethods.push(`
                    ${ParserGenUtil.makeComment(rule)}
                    private transform${myName}(branch: SPPTBranch): string {
                        return (branch.matchedText).trim();
                    }`);
            }
        }

    }

    private makeLimitedSyntaxMethod(myName: string, myMap: Map<string, string>) {
        let ifStat: string = '';
        for (const [key, value] of myMap) {
            ifStat += `if (choice == '${value}') {
                return ${key};
            } else `
        }
        // close the ifStatement
        ifStat += `{
                return null;
            }`;
        return `
        private transform${myName}(branch: SPPTBranch): ${myName} {
            let choice = (branch.matchedText).trim();
            ${ifStat}
        }`;
    }

    private makeLimitedReferenceRule(myName: string, myMap: Map<string, string>) {
        // note that this rule cannot be prefixed with 'leaf'; this would cause the syntax analysis to fail
        let result: string = `${myName} = `;
        let first = true;
        for (const [key, value] of myMap) {
            // prefix the second and all other choices with the '|' symbol
            if (first) {
                first = false;
            } else {
                result += "\n\t| ";
            }
            result += `\'${value}\'`;
        }
        return result;
    }
}
