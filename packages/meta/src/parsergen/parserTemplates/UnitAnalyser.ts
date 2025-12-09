import type {
    FreMetaClassifier} from '../../languagedef/metalanguage/index.js';
import {
    FreMetaBinaryExpressionConcept,
    FreMetaConcept,
    FreMetaInterface,
    FreMetaLimitedConcept, LangUtil
} from '../../languagedef/metalanguage/index.js';
import { FreMetaPrimitiveType, FreMetaUnitDescription } from "../../languagedef/metalanguage/FreMetaLanguage.js";
import type { FreAnalyser } from "./LanguageAnalyser.js";

export class UnitAnalyser implements FreAnalyser {
    unit: FreMetaUnitDescription | undefined = undefined;
    // all concepts used in this unit
    classifiersUsed: FreMetaClassifier[] = [];
    // all binary concepts used in this unit
    binaryConceptsUsed: FreMetaBinaryExpressionConcept[] = [];
    // all interfaces and abstract concepts that are mentioned in this unit
    interfacesAndAbstractsUsed: Map<FreMetaClassifier, FreMetaClassifier[]> = new Map<
        FreMetaClassifier,
        FreMetaClassifier[]
    >();
    // all limited concepts that are referred to (as type of properties)
    limitedsReferred: FreMetaLimitedConcept[] = [];
    // all concepts that are not abstract, but do have sub concepts
    conceptsWithSub: Map<FreMetaConcept, FreMetaClassifier[]> = new Map<FreMetaConcept, FreMetaClassifier[]>();

    public analyseUnit(unitDescription: FreMetaUnitDescription) {
        this.reset();
        this.unit = unitDescription;
        this.analyseUnitPriv(unitDescription, []);
    }

    private analyseUnitPriv(freClassifier: FreMetaClassifier, typesDone: FreMetaClassifier[]) {
        // make sure this classifier is not visited twice
        if (typesDone.includes(freClassifier)) {
            return;
        } else {
            typesDone.push(freClassifier);
        }

        // determine in which list the piClassifier belongs
        if (freClassifier instanceof FreMetaInterface) {
            this.interfacesAndAbstractsUsed.set(freClassifier, this.findChoices(freClassifier));
            // for interfaces analyse all implementors
            LangUtil.findImplementorsRecursive(freClassifier).forEach((type) => {
                this.analyseUnitPriv(type, typesDone);
            });
        } else if (freClassifier instanceof FreMetaPrimitiveType) {
            // do nothing
        } else if (freClassifier instanceof FreMetaUnitDescription) {
            this.classifiersUsed.push(freClassifier);
            this.analyseProperties(freClassifier, typesDone);
        } else if (freClassifier instanceof FreMetaConcept) {
            if (freClassifier instanceof FreMetaLimitedConcept) {
                this.limitedsReferred.push(freClassifier);
                this.checkForSubs(freClassifier);
            } else if (freClassifier instanceof FreMetaBinaryExpressionConcept) {
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
            freClassifier.allSubConceptsDirect().forEach((type) => {
                this.analyseUnitPriv(type, typesDone);
            });
            // for any non-abstract concept: include all types of parts
            // and include all optional properties in 'this.optionalProps'
            if (!freClassifier.isAbstract) {
                this.analyseProperties(freClassifier, typesDone);
            }
        }
    }

    private checkForSubs(freConcept: FreMetaConcept) {
        const subs = this.findChoices(freConcept);
        if (subs.length > 0) {
            this.conceptsWithSub.set(freConcept, subs);
        }
    }

    private analyseProperties(freClassifier: FreMetaClassifier, typesDone: FreMetaClassifier[]) {
        freClassifier.allParts().forEach((part) => {
            const type = part.type;
            this.analyseUnitPriv(type, typesDone);
        });
        // and add all types of references to typesReferred
        freClassifier.allReferences().forEach((ref) => {
            const type = ref.type;
            if (type instanceof FreMetaLimitedConcept && !this.limitedsReferred.includes(type)) {
                this.limitedsReferred.push(type);
            }
        });
    }

    // find the choices for this rule: all concepts that implement or extend the concept
    private findChoices(freClassifier: FreMetaClassifier): FreMetaClassifier[] {
        let implementors: FreMetaClassifier[] = [];
        if (freClassifier instanceof FreMetaInterface) {
            // do not include sub-interfaces, because then we might have 'multiple inheritance' problems
            // instead find the direct implementors and add them
            for (const intf of freClassifier.allSubInterfacesDirect()) {
                implementors.push(...LangUtil.findImplementorsDirect(intf));
            }
            implementors.push(...LangUtil.findImplementorsDirect(freClassifier));
        } else if (freClassifier instanceof FreMetaConcept) {
            implementors = freClassifier.allSubConceptsDirect();
        }
        // limited concepts can only be referenced, so exclude them
        implementors = implementors.filter((sub) => !(sub instanceof FreMetaLimitedConcept));
        return implementors;
    }

    reset() {
        this.unit = undefined;
        // all concepts in this unit
        this.classifiersUsed = [];
        // all binary concepts in this unit
        this.binaryConceptsUsed = [];
        // all interfaces and abstract concepts that are mentioned in this unit
        this.interfacesAndAbstractsUsed = new Map<FreMetaClassifier, FreMetaClassifier[]>();
        // all limted concepts that are referred to (as type of properties)
        this.limitedsReferred = [];
        // all concepts that are not abstract, but do have subconcepts
        this.conceptsWithSub = new Map<FreMetaConcept, FreMetaClassifier[]>();
    }
}
