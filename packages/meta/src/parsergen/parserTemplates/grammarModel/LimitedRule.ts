import { GrammarRule } from "./GrammarRule.js";
import { FreMetaLimitedConcept } from "../../../languagedef/metalanguage/index.js";
import { Names } from "../../../utils/index.js";
import { ParserGenUtil } from "../ParserGenUtil.js";

export class LimitedRule extends GrammarRule {
    concept: FreMetaLimitedConcept;
    // the mapping of keywords to predef instances
    // first is the name of the instance, second is the keyword
    myMap: Map<string, string>;

    constructor(limitedConcept: FreMetaLimitedConcept, myMap: Map<string, string>) {
        super();
        this.ruleName = Names.classifier(limitedConcept);
        this.concept = limitedConcept;
        this.myMap = myMap;
    }

    toGrammar(): string {
        let result: string;
        if (!!this.myMap && this.myMap.size > 0) { // found a limited concept with a special projection
            // note that this rule cannot be prefixed with 'leaf'; this would cause the syntax analysis to fail
            result = `${this.ruleName} = `;
            let first = true;
            const mapKeys: IterableIterator<string> = this.myMap.values();
            for (const value of mapKeys) {
                // prefix the second and all other choices with the '|' symbol
                if (first) {
                    first = false;
                } else {
                    result += "\n\t| ";
                }
                result += `\'${value}\'`;
            }
        } else { // make a 'normal' reference rule
            result = `${this.ruleName} = identifier`;
        }
        return result + " ;";
    }

    toMethod(): string {
        if (!!this.myMap && this.myMap.size > 0) { // found a limited concept with a special projection
            let ifStat: string = "";
            for (const [key, value] of this.myMap) {
                ifStat += `if (choice === '${value}') {
                return ${key};
            } else `;
            }
            // close the ifStatement
            ifStat += `{
                return null;
            }`;
            return `
                ${ParserGenUtil.makeComment(this.toGrammar())}
                public transform${this.ruleName}(branch: SPPTBranch): ${Names.classifier(this.concept)} {
                    const choice = branch.nonSkipMatchedText;
                    ${ifStat}
                }`;
        } else { // make a 'normal' reference method
            return `
                    ${ParserGenUtil.makeComment(this.toGrammar())}
                    public transform${this.ruleName}(branch: SPPTBranch): string {
                        return branch.nonSkipMatchedText;
                    }`;
        }
    }
}
