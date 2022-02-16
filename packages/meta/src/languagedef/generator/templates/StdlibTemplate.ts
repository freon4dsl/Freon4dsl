import { PiLanguage, PiLimitedConcept } from "../../metalanguage";
import { LANGUAGE_GEN_FOLDER, Names, PROJECTITCORE } from "../../../utils";

export class StdlibTemplate {
    limitedConceptNames: string[] = [];
    constructorText: string = "";

    generateStdlibClass(language: PiLanguage, relativePath: string): string {
        this.makeTexts(language);

        return `
        import { ${Names.PiNamedElement}, ${Names.PiStdlib}, Language } from "${PROJECTITCORE}";
        import { ${Names.metaType(language)}, 
                    ${this.limitedConceptNames.map(name => `${name}`).join(", ") } 
               } from "${relativePath}${LANGUAGE_GEN_FOLDER}";

        /**
         * Class ${Names.stdlib(language)} provides an entry point for all predefined elements in language ${language.name}.
         * It holds all instances of limited concepts as defined in the language definition file.
         *
         * This class uses the singleton pattern to ensure that only one instance of the class is present.
         */        
        export class ${Names.stdlib(language)} implements ${Names.PiStdlib} {
            private static stdlib: ${Names.PiStdlib};           // the only instance of this class

            /**
             * This method implements the singleton pattern
             */        
            public static getInstance(): ${Names.PiStdlib} {
                if (this.stdlib === undefined || this.stdlib === null) {
                    this.stdlib = new ${Names.stdlib(language)}();
                }
                return this.stdlib;
            }
            
            public elements: ${Names.PiNamedElement}[] = [];    // the predefined elements of language ${language.name}

            /**
             * A private constructor, as demanded by the singleton pattern,
             * in which the list of predefined elements is filled.
             */          
            private constructor() {
                ${this.constructorText}
            }  
            
            /**
             * Returns the element named 'name', if it can be found in this library.
             * If the element can not be found, 'null' is returned.
             * When 'metatype' is provided, the element is only returned when it is
             * an instance of this metatype.
             * @param name
             * @param metatype
             */            
            public find(name: string, metatype?: ${Names.metaType(language)}) : ${Names.PiNamedElement} {
                if (!!name) {
                    const possibles = this.elements.filter((elem) => elem.name === name);
                    if (possibles.length !== 0) {
                        if (metatype) {
                            for (const elem of possibles) {
                                const concept = elem.piLanguageConcept();
                                if (concept === metatype || Language.getInstance().subConcepts(concept).includes(metatype)) {
                                    return elem;
                                }
                            }
                        } else {
                            return possibles[0];
                        }
                    }
                }  
                return null;               
            }                      
        }`;
    }

    private makeTexts(language) {
        language.concepts.filter(con => con instanceof PiLimitedConcept).map(limitedConcept => {
            const myName = Names.concept(limitedConcept);
            this.limitedConceptNames.push(myName);
            this.constructorText = this.constructorText.concat(`${limitedConcept.instances.map(x =>
                `this.elements.push(${myName}.${x.name});`).join("\n ")}`);
        });
    }
}
