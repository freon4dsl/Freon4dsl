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
        if (!!this.myMap && this.myMap.size > 0) {
            // found a limited concept with a special projection
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
        } else {
            // make a 'normal' reference rule
            result = `${this.ruleName} = identifier`;
        }
        return result + " ;";
    }

    toMethod(mainAnalyserName: string): string {
        if (!!this.myMap && this.myMap.size > 0) {
            // found a limited concept with a special projection
            let switchStat: string = "";
            // create all cases for the switch statement
            for (const [key, value] of this.myMap) {
                switchStat += `case'${value}': {
                    result = ${Names.FreNodeReference}.create<${Names.classifier(this.concept)}>(${key}, '${Names.classifier(this.concept)}');
                    break;
                }\n`;
            }
            // complete the switch statement
            switchStat = `switch (children.toArray()[0]) {
                ${switchStat} default: result = undefined;
            }`;
            return `
                ${ParserGenUtil.makeComment(this.toGrammar())}
                public transform${this.ruleName}(nodeInfo: SpptDataNodeInfo, children: KtList<object>, sentence: Sentence): ${Names.FreNodeReference}<${Names.classifier(this.concept)}> {
                    let result: ${Names.FreNodeReference}<${Names.classifier(this.concept)}> | undefined;
                    ${switchStat}
                    if (result !== undefined) {
                        result.parseLocation = this.${mainAnalyserName}.location(sentence, nodeInfo.node);
                    }
                    return result;
                }`;
        }
        return ``;
    }
}
