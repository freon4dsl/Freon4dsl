import { GrammarRule } from "./GrammarRule";
import { PiClassifier, PiProperty } from "../../../languagedef/metalanguage";
import { getTypeAsString, Names } from "../../../utils";
import { ParserGenUtil } from "../ParserGenUtil";
import { RightHandSideEntry } from "./RHSEntries/RightHandSideEntry";
import { RHSPropEntry } from "./RHSEntries/RHSPropEntry";

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

    toGrammar(): string {
        // check - should be removed
        // this.ruleParts.forEach((part, index) => {
        //     if (part == null) {
        //         console.log(`part ${index} for concept ${this.concept.name} is null`);
        //     }
        // });
        // end check
        let rule = `${Names.classifier(this.concept)} = ${this.ruleParts.map((part) => `${part.toGrammar()}`).join(" ")}`;
        return rule.trimEnd() + " ;";
    }

    toMethod(mainAnalyserName: string): string {
        const myProperties = this.propsToSet();
        return `${ParserGenUtil.makeComment(this.toGrammar())}
                public transform${this.ruleName} (branch: SPPTBranch) : ${this.ruleName} {
                    // console.log('transform${this.ruleName} called: ' + branch.name);
                    ${myProperties.map(prop => `let ${ParserGenUtil.internalName(prop.name)}: ${getTypeAsString(prop)}`).join(";\n")}
                    const children = this.${mainAnalyserName}.getChildren(branch);` +  // to avoid an extra newline in the result
            `${this.ruleParts.map((part, index) => `${part.toMethod(index, "children", mainAnalyserName)}`).join("")}      
                    return ${Names.classifier(this.concept)}.create({${myProperties.map(prop => `${prop.name}:${ParserGenUtil.internalName(prop.name)}`).join(", ")}});
                }`;
    }

    toString(): string {
        let indent: string = "\n\t";
        return indent + "ConceptRule: " + this.concept.name + indent + this.ruleParts.map(sub => sub.toString(2)).join(indent);
    }
}
