import { GrammarRule } from "./GrammarRule.js";
import { FreMetaClassifier, FreMetaProperty } from "../../../languagedef/metalanguage/index.js";
import { Names } from "../../../utils/index.js";
import { ParserGenUtil } from "../ParserGenUtil.js";
import { RightHandSideEntry, RHSPropEntry } from "./RHSEntries/index.js";

export class ConceptRule extends GrammarRule {
    concept: FreMetaClassifier | undefined = undefined;
    ruleParts: RightHandSideEntry[] = [];

    constructor(concept: FreMetaClassifier, projectionName?: string) {
        super();
        this.concept = concept;
        this.ruleName = Names.classifier(this.concept);
        if (!!projectionName && projectionName.length > 0) {
            this.ruleName += "_" + projectionName;
        }
    }

    private propsToSet(): FreMetaProperty[] {
        const xx: FreMetaProperty[] = [];
        for (const part of this.ruleParts) {
            if (part instanceof RHSPropEntry) {
                if (!xx.includes(part.property)) {
                    xx.push(part.property);
                }
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
        let rule = `${this.ruleName} = ${this.ruleParts.map((part) => `${part.toGrammar()}`).join(" ")}`;
        rule = this.trimExtraWs(rule);
        // make code to create the AST node
        let astCode: string = this.toMethod();
        return rule.trimEnd() + astCode;
    }

    nameToImport(): string {
        if (!!this.concept) {
            return Names.classifier(this.concept);
        } else {
            return '';
        }
    }

    toMethod(): string {
        if (!this.concept) {
            return "";
        }
        let propSetters: string[] = [];
        const myProperties = this.propsToSet();
        myProperties.forEach(prop => {
            const intName: string = ParserGenUtil.internalName(prop.name);
            if (!prop.isPart) {
                // We handle references differently, because they are parsed as an array of strings, at a point
                // during the parsing in which the required metatype (in FreNodeReference.create(..., METATYPE))
                // is not yet known.
                if (prop.isList) {
                    propSetters.push(`${prop.name}: helper.createReferenceList(${intName}, "${Names.classifier(prop.type)}")`);
                } else {
                    if (prop.isOptional) {
                        propSetters.push(
                            `${prop.name}: !!${intName}? FreNodeReference.create(${intName}, "${Names.classifier(prop.type)}") : undefined`
                        );
                    } else {
                        propSetters.push(`${prop.name}: FreNodeReference.create(${intName}, "${Names.classifier(prop.type)}")`);
                    }
                }
            } else {
                propSetters.push(`${prop.name}: ${intName}`);
            }
        });
        propSetters.push(`parseLocation: helper.pegLocationToFreLocation(location())`);
        // No prettier for .pegjs, so we take layout into consideration here.
        return `\n{
    return ${Names.classifier(this.concept)}.create({
        ${propSetters.map(setter => `${setter}`).join(",\n\t\t")}       
    })
}`;
    }

    // toMethod(mainAnalyserName: string): string {
    //     if (!this.concept) {
    //         return "";
    //     }
    //     const myProperties = this.propsToSet();
    //     // TODO add parse location: $parseLocation: this.mainAnalyser.location(branch)
    //     return (
    //         `${ParserGenUtil.makeComment(this.toGrammar())}
    //             public transform${this.ruleName} (branch: SPPTBranch) : ${Names.classifier(this.concept)} {
    //                 // console.log('transform${this.ruleName} called: ' + branch.name);
    //                 ${myProperties.map((prop) => `let ${ParserGenUtil.internalName(prop.name)}: ${GenerationUtil.getTypeAsString(prop)}`).join(";\n")}
    //                 const children = this.${mainAnalyserName}.getChildren(branch);` + // to avoid an extra newline in the result
    //         `${this.ruleParts.map((part, index) => `${part.toMethod(index, "children", mainAnalyserName)}`).join("")}
    //                 return ${Names.classifier(this.concept)}.create({
    //                     ${myProperties.map((prop) => `${prop.name}:${ParserGenUtil.internalName(prop.name)}`).join(", ")}
    //                     ${myProperties.length > 0 ? "," : ""} parseLocation: this.${mainAnalyserName}.location(branch)
    //                 });
    //             }`
    //     );
    // }

    toString(): string {
        if (!this.concept) {
            return "";
        }
        const indent: string = "\n\t";
        return (
            indent +
            "ConceptRule: " +
            this.concept.name +
            indent +
            this.ruleParts.map((sub) => sub.toString(2)).join(indent)
        );
    }

    private trimExtraWs(rule: string) {
        return rule.replace(/ws ws/g, "ws");
    }
}
