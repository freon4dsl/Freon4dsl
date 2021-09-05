import {
    PiClassifier,
    PiConcept,
    PiExpressionConcept,
    PiInterface, PiLanguage,
    PiPrimitiveProperty,
    PiProperty
} from "../../../languagedef/metalanguage";
import { PiEditConcept, PiEditPropertyProjection } from "../../metalanguage";
import { LangUtil, Names } from "../../../utils";

export const referencePostfix = "PiElemRef";
export const optionalRulePrefix = "_Optional";

export class ParserAnalyser {
    referredClassifiers: PiClassifier[] = [];
    expressionBase: PiExpressionConcept = null;
    sortedEditorDefs: PiEditConcept[] = [];
    sortedInterfaces: PiInterface[] = [];

    reset() {
        this.referredClassifiers = [];
        this.expressionBase = null;
        this.sortedEditorDefs = [];
        this.sortedInterfaces = [];
    }

    // The following method sorts the elements in the editor definition and
    // stores its result in two lists: one for all editor definitions found, one for all used interfaces
    analyseUnit(language: PiLanguage, langUnit: PiConcept, conceptEditors: PiEditConcept[]) {
        this.expressionBase = language.findExpressionBase();
        this.findEditorDefsForUnit(langUnit, conceptEditors, this.sortedEditorDefs, this.sortedInterfaces);
        // TODO findBinaryExpressionBase in language and use it in method for binary expressions
    }

    findTypeNameForProperty(myElem: PiProperty, item: PiEditPropertyProjection) {
        let typeName: string = "";
        if (myElem instanceof PiPrimitiveProperty) {
            // TODO make a difference between identifiers and stringLiterals in the .ast file
            if (myElem.name === "name") {
                typeName = "identifier";
            } else {
                // TODO note that when two or more similar concepts, like Example.StringLiteral and Example.BooleanLiteral
                // have as only property one with the same primTYpe, the parsing gives errors
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
                            typeName = `'${item.keyword}'`
                        } else {
                            typeName = "booleanLiteral";
                        }
                        break;
                    }
                    default:
                        typeName = "stringLiteral";
                }
            }
        } else {
            typeName = Names.classifier(myElem.type.referred);
            if (!myElem.isPart) { // it is a reference, so use the rule for creating a PiElementReference
                typeName += referencePostfix;
                // remember to create a rule for this reference
                if (!this.referredClassifiers.includes(myElem.type.referred)) {
                    this.referredClassifiers.push(myElem.type.referred);
                }
            }
        }
        return typeName;
    }

    private findEditorDefsForUnit(langUnit: PiConcept, conceptEditors: PiEditConcept[], result1: PiEditConcept[], result2: PiInterface[]) {
        const typesUsedInUnit: PiClassifier[] = [];
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
}


