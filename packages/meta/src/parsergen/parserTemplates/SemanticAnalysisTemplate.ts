import { FreClassifier, FreConcept, FreLanguage, FrePrimitiveProperty } from "../../languagedef/metalanguage";
import { LANGUAGE_GEN_FOLDER, LANGUAGE_UTILS_GEN_FOLDER, Names } from "../../utils";
import { FrePrimitiveType } from "../../languagedef/metalanguage/FreLanguage";
import { UnitAnalyser } from "./UnitAnalyser";

// first call 'analyse' then the other methods as they depend on the global variables to be set

// TODO rethink semantic analysis => should be done on whole model
// why is common unit not included???
export class SemanticAnalysisTemplate {
    imports: FreClassifier[] = [];
    possibleProblems: FreConcept[] = [];
    supersOfProblems: FreClassifier[] = [];
    private exprWithBooleanProp: Map<FreClassifier, FrePrimitiveProperty> = new Map<FreClassifier, FrePrimitiveProperty>();

    analyse(analyser: UnitAnalyser) {
        // this.reset();
        // find which classifiers have possible problems
        for (const [classifier, subs] of analyser.interfacesAndAbstractsUsed) {
            if (!((classifier as FreConcept).base)) {
                let hasProblems: boolean = false;
                const subsWithSingleReference: FreConcept[] = [];
                for (const sub of subs) {
                    if (sub instanceof FreConcept) {
                        for (const ref of sub.allReferences()) {
                            if (analyser.classifiersUsed.includes(ref.type)) {
                                this.addProblem(sub);
                                hasProblems = true;
                            }
                        }
                        // find all concepts that have a single non-optional reference, and possibly other optional props
                        // the parsing will render a rule thatmatches when only one reference is present
                        // these references need to be checked against their expected (meta)types.
                        const nonOptionals = sub.allProperties().filter(prop => !prop.isOptional);
                        if (nonOptionals.length === 1 && !nonOptionals[0].isPart) {
                            subsWithSingleReference.push(sub);
                        }
                    }
                    for (const prim of sub.allPrimProperties()) {
                        if (prim.type === FrePrimitiveType.boolean) {
                            this.exprWithBooleanProp.set(sub, prim);
                        }
                    }
                }
                if (subsWithSingleReference.length > 1) { // a single one will not result in problems
                    subsWithSingleReference.forEach(sub => {
                        // console.log("adding problem for " + sub.name);
                        this.addProblem(sub);
                    });
                    hasProblems = true;
                }
                if (hasProblems) {
                    this.addSuper(classifier);
                }
            }
        }
    }

    private addSuper(classifier: FreClassifier) {
        if ( !this.supersOfProblems.includes(classifier)) {
            this.supersOfProblems.push(classifier);
        }
    }

    private addProblem(sub: FreConcept) {
        if ( !this.possibleProblems.includes(sub)) {
            this.possibleProblems.push(sub);
        }
    }

    makeCorrector(language: FreLanguage, relativePath: string): string {
        this.imports = [];
        const everyConceptName: string = Names.allConcepts(language);
        const className: string = Names.semanticAnalyser(language);
        const refWalkerName: string = Names.semanticWalker(language);
        // TODO rethink the replacement of all properties of an object and test it

        // start Template
        return `import { ${everyConceptName}, ${this.imports.map(concept => Names.classifier(concept)).join(", ")} } from "${relativePath}${LANGUAGE_GEN_FOLDER}";
                import { ${Names.walker(language)} } from "${relativePath}${LANGUAGE_UTILS_GEN_FOLDER}";
                import { ${refWalkerName} } from "./${refWalkerName}";
                import { FreLanguageConcept, ${Names.FreLanguage}, ${Names.FreNode}, ${Names.FreNodeReference} } from "@freon4dsl/core";

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
                            const myType: FreLanguageConcept = ${Names.FreLanguage}.getInstance().concept(toBeReplaced.freLanguageConcept());
                            myType.properties.forEach(prop => {
                                if (prop.type !== "boolean" && !!toBeReplaced[prop.name]) {
                                    newObject[prop.name] = toBeReplaced[prop.name];
                                }
                            });
                            let parent: ${Names.FreNode} = toBeReplaced.freOwnerDescriptor().owner;
                            const propName: string = toBeReplaced.freOwnerDescriptor().propertyName;
                            const propIndex: number = toBeReplaced.freOwnerDescriptor().propertyIndex;
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

    makeWalker(language: FreLanguage, relativePath: string): string {
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
              ${Names.allConcepts(language)}, ${this.imports.map(concept => Names.classifier(concept)).join(", ")}
            } from "${relativePath}${LANGUAGE_GEN_FOLDER}";
            import { ${Names.workerInterface(language)}, ${Names.defaultWorker(language)} } from "${relativePath}${LANGUAGE_UTILS_GEN_FOLDER}";
            import { ${Names.FreNamedNode}, ${Names.FreLanguage}, ${Names.LanguageEnvironment}, ${Names.FreNodeReference} } from "@freon4dsl/core";

            export class ${className} extends ${Names.defaultWorker(language)} implements ${Names.workerInterface(language)} {
                changesToBeMade: Map<${everyConceptName}, ${everyConceptName}> = null;

                constructor(changesToBeMade: Map<${everyConceptName}, ${everyConceptName}>) {
                    super();
                    this.changesToBeMade = changesToBeMade;
                }

                ${this.possibleProblems.map(poss => `${this.makeVistorMethod(poss)}`).join("\n")}

                private findReplacement(modelelement: ${Names.allConcepts(language)}, referredElem: ${Names.FreNodeReference}<${Names.FreNamedNode}>) {
                    const scoper = ${Names.LanguageEnvironment}.getInstance().scoper;
                    const possibles = scoper.getVisibleElements(modelelement).filter(elem => elem.name === referredElem.name);
                    if (possibles.length > 0) {
                        // element probably refers to something with another type
                        let replacement: ${Names.allConcepts(language)} = null;
                        for (const elem of possibles) {
                            const metatype = elem.freLanguageConcept();
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

    // TODO if there are possibles, but still the metatype is not correct, do not make a replacement
    private makeReplacementIfStat(): string {
        // TODO add replacement of properties that are lists
        let result: string = "";
        for (const poss of this.possibleProblems) {
            if (!poss.isAbstract) {
                const toBeCreated: string = Names.classifier(poss);
                for (const ref of poss.allReferences().filter(prop => !prop.isList)) {
                    const type: FreClassifier = ref.type;
                    const metatype: string = Names.classifier(type);
                    this.addToImports(type);
                    const propName: string = ref.name;
                    result += `if (${Names.FreLanguage}.getInstance().metaConformsToType(elem, "${metatype}")) {
                        replacement = ${toBeCreated}.create({ ${propName}: ${Names.FreNodeReference}.create<${metatype}>(referredElem.name, metatype) });
                    } else `;
                }
            }
        }
        if (result.length > 0) {
            result += `{ throw new Error("Semantic analysis error: cannot replace reference: " + referredElem.name + " of type " + metatype + "." ) }`;
        }
        return result;
    }

    private makeVistorMethod(freConcept: FreConcept): string {
        // TODO add replacement of properties that are lists
        return `
            /**
             * Test whether the references in 'modelelement' are correct.
             * If not, find possible replacements.
             * @param modelelement
             */
            public execBefore${Names.concept(freConcept)}(modelelement: ${Names.concept(freConcept)}): boolean {
                let referredElem: ${Names.FreNodeReference}<${Names.FreNamedNode}>;
                ${freConcept.allReferences().filter(prop => !prop.isList).map(prop =>
                `referredElem = modelelement.${prop.name};
                if (!!modelelement.${prop.name} && modelelement.${prop.name}.referred === null) { // cannot find a '${prop.name}' with this name
                    this.findReplacement(modelelement, referredElem);
                }`).join("\n")}
                return false;
            }`;
    }

    private addToImports(extra: FreClassifier | FreClassifier[]) {
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
        this.exprWithBooleanProp = new Map<FreClassifier, FrePrimitiveProperty>();
    }

    private makeBooleanStat(): string {
        let result: string = "";
        for (const [concept, primProp] of this.exprWithBooleanProp) {
            if (concept instanceof FreConcept && !concept.isAbstract) {
                result += `if (referredElem.name === "true") {
                    this.changesToBeMade.set(modelelement, ${Names.classifier(concept)}.create({ ${primProp.name}: true }));
                } else if (referredElem.name === "false") {
                    this.changesToBeMade.set(modelelement, ${Names.classifier(concept)}.create({ ${primProp.name}: false }));
                }`;
            }
        }
        return result;
    }
}
