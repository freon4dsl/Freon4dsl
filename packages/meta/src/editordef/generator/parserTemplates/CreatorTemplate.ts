import { PiConcept, PiLanguage, PiLimitedConcept } from "../../../languagedef/metalanguage/PiLanguage";
import { PiEditUnit } from "../../metalanguage";
import { LANGUAGE_GEN_FOLDER, Names, STDLIB_GEN_FOLDER } from "../../../utils";

export class CreatorTemplate {

    generateCreatorPart(language: PiLanguage, editDef: PiEditUnit, relativePath: string): string {
        const stdlibName = Names.stdlib(language);
        // Template starts here
        return `
        import { PiElementReference, ${language.concepts.map(concept => `
                ${Names.concept(concept)}`).join(", ")} } from "${relativePath}${LANGUAGE_GEN_FOLDER }";     
        import { ${stdlibName} } from "${relativePath}${STDLIB_GEN_FOLDER}/${stdlibName}";
        
        const stdlib = ${stdlibName}.getInstance();
        
        class Name {
            name: string;
        }
                
        /**
        *   This file contains a number of functions that are used by the javascript parsers
        *   to create instances of the user model, i.e. nodes in the abstract syntax tree.
        */

        ${language.concepts.map(con => this.makeConceptFunctions(con)).join("\n")}
        `;
        // end Template
    }

    /**
     * Creates two exported functions for PiConcept 'con'. The first creates an instance of
     * class 'con', the second creates a PiElementReference to a concept of type 'con'.
     * @param con
     */
    private makeConceptFunctions(con: PiConcept): string {
        const conceptName : string = Names.concept(con);

        const referenceFunction = `export function create${conceptName}Reference(data: Name): PiElementReference<${conceptName}> {
            return PiElementReference.create<${conceptName}>(data.name, "${conceptName}");
        }
        `;

        const addReferenceFunction: boolean = !(con.isModel || con.isUnit);

        return `export function create${conceptName}(data: Partial<${conceptName}>): ${conceptName} {
            return ${conceptName}.create(data);
        }        
        ${addReferenceFunction? `
            ${referenceFunction}` : ``}`;
    }
}

