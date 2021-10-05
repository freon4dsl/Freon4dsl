import { PiClassifier, PiConcept, PiExpressionConcept, PiLanguage, PiPrimitiveProperty } from "../../../languagedef/metalanguage";
import { ENVIRONMENT_GEN_FOLDER, LANGUAGE_GEN_FOLDER, LANGUAGE_UTILS_GEN_FOLDER, LangUtil, Names } from "../../../utils";
import { PiPrimitiveType } from "../../../languagedef/metalanguage/PiLanguage";

// first call 'analyse' then the other methods as they depend on the global variables to be set

export class SemanticAnalysisTemplate {
    imports: PiClassifier[] = [];
    possibleProblems: PiConcept[] = [];
    supersOfProblems: PiClassifier[] = [];
    private exprWithBooleanProp: Map<PiClassifier, PiPrimitiveProperty> = new Map<PiClassifier, PiPrimitiveProperty>();

    analyse(interfacesAndAbstractsUsed: Map<PiClassifier, PiClassifier[]>) {
        this.reset();
        // find which classifiers have possible problems
        // TODO use subs instead of LangUtil.subConcepts(classifier)
        for (const [classifier, subs] of interfacesAndAbstractsUsed) {
            if (!((classifier as PiConcept).base)) {
                let hasProblems: boolean = false;
                for (const sub of LangUtil.subConcepts(classifier)) {
                    if (sub.allReferences().length > 0) {
                        this.possibleProblems.push(sub);
                        hasProblems = true;
                    }
                    for (const prim of sub.allPrimProperties()) {
                        if (prim.type.referred == PiPrimitiveType.boolean) {
                            this.exprWithBooleanProp.set(sub, prim);
                        }
                    }
                }
                if (hasProblems) {
                    this.supersOfProblems.push(classifier);
                }
                // console.log(`found possible problems for ${classifier.name}: ${this.possibleProblems.map(pos => `${pos.name}`).join(", ")}`);
            }
        }
    }

    makeCorrector(language: PiLanguage, relativePath: string): string {
        this.imports = [];
        const everyConceptName: string = Names.allConcepts(language);
        const className: string = Names.semanticAnalyser(language);
        const refWalkerName: string = Names.semanticWalker(language);

        // start Template
        return `import { ${everyConceptName}, ${this.imports.map(concept => Names.classifier(concept)).join(", ")} } from "${relativePath}${LANGUAGE_GEN_FOLDER}";
                import { ${Names.walker(language)} } from "${relativePath}${LANGUAGE_UTILS_GEN_FOLDER}";
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
                            const propName: string = toBeReplaced.piContainer().propertyName;
                            const propIndex: number = toBeReplaced.piContainer().propertyIndex;
                            if (propIndex !== undefined) {
                                parent[propName].splice(propIndex, 1, newObject);
                            } else {
                                parent[propName] = newObject;
                            }
                        }
                    }
                }
`; // end Template
    }

    makeWalker(language: PiLanguage, relativePath: string): string {
        this.imports = [];
        const className: string = Names.semanticWalker(language);
        const everyConceptName: string = Names.allConcepts(language);
        this.addToImports(this.possibleProblems);
        for (const [key, value] of this.exprWithBooleanProp) {
            this.addToImports(key);
        }
        // call this method before starting the template; it will fill the 'imports'
        const replacementIfStat: string = this.makeReplacementIfStat();
        const replacementBooleanStat: string = this.makeBooleanStat();

        return `
            import {
              ${Names.allConcepts(language)}, PiElementReference, ${this.imports.map(concept => Names.classifier(concept)).join(", ")}
            } from "${relativePath}${LANGUAGE_GEN_FOLDER}";
            import { ${Names.workerInterface(language)}, ${Names.defaultWorker(language)} } from "${relativePath}${LANGUAGE_UTILS_GEN_FOLDER}";
            import { ${Names.environment(language)} } from "${relativePath}${ENVIRONMENT_GEN_FOLDER}/${Names.environment(language)}";
            import { PiNamedElement } from "@projectit/core";
            
            export class ${className} extends ${Names.defaultWorker(language)} implements ${Names.workerInterface(language)} {
                changesToBeMade: Map<${everyConceptName}, ${everyConceptName}> = null;
            
                constructor(changesToBeMade: Map<${everyConceptName}, ${everyConceptName}>) {
                    super();
                    this.changesToBeMade = changesToBeMade;
                }
                
                ${this.possibleProblems.map(poss => `${this.makeVistorMethod(language, poss)}`).join("\n")}
                
                private findReplacement(modelelement: ${Names.allConcepts(language)}, referredElem: PiElementReference<PiNamedElement>) {
                    const scoper = ${Names.environment(language)}.getInstance().scoper;
                    const possibles = scoper.getVisibleElements(modelelement).filter(elem => elem.name === referredElem.name);
                    if (possibles.length > 0) {
                        // element probably refers to something with another type
                        let replacement: ${Names.allConcepts(language)} = null;
                        for (const elem of possibles) {
                            const metatype = elem.piLanguageConcept();
                            ${replacementIfStat}
                        }
                        this.changesToBeMade.set(modelelement, replacement);
                    } else {
                        // true error, or boolean "true" or "false"
                        ${replacementBooleanStat}
                    }
                }           
            }
            `;
    }

    private makeReplacementIfStat(): string {
        let result: string = '';
        for (const poss of this.possibleProblems) {
            let toBeCreated: string = Names.classifier(poss);
            for (const ref of poss.allReferences()) {
                let type: PiClassifier = ref.type.referred;
                let metatype: string = Names.classifier(type);
                this.addToImports(type);
                let propName: string = ref.name;
                result += `if (metatype === "${metatype}") {
                        replacement = ${toBeCreated}.create({ ${propName}: PiElementReference.create<${metatype}>(referredElem.name, metatype) });
                    } else `;
            }
        }
        if (result.length > 0) {
            result += `{ throw new Error("Semantic analysis error: cannot replace reference.") }`
        }
        return result;
    }

    private makeVistorMethod(language: PiLanguage, piClassifier: PiConcept): string {
        return `
            /**
             * Test whether the references in 'modelelement' are correct.
             * If not, find possible replacements.
             * @param modelelement
             */
            public execBefore${Names.concept(piClassifier)}(modelelement: ${Names.concept(piClassifier)}): boolean {
                let referredElem: PiElementReference<PiNamedElement> = null;
                ${piClassifier.allReferences().map(prop =>
                `referredElem = modelelement.${prop.name};
                if (!!modelelement.${prop.name} && modelelement.${prop.name}.referred === null) { // cannot find a ${prop.name} with this name
                    this.findReplacement(modelelement, referredElem);
                }`)}                
                return false;
            }`;
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

    private reset() {
        this.supersOfProblems = [];
        this.possibleProblems = [];
        this.imports = [];
        this.exprWithBooleanProp = new Map<PiClassifier, PiPrimitiveProperty>();
    }

    private makeBooleanStat(): string {
        let result: string = '';
        for (const [concept, primProp] of this.exprWithBooleanProp) {
            result += `if (referredElem.name === "true") {
                    this.changesToBeMade.set(modelelement, ${Names.classifier(concept)}.create({ ${primProp.name}: true }));
                } else if (referredElem.name === "false") {
                    this.changesToBeMade.set(modelelement, ${Names.classifier(concept)}.create({ ${primProp.name}: false }));
                }`
        }
        return result;
    }
}
