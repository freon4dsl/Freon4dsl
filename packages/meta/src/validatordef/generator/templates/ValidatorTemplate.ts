import { Names } from "../../../utils/Names";
import { PiLanguageUnit, PiLangElementProperty } from "../../../languagedef/metalanguage/PiLanguage";
import { PiValidatorDef } from "../../metalanguage/PiValidatorDefLang";

export class ValidatorTemplate {
    constructor() {
    }

    generateValidator(language: PiLanguageUnit, validdef: PiValidatorDef): string {
        console.log("Creating Validator");
        const allLangConcepts : string = Names.allConcepts(language);   
        const langConceptType : string = Names.languageConceptType(language);     
        const generatedClassName : String = Names.validator(language, validdef);

        // language.concepts.map(concept => 
        //     concept.parts.forEach(p => {

        //     })
        //     concept.parts.map( part => {
        //         let p : PiLangElementProperty = part;
        //         if( p.isList) {
        //             p.for
        //         }
        //     })
        // )

        // Template starts here
        return `
        import { ${allLangConcepts} } from "../../language";
        import { PiValidator, PiError } from "@projectit/core";
        import { ${langConceptType} } from "../../language/${language.name}";   
        import { ${language.concepts.map(concept => `
                ${concept.name}`).join(", ")} } from "../../language";     
        
        export class ${generatedClassName} implements PiValidator {
            public validate(modelelement: ${allLangConcepts}, includeChildren?: boolean) : PiError[]{
                let result : PiError[] = [];
                ${language.concepts.map(concept => `
                if(modelelement instanceof ${concept.name}) {
                    result.concat( this.validate${concept.name}(modelelement, includeChildren) );
                }`).join("")}

                return result;
            }

            ${language.concepts.map(concept => `
                private validate${concept.name}(modelelement: ${concept.name}, includeChildren?: boolean) : PiError[]{
                    let result : PiError[] = [];
                    // include validations here

                    ${((concept.parts.length > 0)?
                    `if(!(includeChildren === undefined) && includeChildren) { 
                        ${concept.parts.map( part =>
                            (part.isList ?
                                `modelelement.${part.name}.forEach(p => {
                                    result.concat( this.validate${part.type.name}(p, includeChildren) );
                                });`
                            :
                                `result.concat( this.validate${part.type.name}(modelelement.${part.name}, includeChildren) );`
                            )
                        ).join("\n")}
                    }`
                    : ``
                    )}
                    // check rules of baseconcept(s)
                    ${((!!concept.base )?
                        `result.concat( this.validate${concept.base.name}(modelelement, includeChildren) );`
                    :
                        ``
                    )}
                    return result;
                }`).join("\n")}
        }`;
    }
}
