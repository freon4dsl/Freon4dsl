import {
    PiBinaryExpressionConcept,
    PiClassifier,
    PiExpressionConcept,
    PiLimitedConcept,
    PiProperty
} from "../../../../languagedef/metalanguage";
import { getTypeAsString, Names } from "../../../../utils";
import { BinaryExpMaker } from "../BinaryExpMaker";
import { ParserGenUtil } from "../ParserGenUtil";
import { PiEditConcept } from "../../../metalanguage";
import { RHSPropEntry, RightHandSideEntry } from "./RHSEntries";
import { getTypeCall } from "./GrammarUtils";

export abstract class GrammarRule {
    ruleName: string;
    toGrammar(): string {
        return `GrammarRule.toGrammar() should be implemented by its subclasses.`;
    }
    toMethod(): string {
        return `GrammarRule.toMethod() should be implemented by its subclasses.`;
    }
}
export class ChoiceRule extends GrammarRule {
    implementors: PiClassifier[];
    myConcept: PiClassifier;
    constructor(ruleName: string, myConcept: PiClassifier, implementors: PiClassifier[]) {
        super();
        this.ruleName = ruleName;
        this.implementors = implementors;
        this.myConcept = myConcept;
    }
    toGrammar(): string {
        let rule: string = "";
        if (this.implementors.length > 0) {
            // test to see if there is a binary expression concept here
            let implementorsNoBinaries = this.implementors.filter(sub => !(sub instanceof PiBinaryExpressionConcept));
            if (this.implementors.length != implementorsNoBinaries.length) { // there are binaries
                // exclude binary expression concepts
                rule = `${(this.ruleName)} = ${implementorsNoBinaries.map(implementor =>
                    `${Names.classifier(implementor)} `).join("\n    | ")}`;
                // add the special binary concept rule as choice
                rule += `\n    | ${BinaryExpMaker.specialBinaryRuleName} ;`;
            } else {
                // normal choice rule
                rule = `${(this.ruleName)} = ${this.implementors.map(implementor =>
                    `${Names.classifier(implementor)} `).join("\n    | ")} ;`;
            }
        } else {
            rule =`${this.ruleName} = 'ERROR' ; // there are no concepts that implement this interface or extend this abstract concept`;
        }
        return rule;
    }
    toMethod(): string {
        return `
            ${ParserGenUtil.makeComment(this.toGrammar())}
            private transform${this.ruleName}(branch: SPPTBranch) : ${Names.classifier(this.myConcept)} {
                // console.log("transform${this.ruleName} called");
                return this.transformNode(branch.nonSkipChildren.toArray()[0]);
            }`;
    }
}
export class LimitedRule extends GrammarRule{
    concept: PiLimitedConcept = null;
    // the mapping of keywords to predef instances
    // first is the name of the instance, second is the keyword
    myMap: Map<string, string> = null;
    constructor(limitedConcept: PiLimitedConcept, myMap: Map<string, string>) {
        super();
        this.ruleName = Names.classifier(limitedConcept);
        this.concept = limitedConcept;
        this.myMap = myMap;
    }

    toGrammar(): string {
        let result: string
        if (!!this.myMap && this.myMap.size > 0) { // found a limited concept with a special projection
            // note that this rule cannot be prefixed with 'leaf'; this would cause the syntax analysis to fail
            result = `${this.ruleName} = `;
            let first = true;
            for (const [key, value] of this.myMap) {
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
            let ifStat: string = '';
            for (const [key, value] of this.myMap) {
                ifStat += `if (choice == '${value}') {
                return ${key};
            } else `
            }
            // close the ifStatement
            ifStat += `{
                return null;
            }`;
            return `
                ${ParserGenUtil.makeComment(this.toGrammar())}
                private transform${this.ruleName}(branch: SPPTBranch): ${Names.classifier(this.concept)} {
                    let choice = (branch.matchedText).trim();
                    ${ifStat}
                }`;
        } else { // make a 'normal' reference method
            return `
                    ${ParserGenUtil.makeComment(this.toGrammar())}
                    private transform${this.ruleName}(branch: SPPTBranch): string {
                        return branch.matchedText;
                    }`;
        }
    }
}
export class BinaryExpressionRule extends GrammarRule {
    expressionBase: PiExpressionConcept
    editDefs: PiEditConcept[] = [];
    constructor(ruleName: string, expressionBase: PiExpressionConcept, editDefs: PiEditConcept[]) {
        super();
        this.ruleName = ruleName;
        this.expressionBase = expressionBase;
        this.editDefs = editDefs
    }
    toGrammar(): string {
        return `${this.rule1()}\n${this.rule2()}`;
    }

    toMethod(): string {
        // TODO get the right type for 'BinaryExpression' in stead of ${Names.concept(expressionBase)}
        return `
        /**
         * Generic method to transform binary expressions, which are parsed 
         * according to these rules:
         * ${this.rule1()}
         * ${this.rule2()}
         *
         * In this method we build a crooked tree, which in a later phase needs to be balanced
         * according to the priorities of the operators.
         * @param branch
         * @private
         */
        private transform${this.ruleName}(branch: SPPTBranch) : ${Names.concept(this.expressionBase)} {
            // console.log("transform${this.ruleName} called");
            const children = branch.nonSkipChildren.toArray();
            const actualList = children[0].nonSkipChildren.toArray();
            let index = 0;
            let first = this.transformNode(actualList[index++]);
            while (index < actualList.length) {
                let operator = this.transformNode(actualList[index++]);
                let second = this.transformNode(actualList[index++]);
                let combined: ${Names.concept(this.expressionBase)} = null;
                switch (operator) {
                ${this.editDefs.map(def => `
                    case '${def.symbol}': {
                        combined = ${Names.concept(def.concept.referred)}.create({left: first, right: second});
                        break;
                    }`).join("")}
                    default: {
                        combined = null;
                    }
                }
                first = combined;
            }
            return first;
        }`
    }
    private rule1() : string {
        return `${(this.ruleName)} = [${getTypeCall(this.expressionBase)} / __pi_binary_operator]2+ ;` ;
    }
    private rule2() : string {
        return `leaf __pi_binary_operator = ${this.editDefs.map(def => `'${def.symbol}'`).join(" | ")} ;` ;
    }
}
export class ConceptRule extends GrammarRule {
    concept: PiClassifier = null;
    ruleParts: RightHandSideEntry[] = [];

    constructor(concept: PiClassifier) {
        super();
        this.concept = concept;
        this.ruleName = Names.classifier(this.concept);
    }

    private propsToSet(): PiProperty[] {
        let xx: PiProperty[] = [];
        for (const part of this.ruleParts) {
            if (part instanceof RHSPropEntry) {
                xx.push(part.property);
                // } else if (part instanceof RHSGroup) {
                //     xx.push(...part.propsToSet());
            }
        }
        return xx;
    }
    toGrammar() : string {
        // check
        this.ruleParts.forEach((part, index) => {
            if (part == null) {
                console.log(`part ${index} for concept ${this.concept.name} is null`);
            }
        })
        // end check
        return `${Names.classifier(this.concept)} = ${this.ruleParts.map((part) => `${part.toGrammar()}`).join(' ')} ;`;
    }
    toMethod(): string {
        const name = Names.classifier(this.concept);
        const myProperties = this.propsToSet();
        return `${ParserGenUtil.makeComment(this.toGrammar())}
                private transform${name} (branch: SPPTBranch) : ${name} {
                    // console.log('transform${name} called');
                    ${myProperties.map(prop => `let ${prop.name}: ${getTypeAsString(prop)}`).join(';\n')}
                    const children = this.getChildren(branch, 'transform${name}');` +  // to avoid an extra newline in the result
            `${this.ruleParts.map((part, index) => `${part.toMethod(index, 'children')}`).join('')}      
                    return ${Names.classifier(this.concept)}.create({${myProperties.map(prop => `${prop.name}:${prop.name}`).join(', ')}});
                }`
    }
    toString() : string {
        let indent: string = "\n\t";
        return indent + "ConceptRule: " + this.concept.name + indent + this.ruleParts.map(sub => sub.toString(2)).join(indent);
    }
}

