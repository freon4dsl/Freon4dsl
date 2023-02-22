import {
    FreBinaryExpressionConcept,
    FreClassifier,
    FreConcept,
    FreInterface,
    FreLimitedConcept
} from "../../languagedef/metalanguage";
import { LangUtil } from "../../utils";
import { FrePrimitiveType, FreUnitDescription } from "../../languagedef/metalanguage/FreLanguage";
import { FreAnalyser } from "./LanguageAnalyser";

export class UnitAnalyser implements FreAnalyser {
    unit: FreUnitDescription = null;
    // all concepts used in this unit
    classifiersUsed: FreClassifier[] = [];
    // all binary concepts used in this unit
    binaryConceptsUsed: FreBinaryExpressionConcept[] = [];
    // all interfaces and abstract concepts that are mentioned in this unit
    interfacesAndAbstractsUsed: Map<FreClassifier, FreClassifier[]> = new Map<FreClassifier, FreClassifier[]>();
    // all limited concepts that are referred to (as type of properties)
    limitedsReferred: FreLimitedConcept[] = [];
    // all concepts that are not abstract, but do have sub concepts
    conceptsWithSub: Map<FreConcept, FreClassifier[]> = new Map<FreConcept, FreClassifier[]>();

    public analyseUnit(unitDescription: FreUnitDescription) {
        this.reset();
        this.unit = unitDescription;
        this.analyseUnitPriv(unitDescription, []);
    }

    private analyseUnitPriv(freClassifier: FreClassifier, typesDone: FreClassifier[]) {
        // make sure this classifier is not visited twice
        if (typesDone.includes(freClassifier)) {
            return;
        } else {
            typesDone.push(freClassifier);
        }

        // determine in which list the piClassifier belongs
        if (freClassifier instanceof FreInterface) {
            this.interfacesAndAbstractsUsed.set(freClassifier, this.findChoices(freClassifier));
            // for interfaces analyse all implementors
            LangUtil.findImplementorsRecursive(freClassifier).forEach(type => {
                this.analyseUnitPriv(type, typesDone);
            });
        } else if (freClassifier instanceof FrePrimitiveType) {
            // do nothing
        } else if (freClassifier instanceof FreUnitDescription) {
            this.classifiersUsed.push(freClassifier);
            this.analyseProperties(freClassifier, typesDone);
        } else if (freClassifier instanceof FreConcept) {
            if (freClassifier instanceof FreLimitedConcept) {
                this.limitedsReferred.push(freClassifier);
                this.checkForSubs(freClassifier);
            } else if (freClassifier instanceof FreBinaryExpressionConcept) {
                if (!freClassifier.isAbstract) {
                    this.binaryConceptsUsed.push(freClassifier);
                    this.checkForSubs(freClassifier);
                }
            } else {
                // A complete model can not be parsed, only its units can be parsed separately
                if (freClassifier.isAbstract) {
                    this.interfacesAndAbstractsUsed.set(freClassifier, this.findChoices(freClassifier));
                } else {
                    this.classifiersUsed.push(freClassifier);
                    this.checkForSubs(freClassifier);
                }
            }
            // for any concept: add all direct subconcepts
            freClassifier.allSubConceptsDirect().forEach(type => {
                this.analyseUnitPriv(type, typesDone);
            });
            // for any non-abstract concept: include all types of parts
            // and include all optional properties in 'this.optionalProps'
            if (!freClassifier.isAbstract) {
                this.analyseProperties(freClassifier, typesDone);
            }
        }
    }

    private checkForSubs(freConcept: FreConcept) {
        const subs = this.findChoices(freConcept);
        if (subs.length > 0) {
            this.conceptsWithSub.set(freConcept, subs);
        }
    }

    private analyseProperties(freClassifier: FreClassifier, typesDone: FreClassifier[]) {
        freClassifier.allParts().forEach(part => {
            const type = part.type;
            this.analyseUnitPriv(type, typesDone);
        });
        // and add all types of references to typesReferred
        freClassifier.allReferences().forEach(ref => {
            const type = ref.type;
            if (type instanceof FreLimitedConcept && !this.limitedsReferred.includes(type)) {
                this.limitedsReferred.push(type);
            }
        });
    }

    // find the choices for this rule: all concepts that implement or extend the concept
    private findChoices(freClassifier: FreClassifier): FreClassifier[] {
        let implementors: FreClassifier[] = [];
        if (freClassifier instanceof FreInterface) {
            // do not include sub-interfaces, because then we might have 'multiple inheritance' problems
            // instead find the direct implementors and add them
            for (const intf of freClassifier.allSubInterfacesDirect()) {
                implementors.push(...LangUtil.findImplementorsDirect(intf));
            }
            implementors.push(...LangUtil.findImplementorsDirect(freClassifier));
        } else if (freClassifier instanceof FreConcept) {
            implementors = freClassifier.allSubConceptsDirect();
        }
        // limited concepts can only be referenced, so exclude them
        implementors = implementors.filter(sub => !(sub instanceof FreLimitedConcept));
        return implementors;
    }

    reset() {
        this.unit = null;
        // all concepts in this unit
        this.classifiersUsed = [];
        // all binary concepts in this unit
        this.binaryConceptsUsed = [];
        // all interfaces and abstract concepts that are mentioned in this unit
        this.interfacesAndAbstractsUsed = new Map<FreClassifier, FreClassifier[]>();
        // all limted concepts that are referred to (as type of properties)
        this.limitedsReferred = [];
        // all concepts that are not abstract, but do have subconcepts
        this.conceptsWithSub = new Map<FreConcept, FreClassifier[]>();
    }
}
