import { PiLanguageUnit, PiLimitedConcept } from "../../metalanguage";
import { LANGUAGE_GEN_FOLDER, Names, PROJECTITCORE } from "../../../utils";

export class StdlibTemplate {
    limitedConceptNames: string[] = [];
    constructorText: string;

    generateStdlibClass(language: PiLanguageUnit, relativePath: string): string {
        this.makeTexts(language);

        return `
        import { ${Names.PiNamedElement}, ${Names.PiStdlib} } from "${PROJECTITCORE}";
        import { ${this.limitedConceptNames.map(name => `${name}`).join(", ") } } from "${relativePath}${LANGUAGE_GEN_FOLDER}";
        
        export class ${Names.stdlib(language)} implements ${Names.PiStdlib} {
            private static stdlib: ${Names.PiStdlib};
        
            public static getInstance(): ${Names.PiStdlib} {
                if (this.stdlib === undefined || this.stdlib === null) {
                    this.stdlib = new ${Names.stdlib(language)}();
                }
                return this.stdlib;
            }
        
            elements: ${Names.PiNamedElement}[] = [];
        
            constructor() {
                ${this.constructorText}
            }
        }`;
    }

    private makeTexts(language) {
        language.concepts.filter(con => con instanceof PiLimitedConcept).map(limitedConcept => {
            this.limitedConceptNames.push(limitedConcept.name);
            this.constructorText = `${limitedConcept.instances.map(x => {
                `this.elements.push(${limitedConcept.name}.${x.name});`
            }).join("\n")}`;
        });
    }
}
