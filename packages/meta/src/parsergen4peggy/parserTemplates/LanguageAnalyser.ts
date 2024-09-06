import {
    FreMetaBinaryExpressionConcept,
    FreMetaClassifier,
    FreMetaConcept,
    FreMetaLanguage,
    FreMetaLimitedConcept,
} from "../../languagedef/metalanguage/index.js";
import { UnitAnalyser } from "./UnitAnalyser.js";
import { FreMetaUnitDescription } from "../../languagedef/metalanguage/FreMetaLanguage.js";
import { SemanticAnalysisTemplate } from "./SemanticAnalysisTemplate.js";

export interface FreAnalyser {
    // name of the unit
    unit: FreMetaUnitDescription | undefined;
    // all concepts used in this unit
    classifiersUsed: FreMetaClassifier[];
    // all binary concepts used in this unit
    binaryConceptsUsed: FreMetaBinaryExpressionConcept[];
    // all interfaces and abstract concepts that are mentioned in this unit
    interfacesAndAbstractsUsed: Map<FreMetaClassifier, FreMetaClassifier[]>;
    // all limited concepts that are referred to (as type of properties), from this unit
    limitedsReferred: FreMetaLimitedConcept[];
    // all concepts that are not abstract, but do have sub concepts, from this unit
    conceptsWithSub: Map<FreMetaConcept, FreMetaClassifier[]>;
}

export class LanguageAnalyser {
    unitAnalysers: UnitAnalyser[] = [];
    private refCorrectorMaker: SemanticAnalysisTemplate = new SemanticAnalysisTemplate();
    // commonAnalyser holds the information on parts that are used in multple units
    // it is not used to analyse anything!!
    commonAnalyser: UnitAnalyser = new UnitAnalyser();

    analyseModel(language: FreMetaLanguage) {
        this.commonAnalyser.reset();

        language.units.forEach((unit) => {
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

    getRefCorrectorContent(language: FreMetaLanguage, relativePath: string): string {
        return this.refCorrectorMaker.makeCorrector(language, relativePath);
    }

    getRefCorrectorWalkerContent(language: FreMetaLanguage, relativePath: string): string {
        return this.refCorrectorMaker.makeWalker(language, relativePath);
    }

    private removeCommonsFromUnitAnalysers() {
        this.unitAnalysers.forEach((analyser) => {
            this.commonAnalyser.classifiersUsed.forEach((classifier) => {
                const index = analyser.classifiersUsed.indexOf(classifier);
                if (index !== -1) {
                    analyser.classifiersUsed.splice(index, 1);
                }
                // console.log(`removing ${classifier.name} from ${analyser.unit.name}`);
            });
            this.commonAnalyser.binaryConceptsUsed.forEach((classifier) => {
                const index = analyser.binaryConceptsUsed.indexOf(classifier);
                analyser.binaryConceptsUsed.splice(index, 1);
                // console.log(`removing ${classifier.name} from ${analyser.unit.name}`);
            });
            this.commonAnalyser.limitedsReferred.forEach((classifier) => {
                const index = analyser.limitedsReferred.indexOf(classifier);
                analyser.limitedsReferred.splice(index, 1);
                // console.log(`removing ${classifier.name} from ${analyser.unit.name}`);
            });
            const mapKeys: IterableIterator<FreMetaClassifier> = this.commonAnalyser.interfacesAndAbstractsUsed.keys();
            for (const classifier of mapKeys) {
                analyser.interfacesAndAbstractsUsed.delete(classifier);
                // console.log(`removing ${classifier.name} from ${analyser.unit.name}`);
            }
            const mapKeys2: IterableIterator<FreMetaConcept> = this.commonAnalyser.conceptsWithSub.keys();
            for (const classifier of mapKeys2) {
                analyser.conceptsWithSub.delete(classifier);
                // console.log(`removing ${classifier.name} from ${analyser.unit.name}`);
            }
        });
    }

    private getCommonsFromUnits() {
        this.unitAnalysers.forEach((analyser) => {
            const otherAnalysers: UnitAnalyser[] = this.getOtherAnalysers(analyser);
            analyser.classifiersUsed.forEach((classifier) => {
                otherAnalysers.forEach((other) => {
                    if (other.classifiersUsed.includes(classifier)) {
                        // found a common one
                        this.addClassifierUsed(classifier);
                    }
                });
            });
            analyser.binaryConceptsUsed.forEach((classifier) => {
                otherAnalysers.forEach((other) => {
                    if (other.binaryConceptsUsed.includes(classifier)) {
                        // found a common one
                        this.addBinaryConceptsUsed(classifier);
                    }
                });
            });
            analyser.limitedsReferred.forEach((classifier) => {
                otherAnalysers.forEach((other) => {
                    if (other.limitedsReferred.includes(classifier)) {
                        // found a common one
                        this.addLimitedsReferred(classifier);
                    }
                });
            });
            for (const [classifier, used] of analyser.interfacesAndAbstractsUsed) {
                otherAnalysers.forEach((other) => {
                    if (other.interfacesAndAbstractsUsed.has(classifier)) {
                        // found a common one
                        this.addInterfacesAndAbstractsUsed(classifier, used);
                    }
                });
            }
            for (const [classifier, used] of analyser.conceptsWithSub) {
                otherAnalysers.forEach((other) => {
                    if (other.conceptsWithSub.has(classifier)) {
                        // found a common one
                        this.addConceptsWithSubs(classifier, used);
                    }
                });
            }
        });
        // this.LOG();
    }

    // private LOG() {
    //     console.log(`Found common classifiers: ${this.commonAnalyser.classifiersUsed.map(cl => cl.name).join(", ")}`);
    //     console.log(`Found common binary expressions: ${this.commonAnalyser.binaryConceptsUsed.map(cl => cl.name).join(", ")}`);
    //     console.log(`Found common limited concepts: ${this.commonAnalyser.limitedsReferred.map(cl => cl.name).join(", ")}`);
    //     let names: string = "";
    //     for (const [classifier, used] of this.commonAnalyser.interfacesAndAbstractsUsed) {
    //         names += classifier.name + ", ";
    //     }
    //     console.log(`Found common interfaces and abstracts: ${names}`);
    //     names = "";
    //     for (const [classifier, used] of this.commonAnalyser.conceptsWithSub) {
    //         names += classifier.name + ", ";
    //     }
    //     console.log(`Found common concepts with subs: ${names}`);
    // }

    // private LOG_UNIT(unitAnalyser: UnitAnalyser) {
    //     console.log(`Found classifiers in ${unitAnalyser.unit.name}: ${unitAnalyser.classifiersUsed.map(cl => cl.name).join(", ")}`);
    //     console.log(`Found binary expressions in ${unitAnalyser.unit.name}: ${unitAnalyser.binaryConceptsUsed.map(cl => cl.name).join(", ")}`);
    //     console.log(`Found limited concepts in ${unitAnalyser.unit.name}: ${unitAnalyser.limitedsReferred.map(cl => cl.name).join(", ")}`);
    //     let names: string = "";
    //     for (const [classifier, used] of unitAnalyser.interfacesAndAbstractsUsed) {
    //         names += classifier.name + ", ";
    //     }
    //     console.log(`Found interfaces and abstracts in ${unitAnalyser.unit.name}: ${names}`);
    //     names = "";
    //     for (const [classifier, used] of unitAnalyser.conceptsWithSub) {
    //         names += classifier.name + ", ";
    //     }
    //     console.log(`Found concepts with subs in ${unitAnalyser.unit.name}: ${names}`);
    // }

    private getOtherAnalysers(currentAnalyser: UnitAnalyser): UnitAnalyser[] {
        const result: UnitAnalyser[] = [];
        this.unitAnalysers.forEach((analyser) => {
            if (analyser !== currentAnalyser) {
                result.push(analyser);
            }
        });
        return result;
    }

    private addClassifierUsed(classifier: FreMetaClassifier) {
        if (!this.commonAnalyser.classifiersUsed.includes(classifier)) {
            this.commonAnalyser.classifiersUsed.push(classifier);
        }
    }

    private addBinaryConceptsUsed(classifier: FreMetaBinaryExpressionConcept) {
        if (!this.commonAnalyser.binaryConceptsUsed.includes(classifier)) {
            this.commonAnalyser.binaryConceptsUsed.push(classifier);
        }
    }

    private addLimitedsReferred(classifier: FreMetaLimitedConcept) {
        if (!this.commonAnalyser.limitedsReferred.includes(classifier)) {
            this.commonAnalyser.limitedsReferred.push(classifier);
        }
    }

    private addInterfacesAndAbstractsUsed(classifier: FreMetaClassifier, used: FreMetaClassifier[]) {
        if (!this.commonAnalyser.interfacesAndAbstractsUsed.has(classifier)) {
            this.commonAnalyser.interfacesAndAbstractsUsed.set(classifier, used);
        }
    }

    private addConceptsWithSubs(classifier: FreMetaConcept, used: FreMetaClassifier[]) {
        if (!this.commonAnalyser.conceptsWithSub.has(classifier)) {
            this.commonAnalyser.conceptsWithSub.set(classifier, used);
        }
    }
}
