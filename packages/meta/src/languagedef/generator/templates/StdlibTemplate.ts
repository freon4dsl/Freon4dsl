import { PiLanguageUnit, PiLimitedConcept } from "../../metalanguage";
import { LANGUAGE_GEN_FOLDER, Names, PROJECTITCORE } from "../../../utils";

export class StdlibTemplate {
    limitedConceptNames: string[] = [];
    constructorText: string = "";

    generateStdlibClass(language: PiLanguageUnit, relativePath: string): string {
        this.makeTexts(language);

        return `
        import { ${Names.PiNamedElement}, ${Names.PiStdlib} } from "${PROJECTITCORE}";
        import { ${this.limitedConceptNames.map(name => `${name}`).join(", ") } } from "${relativePath}${LANGUAGE_GEN_FOLDER}";

        /**
         * Class ${Names.stdlib(language)} provides an entry point for all predefined elements in language ${language.name}.
         * It holds all instances of limited concepts as defined in the language definition file.
         *
         * This class uses the singleton pattern to ensure that only one instance of the class is present.
         */        
        export class ${Names.stdlib(language)} implements ${Names.PiStdlib} {
            private static stdlib: ${Names.PiStdlib};           // the only instance of this class
            public elements: ${Names.PiNamedElement}[] = [];    // the predefined elements of language ${language.name}

            /**
             * This method implements the singleton pattern
             */        
            public static getInstance(): ${Names.PiStdlib} {
                if (this.stdlib === undefined || this.stdlib === null) {
                    this.stdlib = new ${Names.stdlib(language)}();
                }
                return this.stdlib;
            }
            
            /**
             * A private constructor, as demanded by the singleton pattern,
             * in which the list if predefined elements is filled.
             */          
            private constructor() {
                ${this.constructorText}
            }                        
        }`;
    }

    private makeTexts(language) {
        language.concepts.filter(con => con instanceof PiLimitedConcept).map(limitedConcept => {
            this.limitedConceptNames.push(limitedConcept.name);
            this.constructorText = this.constructorText.concat(`${limitedConcept.instances.map(x => `this.elements.push(${limitedConcept.name}.${x.name});`).join("\n ")}`);
        });
    }
}
