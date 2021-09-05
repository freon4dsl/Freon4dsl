import {
    PiBinaryExpressionConcept,
    PiClassifier,
    PiConcept, PiExpressionConcept,
    PiInterface,
    PiLanguage,
    PiLimitedConcept
} from "../../../languagedef/metalanguage";
import {
    PiEditConcept,
    PiEditProjectionItem,
    PiEditSubProjection,
    PiEditUnit
} from "../../metalanguage";
import { LangUtil, Names } from "../../../utils";

export const referencePostfix2 = "PiElemRef";

export class Analyser {
    sortedEditorDefs: PiEditConcept[] = [];
    choiceEditorDefs: PiEditConcept[] = [];
    binaryEditorDefs: PiEditConcept[] = [];
    ordinaryEditorDefs: PiEditConcept[] = [];
    optionals: PiEditSubProjection[] = [];
    referredInterfaces: PiInterface[] = [];
    referredClassifiers: PiClassifier[] = [];
    expressionBase: PiExpressionConcept = null;

    reset() {
        this.sortedEditorDefs = [];
        this.choiceEditorDefs = [];
        this.binaryEditorDefs = [];
        this.ordinaryEditorDefs = [];
        this.optionals = [];
        this.referredInterfaces = [];
        this.referredClassifiers = [];
        this.expressionBase = null;
    }

    // The following method sorts the elements in the editor definition and
    // stores its result in two lists: one for all editor definitions found, one for all used interfaces
    analyseUnit(language: PiLanguage, langUnit: PiConcept, editDef: PiEditUnit) {
        this.expressionBase = language.findExpressionBase();
        this.findEditorDefsForUnit(langUnit, editDef.conceptEditors);
        // TODO findBinaryExpressionBase in language and use it in method for binary expressions
        this.sortedEditorDefs.forEach(conceptDef => this.makeConceptRule(conceptDef));

        //
        // console.log(`this.sortedEditorDefs: ${this.sortedEditorDefs.map(def => `${def.concept.name}`)}`);
        // console.log(`this.choiceEditorDefs: ${this.choiceEditorDefs.map(def => `${def.concept.name}`)}`);
        // console.log(`this.binaryEditorDefs: ${this.binaryEditorDefs.map(def => `${def.concept.name}`)}`);
        // console.log(`this.ordinaryEditorDefs: ${this.ordinaryEditorDefs.map(def => `${def.concept.name}`)}`);
        // console.log(`this.optionals: ${this.optionals.map(def => `${def.optionalProperty().propertyName}`)}`);
        // console.log(`this.referredClassifiers: ${this.referredClassifiers.map(def => `${def.name}`)}`);
        // console.log(`this.referredInterfaces: ${this.referredInterfaces.map(def => `${def.name}`)}`);
        // console.log(`this.expressionBase: ${this.expressionBase.name}`);
    }

    private makeConceptRule(conceptDef: PiEditConcept) {
        const piClassifier: PiConcept = conceptDef.concept.referred;
        if (piClassifier.isModel || piClassifier instanceof PiLimitedConcept) {
            return;
        } else if (piClassifier instanceof PiBinaryExpressionConcept) {
            // do this before deciding it is a choice rule!!
            this.binaryEditorDefs.push(conceptDef);
        } else if (piClassifier.isAbstract) {
            this.choiceEditorDefs.push(conceptDef);
        } else {
            this.ordinaryEditorDefs.push(conceptDef);
            this.makeOrdinaryRule(conceptDef, piClassifier);
        }
    }

    private makeOrdinaryRule(conceptDef: PiEditConcept, piClassifier: PiConcept) {
        const myName = Names.classifier(piClassifier);

        // see if this concept has subconcepts
        const subs = piClassifier.allSubConceptsDirect();
        // TODO choice between subconcepts

        conceptDef.projection.lines.map(l => this.analyseItems(l.items));
    }

    private analyseItems(list: PiEditProjectionItem[]) {
        let result = "";
        if (!!list && list.length > 0) {
            list.forEach((item, index) => {
                if (item instanceof PiEditSubProjection) {
                    this.makeSubProjection(item);
                }
            });
        }
    }

    private makeSubProjection(item: PiEditSubProjection) {
        if (item.optional) {
            this.optionals.push(item);
            item.items.forEach(sub => {
                if (sub instanceof PiEditSubProjection) {
                    this.optionals.push(item);
                    this.makeSubProjection(sub);
                }
            });
        } else {
            this.analyseItems(item.items);
        }
    }

    private findEditorDefsForUnit(langUnit: PiConcept, conceptEditors: PiEditConcept[]) {
        const typesUsedInUnit = [];
        this.addPartConcepts(langUnit, typesUsedInUnit, []);
        // Note that the order in which the rules are stated, determines whether the parser is functioning or not
        // first create a rule for the unit, next for its children, etc.
        typesUsedInUnit.forEach(type => {
            if (type instanceof PiConcept) {
                this.sortedEditorDefs.push(...conceptEditors.filter(editor => editor.concept.referred === type));
            } else if (type instanceof PiInterface) {
                this.referredInterfaces.push(type);
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
