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

        ${language.concepts.map(con => this.makeConceptFunctions(con)).join("\n")}
        `;
        // end Template
    }

    private makeConceptFunctions(con: PiConcept): string {
        const conceptName : string = Names.concept(con);
        let param : string = '';
        if (con instanceof PiLimitedConcept) {
            param = `stdlib.find(data, "${conceptName}") as ${conceptName}`;
        } else {
            param = "data";
        }

        const referenceFunction = `export function create${conceptName}Reference(data: string): PiElementReference<${conceptName}> {
            return PiElementReference.create<${conceptName}>(${param}, "${conceptName}");
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

