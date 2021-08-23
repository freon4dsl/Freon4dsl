import {
    PiBinaryExpressionConcept,
    PiClassifier,
    PiConcept,
    PiInterface,
    PiLanguage,
    PiLimitedConcept,
    PiPrimitiveProperty,
    PiProperty
} from "../../../languagedef/metalanguage";
import {
    ListJoinType,
    PiEditConcept, PiEditInstanceProjection, PiEditProjectionItem,
    PiEditProjectionText,
    PiEditPropertyProjection,
    PiEditSubProjection,
    PiEditUnit
} from "../../metalanguage";
import { LangUtil, Names } from "../../../utils";

export const referencePostfix = "PiElemRef";

// there is no prettier for pegjs files, therefore we take indentation and other layout matters into account in this template
// unfortunately, this makes things a little less legible :-(

export class PegjsTemplate {
    referredClassifiers: PiClassifier[] = [];
    textForListConcepts: string[] = [];
    listNumber: number = 0;

    generatePegjsForUnit(language: PiLanguage, langUnit: PiConcept, editDef: PiEditUnit): string {
        this.referredClassifiers = [];
        this.textForListConcepts = [];
        this.listNumber = 0;
        const creatorName = Names.parserCreator(language);

        // Note that the order in which the rules are stated, determines whether the parser is functioning or not.
        // So first we create a rule for the unit, next for its children, etc.
        // The following method sorts the elements in the editor definition and
        // stores its result in two lists: one for all editor definitions found, one for all used interfaces
        const sortedEditorDefs: PiEditConcept[] = [];
        const sortedInterfaces: PiInterface[] = [];
        this.findEditorDefsForUnit(langUnit, editDef.conceptEditors, sortedEditorDefs, sortedInterfaces);

        // Template starts here, no prettier for pegjs files, therefore we take indentation into account in this template
        return `// Generated by the ProjectIt Language Generator.

// This file contains the input to the PEG.JS parser generator (see https://pegjs.org). The parser generator 
// is automatically called by the ProjectIt Language Generator and another file with the same name, but with
// extension ".js" is created. The ".js" file contains the actual parser.
// The file with extension ".pegjs" (this file) is stored in order for the parsing rules to be examined.

{
    let creator = require("./${creatorName}");
}
        
${sortedEditorDefs.map(conceptDef => `${this.makeConceptRule(conceptDef)}`).join("\n")}
${sortedInterfaces.length > 0 ? `${sortedInterfaces.map(intf => `${this.makeChoiceRule(intf)}`).join("\n")}` : `` }
${this.referredClassifiers.map(piClassifier => `${this.makeReferenceRule(piClassifier, editDef)}`).join("\n")}
${this.textForListConcepts.map(listRule => `${listRule}`).join("\n")}
ws "whitespace" = (([ \\t\\n\\r]) / (SingleLineComment) / (MultiLineComment) )*
rws "required whitespace" = (([ \\t\\n\\r]) / (SingleLineComment) / (MultiLineComment) )+

varLetter           = [a-zA-Z]
identifierChar      = [a-zA-Z0-9_$] // any char but not /.,!?@~%^&*-=+(){}"':;<>?[]\\/
anyChar             = [*a-zA-Z0-9' /\\-[\\]+<>=#$_.,!?@~%^&*-=+(){}:;<>?]
number              = [0-9]

variable            = first:varLetter rest:identifierChar* { return first + rest.join(""); }
stringLiteral       = "\\"" chars:anyChar* "\\"" { return chars.join(""); }
numberLiteral       = nums:number+ { return Number.parseInt(nums.join("")); }
booleanLiteral      = "false" { return false; }
                    / "true" { return true; }

SingleLineComment
  = "//" (!LineTerminator SourceCharacter)*

LineTerminator
  = [\\n\\r\\u2028\\u2029]

Comment "comment"
  = MultiLineComment
  / SingleLineComment

MultiLineComment
  = "/*" (!"*/" SourceCharacter)* "*/"

SourceCharacter
  = .
  
char
  = unescaped
  / escape
    sequence:(
        '"'
      / "\\\\"
      / "/"
      / "\\["
      / "\\]"
      / "$"
      / "b" { return "\\b"; }
      / "f" { return "\\f"; }
      / "n" { return "\\n"; }
      / "r" { return "\\r"; }
      / "t" { return "\\t"; }
      / "u" digits:$(HEXDIG HEXDIG HEXDIG HEXDIG) {
          return String.fromCharCode(parseInt(digits, 16));
        }
    )
    { return sequence; }

escape
  = "\\\\"

unescaped
  = [^\\0-\\x1F\\x22\\x5C]

// ----- Core ABNF Rules -----

// See RFC 4234, Appendix B (http://tools.ietf.org/html/rfc4234).
DIGIT  = [0-9]
HEXDIG = [0-9a-f]
`;
        // end Template
    }

    /**
     * This method creates a parsing rule for the concept in 'conceptDef'
     * except for models and limited concepts. A complete model can not be parsed,
     * only its units, and limited concepts can not be created in a parse rule,
     * they can only be referred to.
     * @param conceptDef
     * @private
     */
    private makeConceptRule(conceptDef: PiEditConcept): string {
        const piClassifier: PiConcept = conceptDef.concept.referred;
        if (piClassifier.isModel || piClassifier instanceof PiLimitedConcept) {
            return ``;
        }

        if (piClassifier.isAbstract) {
            return this.makeChoiceRule(piClassifier);
        } else if (piClassifier instanceof PiBinaryExpressionConcept) {
            return this.makeBinaryExpressionRule(conceptDef, piClassifier);
        } else {
            return this.makeOrdinaryRule(conceptDef, piClassifier);
        }
    }

    private makeOrdinaryRule(conceptDef: PiEditConcept, piClassifier: PiConcept) {
        const myName = Names.classifier(piClassifier);
        // determine which properties of the concept will get a value through this parse rule
        const propsToSet: PiProperty[] = [];

        conceptDef.projection.lines.forEach(l => {
            l.items.forEach(item => {
                if (item instanceof PiEditPropertyProjection) {
                    propsToSet.push(item.expression.findRefOfLastAppliedFeature());
                }
                if (item instanceof PiEditSubProjection) {
                    item.items.forEach(sub => {
                        if (sub instanceof PiEditPropertyProjection) {
                            propsToSet.push(sub.expression.findRefOfLastAppliedFeature());
                        }
                    });
                }
            });
        });

        // see if this concept has subconcepts
        const subs = piClassifier.allSubConceptsDirect();
        let choiceBetweenSubconcepts = "";
        if (subs.length > 0) {
            choiceBetweenSubconcepts = ` ${subs.map((implementor, index) =>
                `var${index}:${Names.classifier(implementor)} { return var${index}; }`).join("\n\t/ ")}\n\t/ `;
        }

        // now we have enough information to create the parse rule
        // which is a choice between the rules for the direct sub-concepts
        // and a rule where every property mentioned in the editor definition is set.
        return `${myName} =${choiceBetweenSubconcepts} ${conceptDef.projection.lines.map(l =>
            `${this.doAllItems(l.items)}`
        ).join("\n\t")}\n\t{ return creator.create${myName}({${propsToSet.map(prop => `${prop.name}:${prop.name}`).join(", ")}}); }\n`;
    }

    private doAllItems(list: PiEditProjectionItem[]): string {
        let result = "";
        if (!!list && list.length > 0) {
            list.forEach((item, index) => {
                if (item instanceof PiEditProjectionText) {
                    result += `${this.makeTextProjection(item)}`
                } else if (item instanceof PiEditPropertyProjection) {
                    result += `${this.makePropertyProjection(item, item.expression.findRefOfLastAppliedFeature().name)} ws `
                } else if (item instanceof PiEditSubProjection) {
                    result += `${this.makeSubProjection(item)} ws `
                }
            });
        }
        return result;
    }

    private makeSubProjection(item: PiEditSubProjection): string {
        // TODO check: I expect only one property projection in a sub projection
        if (item.optional) {
            let parseText = "";
            let propName = "";
            let subName = "";
            item.items.forEach(sub => {
                if (sub instanceof PiEditSubProjection) {
                    parseText += this.makeSubProjection(sub);
                }
                if (sub instanceof PiEditPropertyProjection) {
                    propName = sub.expression.findRefOfLastAppliedFeature().name;
                    subName = propName + "Sub";
                    parseText += `${this.makePropertyProjection(sub, subName)}`;
                }
                if (sub instanceof PiEditProjectionText) {
                    parseText += `${this.makeTextProjection(sub)}`;
                }
            });
            return `${propName.length>0? `${propName}:` : ``}(${parseText} ${subName.length>0? `{ return ${subName}; }` : ``})?`;
        } else {
            return `${this.doAllItems(item.items)}`;
        }
    }

    private makePropertyProjection(item: PiEditPropertyProjection, variableName: string): string {
        const myElem = item.expression.findRefOfLastAppliedFeature();
        if (!!myElem) {
            if (myElem.isList) {
                let listRuleName = this.makeNameOfListRule(myElem, item);

                if (item.listJoin?.joinType === ListJoinType.Separator) {
                    return `${variableName}:${listRuleName}?`;
                } else {
                    const subName = variableName + "ListElem";
                    if (!myElem.isPart) {
                        listRuleName += referencePostfix;
                        if (!this.referredClassifiers.includes(myElem.type.referred)) {
                            this.referredClassifiers.push(myElem.type.referred);
                        }
                    }
                    let joinText = this.makeListJoinText(item.listJoin?.joinText);
                    if (joinText.length > 0) {
                        return `${variableName}:(${subName}:${listRuleName} ws "${joinText}" ws { return ${subName}; } )*`;
                    } else {
                        return `${variableName}:(${listRuleName})*`;
                    }
                }
            } else {
                if (myElem instanceof PiPrimitiveProperty) {
                    const typeName = this.makeTypeName(myElem, item);
                    return `${variableName}:${typeName}`;
                } else {
                    const typeName = Names.classifier(myElem.type.referred);
                    if (myElem.isPart) {
                        return `${variableName}:${typeName}`;
                    } else { // the property is a reference
                        if (!this.referredClassifiers.includes(myElem.type.referred)) {
                            this.referredClassifiers.push(myElem.type.referred);
                        }
                        return `${variableName}:${typeName}${referencePostfix}`;
                    }
                }
            }
        } else {
            return "";
        }
    }

    private makeNameOfListRule(myElem: PiProperty, item: PiEditPropertyProjection) {
        this.listNumber++;
        let listRuleName: string;
        if (myElem instanceof PiPrimitiveProperty) {
            listRuleName = Names.startWithUpperCase(myElem.primType) + "List" + this.listNumber;
            this.makeRuleForList(item, myElem, listRuleName);
        } else {
            if (item.listJoin?.joinType === ListJoinType.Separator) {
                listRuleName = Names.startWithUpperCase(myElem.type.referred.name) + "List" + this.listNumber;
                this.makeRuleForList(item, myElem, listRuleName);
            } else {
                listRuleName = Names.startWithUpperCase(myElem.type.referred.name);
                // no extra list rule needed
            }
        }
        return listRuleName;
    }

    private makeReferenceRule(piClassifier: PiClassifier, editDef: PiEditUnit): string {
        if (piClassifier instanceof PiLimitedConcept) {
            // see if there is a projection defined
            const conceptEditor = editDef.findConceptEditor(piClassifier);
            if (conceptEditor) {
                // make a rule according to the projection
                const result = this.makeInstanceReferenceRule(piClassifier, conceptEditor);
                if (result.length <=0) {
                    return this.makeNormalReferenceRule(piClassifier);
                } else {
                    return result;
                }
            } else {
                return this.makeNormalReferenceRule(piClassifier);
            }
        }
        return this.makeNormalReferenceRule(piClassifier);
    }

    private makeInstanceReferenceRule(piClassifier: PiLimitedConcept, conceptEditor: PiEditConcept) {
        const myName = Names.classifier(piClassifier);
        let noResult = false;
        let result: string = `${myName}${referencePostfix} = `;
        conceptEditor.projection.lines.forEach((line, index) => {
            line.items.forEach(item => {
                if (item instanceof PiEditInstanceProjection) {
                    result += this.makeInstanceProjection(item, myName);
                } else if (item instanceof PiEditPropertyProjection) {
                    // TODO do we allow other projections for limited concepts????
                    noResult = true;
                }
            });
            if (index < conceptEditor.projection.lines.length -1) {
                result += "\n\t/ ";
            }
        });
        if (noResult) {
            return "";
        } else {
            return result + "\n";
        }
    }

    private makeNormalReferenceRule(piClassifier: PiClassifier) {
        const myName = Names.classifier(piClassifier);
        return `${myName}${referencePostfix} = name:variable
    { return creator.create${myName}${referencePostfix}({name: name}); }\n`;
    }

    private makeInstanceProjection(item: PiEditInstanceProjection, conceptName: string): string {
        const instanceName = item.expression.referredElement.name;
        return `"${item.keyword}" { return creator.create${conceptName}${referencePostfix}({name: "${instanceName}"});}`;
    }

    private makeRuleForList(item: PiEditPropertyProjection, myElem: PiProperty, listRuleName: string) {
        // find the right typeName
        let typeName: string = "";
        if (myElem instanceof PiPrimitiveProperty) {
            typeName = this.makeTypeName(myElem, item);
        } else {
            typeName = Names.classifier(myElem.type.referred);
            if (!myElem.isPart) { // it is a reference, so use the rule for creating a PiElementReference
                typeName += referencePostfix;
                if (!this.referredClassifiers.includes(myElem.type.referred)) {
                    this.referredClassifiers.push(myElem.type.referred);
                }
            }
        }

        // create the right separator text
        let joinText = this.makeListJoinText(item.listJoin?.joinText);

        // push the rule to the textForListConcepts to be added to the template later
        if (joinText.length > 0) {
            this.textForListConcepts.push(`${listRuleName} = head:${typeName} tail:("${joinText}" ws v:${typeName} { return v; })*
    { return [head].concat(tail); }\n`);
        } else {
            this.textForListConcepts.push(`${listRuleName} = head:${typeName} tail:(v:${typeName} { return v; })*
    { return [head].concat(tail); }\n`);
        }
    }

    private makeTypeName(myElem: PiPrimitiveProperty, item: PiEditPropertyProjection): string {
        // TODO make a difference between variables and stringLiterals in the .ast file
        let typeName: string = "";
        if (myElem.name === "name") {
            typeName = "variable";
        } else {
            switch (myElem.primType) {
                case "string": {
                    typeName = "stringLiteral";
                    break;
                }
                case "number": {
                    typeName = "numberLiteral";
                    break;
                }
                case "boolean": {
                    if (!!item.keyword) {
                        typeName = `"${item.keyword}"`
                    } else {
                        typeName = "booleanLiteral";
                    }
                    break;
                }
                default:
                    typeName = "stringLiteral";
            }
        }
        return typeName;
    }

    // this method returns a list of classifiers that are used as types of parts of 'piClassifier'
    // if the type of a part is an interface, all implementing concepts - direct, or through base interfaces -
    // are returned
    // if the type of a part is an abstract concept, all direct subconcepts are returned
    // 'typesDone' is a list of classifiers that are already examined
    private addPartConcepts(piClassifier: PiClassifier, result: PiClassifier[], typesDone: PiClassifier[]) {
        // make sure this classifier is not visited twice
        if (typesDone.includes(piClassifier)) {
            return;
        }
        typesDone.push(piClassifier);

        // include this classifier in the result
        if (!result.includes(piClassifier)) {
            result.push(piClassifier);
        }

        // see what else needs to be included
        if (piClassifier instanceof PiConcept) {
            if (!piClassifier.isAbstract) {
                // for non-abstract concepts include all types of parts
                piClassifier.allParts().forEach(part => {
                    const type = part.type.referred;
                    this.addPartConcepts(type, result, typesDone);
                });
            }
            // for any concept: add all direct subconcepts
            piClassifier.allSubConceptsDirect().forEach(type2 => {
                this.addPartConcepts(type2, result, typesDone);
            });
        } else if (piClassifier instanceof PiInterface) {
            // for interfaces include all implementors and subinterfaces
            LangUtil.findAllImplementorsAndSubs(piClassifier).forEach(type2 => {
                this.addPartConcepts(type2, result, typesDone);
            });
        }
    }

    private findEditorDefsForUnit(langUnit: PiConcept, conceptEditors: PiEditConcept[], result1: PiEditConcept[], result2: PiInterface[]) {
        const typesUsedInUnit = [];
        this.addPartConcepts(langUnit, typesUsedInUnit, []);
        // Again note that the order in which the rules are stated, determines whether the parser is functioning or not
        // first create a rule for the unit, next for its children, etc.
        typesUsedInUnit.forEach(type => {
            if (type instanceof PiConcept) {
                result1.push(...conceptEditors.filter(editor => editor.concept.referred === type));
            } else if (type instanceof PiInterface) {
                result2.push(type);
            }
        });
    }

    private makeChoiceRule(piClassifier: PiClassifier): string {
        // for interfaces we create a parse rule that is a choice between all classifiers that either implement or extend the interface
        // because limited concepts can only be used as reference, these are excluded for this choice
        // we also need to filter out the interface itself
        // the same is done for abstract concepts
        let implementors: PiClassifier[] = [];
        if (piClassifier instanceof PiInterface) {
            // TODO should we include a reference to a limited concept in the parse rule for an interface?
            implementors.push(...piClassifier.allSubInterfacesDirect());
            implementors.push(...LangUtil.findImplementorsDirect(piClassifier).filter(piCLassifier => !(piCLassifier instanceof PiLimitedConcept)));
        } else if (piClassifier instanceof PiConcept) {
            implementors = piClassifier.allSubConceptsDirect().filter(piCLassifier => !(piCLassifier instanceof PiLimitedConcept));
        }

        if (implementors.length > 0 ) {
            return `${Names.classifier(piClassifier)} = ${implementors.map((implementor, index) =>
                `var${index}:${Names.classifier(implementor)} { return var${index}; }`).join("\n    / ")}\n`;
        } else {
            return `${Names.classifier(piClassifier)} = "ERROR: there are no concepts that implement this interface"\n`;
        }
    }

    private makeBinaryExpressionRule(conceptDef: PiEditConcept, piClassifier: PiBinaryExpressionConcept) {
        const left = piClassifier.allProperties().find(prop => prop.name === "left");
        const right = piClassifier.allProperties().find(prop => prop.name === "right");
        const leftRule = Names.classifier(left.type.referred);
        const rightRule = Names.classifier(right.type.referred);
        const symbol = conceptDef.symbol;
        const myName = Names.classifier(piClassifier);
        return `${myName} = "(" ws left:${leftRule} ws "${symbol}" ws right:${rightRule} ws ")"
    { return creator.create${myName}({left: left, right: right}); }
    `;
    }

    private makeListJoinText(joinText: string): string {
        let result: string = "";
        if (!!joinText) {
            result = joinText.trimRight();
            // console.log("trimmed: " + result);
        }
        // TODO should test on all manners of whitespace
        if (result == "\\n" || result == "\\n\\n" || result == "\\t" || result == "\\r") {
            // console.log("found \\n: " + result);
            result = "";
        }
        // console.log("makeListJoinText, input: " + joinText + "output: " + result);
        return result;
    }

    private makeTextProjection(item: PiEditProjectionText): string {
        // TODO escape all quotes in a text string in a PiEditProjectionText
        // const escaped = trimmed.split("\"").join("\\\"");
        const trimmed = item.text.trim();
        let splitted: string[];
        if (trimmed.includes(" ")) { // we need to add a series of texts with whitespace between them
            splitted = trimmed.split(" "); //.join(" ws ");
            let result: string = "";
            splitted.forEach(str => {
                result += `\"${str}\" ws `
            });
            return result;
        } else {
            return `\"${trimmed}\" ws `;
        }
    }

}
