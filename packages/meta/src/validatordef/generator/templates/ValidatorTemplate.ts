import { Names } from "../../../utils/Names";
import { PiLanguage, PiLangElementProperty } from "../../../languagedef/metalanguage/PiLanguage";
import { PiValidatorDef } from "../../metalanguage/PiValidatorDefLang";

export class ValidatorTemplate {
    constructor() {
    }

    generateValidator(language: PiLanguage, validdef: PiValidatorDef): string {
        console.log("Creating Validator");
        const allLangConcepts : string = Names.allConcepts(language);   
        const langConceptType : string = Names.languageConceptType(language);     
        const generatedClassName : String = Names.validator(language, validdef);
        const validatorInterfaceName : String = Names.validatorInterface(language);
        const errorClassName : String = Names.errorClassName(language);

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
        import { ${validatorInterfaceName} } from "../../language/${validatorInterfaceName}";
        import { ${errorClassName} } from "../../language/${validatorInterfaceName}";
        import { ${langConceptType} } from "../../language/${language.name}";   
        import { ${language.concepts.map(concept => `
                ${concept.name}`).join(", ")} } from "../../language";     
        
        export class ${generatedClassName} implements ${validatorInterfaceName} {

            public validate(modelelement: ${allLangConcepts}, includeChildren?: boolean) : ${errorClassName}[]{
                let result : ${errorClassName}[] = [];

                ${language.concepts.map(concept => `
                if(modelelement instanceof ${concept.name}) {
                    result.concat( this.validate${concept.name}(modelelement, includeChildren) );
                }`).join("")}

                return result;
            }

            ${language.concepts.map(concept => `
                private validate${concept.name}(modelelement: ${concept.name}, includeChildren?: boolean) : ${errorClassName}[]{
                    let result : ${errorClassName}[] = [];
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
