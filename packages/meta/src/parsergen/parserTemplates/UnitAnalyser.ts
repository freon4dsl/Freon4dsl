import {
    PiBinaryExpressionConcept,
    PiClassifier,
    PiConcept,
    PiInterface,
    PiLimitedConcept
} from "../../languagedef/metalanguage";
import { LangUtil } from "../../utils";
import { PiPrimitiveType, PiUnitDescription } from "../../languagedef/metalanguage/PiLanguage";
import { PiAnalyser } from "./LanguageAnalyser";

export class UnitAnalyser implements PiAnalyser {
    unit: PiUnitDescription = null;
    // all concepts used in this unit
    classifiersUsed: PiClassifier[] = [];
    // all binary concepts used in this unit
    binaryConceptsUsed: PiBinaryExpressionConcept[] = [];
    // all interfaces and abstract concepts that are mentioned in this unit
    interfacesAndAbstractsUsed: Map<PiClassifier, PiClassifier[]> = new Map<PiClassifier, PiClassifier[]>();
    // all limited concepts that are referred to (as type of properties)
    limitedsReferred: PiLimitedConcept[] = [];
    // all concepts that are not abstract, but do have sub concepts
    conceptsWithSub: Map<PiConcept, PiClassifier[]> = new Map<PiConcept, PiClassifier[]>();

    public analyseUnit(unitDescription: PiUnitDescription) {
        this.reset();
        this.unit = unitDescription;
        this.analyseUnitPriv(unitDescription, []);
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
            this.interfacesAndAbstractsUsed.set(piClassifier, this.findChoices(piClassifier));
            // for interfaces analyse all implementors
            LangUtil.findImplementorsRecursive(piClassifier).forEach(type => {
                this.analyseUnitPriv(type, typesDone);
            });
        } else if (piClassifier instanceof PiPrimitiveType) {
            // do nothing
        } else if (piClassifier instanceof PiUnitDescription) {
            this.classifiersUsed.push(piClassifier);
            this.analyseProperties(piClassifier, typesDone);
        } else if (piClassifier instanceof PiConcept) {
            if (piClassifier instanceof PiLimitedConcept) {
                this.limitedsReferred.push(piClassifier);
                this.checkForSubs(piClassifier);
            } else if (piClassifier instanceof PiBinaryExpressionConcept) {
                if (!piClassifier.isAbstract) {
                    this.binaryConceptsUsed.push(piClassifier);
                    this.checkForSubs(piClassifier);
                }
            } else {
                // A complete model can not be parsed, only its units can be parsed separately
                if (piClassifier.isAbstract) {
                    this.interfacesAndAbstractsUsed.set(piClassifier, this.findChoices(piClassifier));
                } else {
                    this.classifiersUsed.push(piClassifier);
                    this.checkForSubs(piClassifier);
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

    private checkForSubs(piClassifier: PiConcept) {
        const subs = this.findChoices(piClassifier);
        if (subs.length > 0) {
            this.conceptsWithSub.set(piClassifier, subs);
        }
    }

    private analyseProperties(piClassifier: PiClassifier, typesDone: PiClassifier[]) {
        piClassifier.allParts().forEach(part => {
            const type = part.type.referred;
            this.analyseUnitPriv(type, typesDone);
        });
        // and add all types of references to typesReferred
        piClassifier.allReferences().forEach(ref => {
            const type = ref.type.referred;
            if (type instanceof PiLimitedConcept && !this.limitedsReferred.includes(type)) {
                this.limitedsReferred.push(type);
            }
        });
    }

    // find the choices for this rule: all concepts that implement or extend the concept
    private findChoices(piClassifier: PiClassifier) : PiClassifier[] {
        let implementors: PiClassifier[] = [];
        if (piClassifier instanceof PiInterface) {
            // do not include sub-interfaces, because then we might have 'multiple inheritance' problems
            // instead find the direct implementors and add them
            for (const intf of piClassifier.allSubInterfacesDirect()) {
                implementors.push(...LangUtil.findImplementorsDirect(intf));
            }
            implementors.push(...LangUtil.findImplementorsDirect(piClassifier));
        } else if (piClassifier instanceof PiConcept) {
            implementors = piClassifier.allSubConceptsDirect();
        }
        // limited concepts can only be referenced, so exclude them
        implementors = implementors.filter(sub => !(sub instanceof PiLimitedConcept));
        return implementors;
    }

    reset() {
        this.unit = null;
        // all concepts in this unit
        this.classifiersUsed = [];
        // all binary concepts in this unit
        this.binaryConceptsUsed = [];
        // all interfaces and abstract concepts that are mentioned in this unit
        this.interfacesAndAbstractsUsed = new Map<PiClassifier, PiClassifier[]>();
        // all limted concepts that are referred to (as type of properties)
        this.limitedsReferred = [];
        // all concepts that are not abstract, but do have subconcepts
        this.conceptsWithSub = new Map<PiConcept, PiClassifier[]>();
    }
}
