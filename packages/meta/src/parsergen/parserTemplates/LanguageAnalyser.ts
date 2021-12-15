import {
    PiBinaryExpressionConcept,
    PiClassifier,
    PiConcept,
    PiLanguage,
    PiLimitedConcept
} from "../../languagedef/metalanguage";
import { UnitAnalyser } from "./UnitAnalyser";
import { PiUnitDescription } from "../../languagedef/metalanguage/PiLanguage";
import { SemanticAnalysisTemplate } from "./SemanticAnalysisTemplate";

export interface PiAnalyser {
    // name of the unit
    unit: PiUnitDescription;
    // all concepts used in this unit
    classifiersUsed: PiClassifier[];
    // all binary concepts used in this unit
    binaryConceptsUsed: PiBinaryExpressionConcept[];
    // all interfaces and abstract concepts that are mentioned in this unit
    interfacesAndAbstractsUsed: Map<PiClassifier, PiClassifier[]> ;
    // all limited concepts that are referred to (as type of properties), from this unit
    limitedsReferred: PiLimitedConcept[];
    // all concepts that are not abstract, but do have sub concepts, from this unit
    conceptsWithSub: Map<PiConcept, PiClassifier[]>;
}

export class LanguageAnalyser implements PiAnalyser {
    // TODO remove 'implements PiAnalyser', make extra UnitAnalyser for common parts
    unitAnalysers: UnitAnalyser[] = [];
    private refCorrectorMaker: SemanticAnalysisTemplate = new SemanticAnalysisTemplate();
    // name of the unit
    unit: PiUnitDescription = null;
    // all concepts used in multiple units
    classifiersUsed: PiClassifier[] = [];
    // all binary concepts used in multiple units
    binaryConceptsUsed: PiBinaryExpressionConcept[] = [];
    // all interfaces and abstract concepts that are mentioned in multiple units
    interfacesAndAbstractsUsed: Map<PiClassifier, PiClassifier[]> = new Map<PiClassifier, PiClassifier[]>();
    // all limited concepts that are referred to (as type of properties), from multiple units
    limitedsReferred: PiLimitedConcept[] = [];
    // all concepts that are not abstract, but do have sub concepts, from multiple units
    conceptsWithSub: Map<PiConcept, PiClassifier[]> = new Map<PiConcept, PiClassifier[]>();


    analyseModel(language: PiLanguage) {
        language.units.forEach(unit => {
            const unitAnalyser = new UnitAnalyser();
            this.unitAnalysers.push(unitAnalyser);
            unitAnalyser.analyseUnit(unit);
            // do analysis for semantic phase
            this.refCorrectorMaker.analyse(unitAnalyser);
        });

        this.getCommonsFromUnits();
        this.removeCommonsFromUnitAnalysers();
        // this.unitAnalysers.forEach(analyser => {
        //     this.LOG_UNIT(analyser);
        // });
    }

    getRefCorrectorContent(language: PiLanguage,relativePath: string): string {
        return this.refCorrectorMaker.makeCorrector(language, relativePath);
    }

    getRefCorrectorWalkerContent(language: PiLanguage, relativePath: string): string {
        return this.refCorrectorMaker.makeWalker(language, relativePath);
    }

    private removeCommonsFromUnitAnalysers() {
        this.unitAnalysers.forEach(analyser => {
            this.classifiersUsed.forEach(classifier => {
                const index = analyser.classifiersUsed.indexOf(classifier);
                analyser.classifiersUsed.splice(index, 1);
                // console.log(`removing ${classifier.name} from ${analyser.unit.name}`);
            });
            this.binaryConceptsUsed.forEach(classifier => {
                const index = analyser.binaryConceptsUsed.indexOf(classifier);
                analyser.binaryConceptsUsed.splice(index, 1);
                // console.log(`removing ${classifier.name} from ${analyser.unit.name}`);
            });
            this.limitedsReferred.forEach(classifier => {
                const index = analyser.limitedsReferred.indexOf(classifier);
                analyser.limitedsReferred.splice(index, 1);
                // console.log(`removing ${classifier.name} from ${analyser.unit.name}`);
            });
            for (const [classifier, used] of this.interfacesAndAbstractsUsed) {
                analyser.interfacesAndAbstractsUsed.delete(classifier);
                // console.log(`removing ${classifier.name} from ${analyser.unit.name}`);
            }
            for (const [classifier, used] of this.conceptsWithSub) {
                analyser.conceptsWithSub.delete(classifier);
                // console.log(`removing ${classifier.name} from ${analyser.unit.name}`);
            }
        });
    }

    private getCommonsFromUnits() {
        this.unitAnalysers.forEach(analyser => {
            const otherAnalysers: UnitAnalyser[] = this.getOtherAnalysers(analyser);
            analyser.classifiersUsed.forEach(classifier => {
                otherAnalysers.forEach(other => {
                    if (other.classifiersUsed.includes(classifier)) {
                        // found a common one
                        this.addClassifierUsed(classifier);
                    }
                });
            });
            analyser.binaryConceptsUsed.forEach(classifier => {
                otherAnalysers.forEach(other => {
                    if (other.binaryConceptsUsed.includes(classifier)) {
                        // found a common one
                        this.addBinaryConceptsUsed(classifier);
                    }
                });
            });
            analyser.limitedsReferred.forEach(classifier => {
                otherAnalysers.forEach(other => {
                    if (other.limitedsReferred.includes(classifier)) {
                        // found a common one
                        this.addLimitedsReferred(classifier);
                    }
                });
            });
            for (const [classifier, used] of analyser.interfacesAndAbstractsUsed) {
                otherAnalysers.forEach(other => {
                    if (other.interfacesAndAbstractsUsed.has(classifier)) {
                        // found a common one
                        this.addInterfacesAndAbstractsUsed(classifier, used);
                    }
                });
            }
            for (const [classifier, used] of analyser.conceptsWithSub) {
                otherAnalysers.forEach(other => {
                    if (other.conceptsWithSub.has(classifier)) {
                        // found a common one
                        this.addConceptsWithSubs(classifier, used);
                    }
                });
            }
        });
        // this.LOG();
    }

    private LOG() {
        console.log(`Found common classifiers: ${this.classifiersUsed.map(cl => cl.name).join(", ")}`);
        console.log(`Found common binary expressions: ${this.binaryConceptsUsed.map(cl => cl.name).join(", ")}`);
        console.log(`Found common limited concepts: ${this.limitedsReferred.map(cl => cl.name).join(", ")}`);
        let names: string = "";
        for (const [classifier, used] of this.interfacesAndAbstractsUsed) {
            names += classifier.name + ", ";
        }
        console.log(`Found common interfaces and abstracts: ${names}`);
        names = "";
        for (const [classifier, used] of this.conceptsWithSub) {
            names += classifier.name + ", ";
        }
        console.log(`Found common concepts with subs: ${names}`);
    }

    private LOG_UNIT(unitAnalyser: UnitAnalyser) {
        console.log(`Found classifiers in ${unitAnalyser.unit.name}: ${unitAnalyser.classifiersUsed.map(cl => cl.name).join(", ")}`);
        // console.log(`Found binary expressions in ${unitAnalyser.unit.name}: ${unitAnalyser.binaryConceptsUsed.map(cl => cl.name).join(", ")}`);
        // console.log(`Found limited concepts in ${unitAnalyser.unit.name}: ${unitAnalyser.limitedsReferred.map(cl => cl.name).join(", ")}`);
        // let names: string = "";
        // for (const [classifier, used] of unitAnalyser.interfacesAndAbstractsUsed) {
        //     names += classifier.name + ", ";
        // }
        // console.log(`Found interfaces and abstracts in ${unitAnalyser.unit.name}: ${names}`);
        // names = "";
        // for (const [classifier, used] of unitAnalyser.conceptsWithSub) {
        //     names += classifier.name + ", ";
        // }
        // console.log(`Found concepts with subs in ${unitAnalyser.unit.name}: ${names}`);
    }

    private getOtherAnalysers(currentAnalyser: UnitAnalyser): UnitAnalyser[] {
        let result: UnitAnalyser[] = [];
        this.unitAnalysers.forEach(analyser => {
            if (analyser !== currentAnalyser) {
                result.push(analyser);
            }
        })
        return result;
    }

    private addClassifierUsed(classifier: PiClassifier) {
        if (!this.classifiersUsed.includes(classifier)) {
            this.classifiersUsed.push(classifier);
        }
    }

    private addBinaryConceptsUsed(classifier: PiBinaryExpressionConcept) {
        if (!this.binaryConceptsUsed.includes(classifier)) {
            this.binaryConceptsUsed.push(classifier);
        }
    }

    private addLimitedsReferred(classifier: PiLimitedConcept) {
        if (!this.limitedsReferred.includes(classifier)) {
            this.limitedsReferred.push(classifier);
        }
    }

    private addInterfacesAndAbstractsUsed(classifier: PiClassifier, used: PiClassifier[]) {
        if (!this.interfacesAndAbstractsUsed.has(classifier)) {
            this.interfacesAndAbstractsUsed.set(classifier, used);
        }
    }

    private addConceptsWithSubs(classifier: PiConcept, used: PiClassifier[]) {
        if (!this.conceptsWithSub.has(classifier)) {
            this.conceptsWithSub.set(classifier, used);
        }
    }
}
