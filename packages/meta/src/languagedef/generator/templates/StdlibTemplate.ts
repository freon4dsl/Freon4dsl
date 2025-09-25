import { FreMetaConcept, FreMetaInstance, FreMetaLanguage, FreMetaLimitedConcept } from "../../metalanguage/index.js";
import {
    Names,
    CONFIGURATION_FOLDER,
    Imports
} from "../../../utils/on-lang/index.js"

export class StdlibTemplate {
    limitedConceptNames: string[] = [];
    constructorText: string = "";

    generateStdlibClass(language: FreMetaLanguage, relativePath: string): string {
        this.makeTexts(language);
        const imports = new Imports(relativePath)
        imports.core = new Set<string>([
            Names.FreNamedNode,
            Names.FreStdlib,
            Names.FreLanguage
        ]) 
        imports.utils.add(Names.listUtil)
        imports.language = new Set(this.limitedConceptNames.map(name => name))
        return `
        // TEMPLATE: StdlibTemplate.generateStdlibClass
        ${imports.makeImports(language)}
        import { freonConfiguration } from "${relativePath}${CONFIGURATION_FOLDER}/${Names.configuration}.js";

        /**
         * Class ${Names.stdlib(language)} provides an entry point for all predefined elements in language ${language.name}.
         * It holds all instances of limited concepts as defined in the language definition file.
         *
         * This class uses the singleton pattern to ensure that only one instance of the class is present.
         */
        export class ${Names.stdlib(language)} implements ${Names.FreStdlib} {
            private static stdlib: ${Names.FreStdlib};           // the only instance of this class

            /**
             * This method implements the singleton pattern
             */
            public static getInstance(): ${Names.FreStdlib} {
                if (this.stdlib === undefined || this.stdlib === null) {
                    this.stdlib = new ${Names.stdlib(language)}();
                }
                return this.stdlib;
            }

            public elements: ${Names.FreNamedNode}[] = [];    // the predefined elements of language ${language.name}

            /**
             * A private constructor, as demanded by the singleton pattern,
             * in which the list of predefined elements is filled.
             */
            private constructor() {
                ${this.constructorText}
                for (const lib of freonConfiguration.customStdLibs) {
                    ListUtil.addAllIfNotPresent<${Names.FreNamedNode}>(this.elements, lib.elements);
                }
            }

            /**
             * Returns the element named 'name', if it can be found in this library.
             * If the element can not be found, 'undefined' is returned.
             * When 'metatype' is provided, the element is only returned when it is
             * an instance of this metatype.
             * @param name
             * @param metatype
             */
            public find(name: string, metatype?: ${Names.metaType()}) : ${Names.FreNamedNode} | undefined {
                if (!!name) {
                    const possibles = this.elements.filter((elem) => elem.name === name);
                    if (possibles.length !== 0) {
                        if (metatype) {
                            for (const elem of possibles) {
                                if (${Names.FreLanguage}.getInstance().metaConformsToType(elem, metatype)) {
                                    return elem;
                                }
                            }
                        } else {
                            return possibles[0];
                        }
                    }
                }
                return undefined;
            }
        }`;
    }

    generateCustomStdlibClass(language: FreMetaLanguage): string {
        const imports = new Imports()
        imports.core = new Set<string>([
            Names.FreNamedNode,
            Names.FreStdlib
        ])

        return `
        // TEMPLATE: StdlibTemplate.generateStdlibClass
        ${imports.makeImports(language)}

        export class ${Names.customStdlib(language)} implements ${Names.FreStdlib} {
            // add all your extra predefined instances here
            get elements(): ${Names.FreNamedNode}[] {
                return [];
            }
        }`;
    }

    private makeTexts(language: FreMetaLanguage) {
        language.concepts
            .filter((con: FreMetaConcept) => con instanceof FreMetaLimitedConcept)
            .map((limCon: FreMetaConcept) => {
                const limitedConcept: FreMetaLimitedConcept = limCon as FreMetaLimitedConcept;
                const myName = Names.concept(limitedConcept);
                this.limitedConceptNames.push(myName);
                this.constructorText = this.constructorText.concat(
                    `${limitedConcept.instances
                        .map((x: FreMetaInstance) => `this.elements.push(${myName}.${x.name});`)
                        .join("\n ")}`,
                );
            });
    }

    generateIndex(language: FreMetaLanguage) {
        return `
        export * from "./${Names.customStdlib(language)}.js";
        `;
    }
}
