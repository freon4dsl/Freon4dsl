import { PiClassifier, PiConcept, PiLanguage } from "../../../languagedef/metalanguage";
import { LANGUAGE_GEN_FOLDER, LANGUAGE_UTILS_GEN_FOLDER, LangUtil, Names } from "../../../utils";

export class RefCorrectorTemplate {
    imports: PiClassifier[] = [];

    makeCorrector(language: PiLanguage, langUnit: PiConcept, interfacesAndAbstractsUsed: PiClassifier[], relativePath: string) : string {
        const everyConceptName: string = Names.allConcepts(language);
        // TODO adjust Names class and use it here
        const className: string = language.name + "RefCorrector";
        const refWalkerName: string = language.name + "RefCorrectorWalker";

        // find which classifiers have possible problems
        let possibleProblems: PiConcept[] = [];
        let supersOfProblems: PiClassifier[] = [];
        for (const classifier of interfacesAndAbstractsUsed) {
            if (!((classifier as PiConcept).base)) {
                let hasProblems: boolean = false;
                for (const sub of LangUtil.subConcepts(classifier)) {
                    if (sub.allReferences().length > 0) {
                        possibleProblems.push(sub);
                        hasProblems = true;
                    }
                }
                if (hasProblems) {
                    supersOfProblems.push(classifier);
                }
                console.log(`found possible problems for ${classifier.name}: ${possibleProblems.map(pos => `${pos.name}`).join(", ")}`);
            }
        }

        // create the correct if-statement
        let stat: string = "";
        if (supersOfProblems.length > 0) {
            stat += `const propName: string = toBeReplaced.piContainer().propertyName;
                     const propIndex: number = toBeReplaced.piContainer().propertyIndex;`;
            for (const piClassifier of supersOfProblems) {
                language.concepts.forEach(concept => {
                    concept.allParts().forEach(part => {
                        if (part.type.referred == piClassifier) {
                            // console.log(`type ${Names.classifier(piClassifier)} is used in ${Names.concept(concept)} as ${part.name}`);
                            stat +=
                                `if (parent instanceof ${Names.concept(concept)} && propName === "${part.name}") {
                                    ${!part.isList ?
                                    `(parent as ${Names.concept(concept)}).${part.name} = newObject as ${Names.classifier(piClassifier)};`
                                    :
                                    `(parent as ${Names.concept(concept)}).${part.name}.splice(propIndex, 1, newObject as ${Names.classifier(piClassifier)});`
                                    }
                                } else `;
                            this.addToImports(concept);
                        }
                    });
                });
            }
            stat += `{ throw new Error("Semantic Analysis Error: cannot replace incorrect reference."); }`;
        }

        // start Template
        return `import { ${everyConceptName}, ${this.imports.map(concept => Names.classifier(concept)).join(", ")}  } from "${relativePath}${LANGUAGE_GEN_FOLDER }";
                import { ${Names.walker(language)} } from "${relativePath}${LANGUAGE_UTILS_GEN_FOLDER }";
                import { ${refWalkerName} } from "./${refWalkerName}";
                import { PiElement } from "@projectit/core";

                export class ${className} {

                    public correct(modelunit: ${everyConceptName}) {
                        let changesToBeMade: Map<${everyConceptName}, ${everyConceptName}> = new Map<${everyConceptName}, ${everyConceptName}>();
                        // create the walker over the model tree
                        const myWalker = new ${Names.walker(language)}();

                        // create the object that will find what needs ot be changed
                        let myCorrector = new ${refWalkerName}(changesToBeMade);

                        // and add the corrector to the walker
                        myWalker.myWorkers.push(myCorrector);

                        // do the work
                        myWalker.walk(modelunit, () => {
                            return true;
                        });

                        // now change all ref errors
                        for (const [toBeReplaced, newObject] of changesToBeMade) {
                            let parent: PiElement = toBeReplaced.piContainer().container;
                            ${stat}
                        }
                    }
                }
`; // end Template
    }

    private addToImports(extra: PiClassifier | PiClassifier[]) {
        if (!!extra) {
            if (Array.isArray(extra)) {
                for (const ext of extra) {
                    if (!this.imports.includes(ext)) {
                        this.imports.push(ext);
                    }
                }
            } else if (!this.imports.includes(extra)) {
                this.imports.push(extra);
            }
        }
    }
}
