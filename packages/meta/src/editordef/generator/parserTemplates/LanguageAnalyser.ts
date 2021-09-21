import {
    PiBinaryExpressionConcept,
    PiClassifier,
    PiConcept,
    PiInterface,
    PiLimitedConcept,
    PiProperty
} from "../../../languagedef/metalanguage";
import { LangUtil } from "../../../utils";
import { PiPrimitiveType } from "../../../languagedef/metalanguage/PiLanguage";
import { PiEditorDef } from "@projectit/playground/dist/pi-languages/language/gen";
import { PiEditSubProjection, PiEditUnit } from "../../metalanguage";

export class LanguageAnalyser {
    conceptsUsed: PiConcept[] = [];
    binaryConceptsUsed: PiBinaryExpressionConcept[] = [];
    interfacesAndAbstractsUsed: PiClassifier[] = [];        // all interfaces and abstract concepts that are mentioned in this unit
    limitedsReferred: PiLimitedConcept[] = [];
    // the optionality of properties depends on both the optionality declared in the .ast def, and on the optionality of projections in the .edit def
    // therefore we keep track of these in 'optionalProps'
    optionalProps: PiProperty[] = [];

    public analyseUnit(piClassifier: PiClassifier) {
        this.analyseUnitPriv(piClassifier, []);
    }

    public addToOptionals(prop: PiProperty) {
        if (!this.optionalProps.includes(prop)) {
            this.optionalProps.push(prop);
        }
    }

    private analyseUnitPriv(piClassifier: PiClassifier, typesDone: PiClassifier[]) {
        // make sure this classifier is not visited twice
        if (typesDone.includes(piClassifier)) {
            return;
        } else {
            typesDone.push(piClassifier);
        }

        // determine in which list the piClassifier belongs
        if (piClassifier instanceof PiInterface) {
            this.interfacesAndAbstractsUsed.push(piClassifier);
            // for interfaces analyse all implementors
            LangUtil.findImplementorsRecursive(piClassifier).forEach(type => {
                this.analyseUnitPriv(type, typesDone);
            });
        } else if (piClassifier instanceof PiPrimitiveType) {
            // do nothing
        } else if (piClassifier instanceof PiConcept) {
            if (piClassifier instanceof PiLimitedConcept) {
                this.limitedsReferred.push(piClassifier);
            } else if (piClassifier instanceof PiBinaryExpressionConcept) {
                if (!piClassifier.isAbstract) {
                    this.binaryConceptsUsed.push(piClassifier);
                }
            } else {
                if (!piClassifier.isModel) {
                    // A complete model can not be parsed, only its units can be parsed separately
                    if (piClassifier.isAbstract) {
                        this.interfacesAndAbstractsUsed.push(piClassifier);
                    } else {
                        this.conceptsUsed.push(piClassifier);
                    }
                }
            }

            // for any concept: add all direct subconcepts
            piClassifier.allSubConceptsDirect().forEach(type => {
                this.analyseUnitPriv(type, typesDone);
            });
            // for any non-abstract concept: include all types of parts
            // and include all optional properties in 'this.optionalProps'
            if (!piClassifier.isAbstract) {
                this.analyseProperties(piClassifier, typesDone);
            }
        }
    }

    private analyseProperties(piClassifier: PiConcept, typesDone: PiClassifier[]) {
        piClassifier.allPrimProperties().forEach(prim => {
            if (prim.isOptional || prim.isList) {
                this.addToOptionals(prim);
            }
        });
        piClassifier.allParts().forEach(part => {
            const type = part.type.referred;
            // if (!part) console.log("undefined part in " + piClassifier.name);
            if (part.isOptional || part.isList) {
                this.addToOptionals(part);
            }
            this.analyseUnitPriv(type, typesDone);
        });
        // and add all types of references to typesReferred
        piClassifier.allReferences().forEach(ref => {
            const type = ref.type.referred;
            // if (!ref) console.log("undefined ref in " + piClassifier.name);
            if (ref.isOptional) {
                this.addToOptionals(ref);
            }
            if (type instanceof PiLimitedConcept && !this.limitedsReferred.includes(type)) {
                this.limitedsReferred.push(type);
            }
        });
    }
}