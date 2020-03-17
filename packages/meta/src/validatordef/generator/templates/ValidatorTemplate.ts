import { Names } from "../../../utils/Names";
import { PiLanguageUnit, PiLangElementProperty } from "../../../languagedef/metalanguage/PiLanguage";
import { PiValidatorDef } from "../../../validatordef/metalanguage/ValidatorDefLang";

export class ValidatorTemplate {
    constructor() {
    }

    generateValidator(language: PiLanguageUnit, validdef: PiValidatorDef): string {
        console.log(`Creating ${Names.validator(language, validdef)}`);
        const allLangConcepts : string = Names.allConcepts(language);   
        const langConceptType : string = Names.languageConceptType(language);     
        const generatedClassName : String = Names.validator(language, validdef);

        // Template starts here 
        return `
        import { ${allLangConcepts} } from "../../language";
        import { ${Names.validatorInterface()}, ${Names.errorClassName()}, ${Names.typerInterface()} } from "@projectit/core";
        import { ${langConceptType} } from "../../language/${language.name}";   
        import { ${language.concepts.map(concept => `
                ${concept.name}`).join(", ")} } from "../../language";     
        import { ${Names.checker(language,validdef)} } from "./DemoChecker";

        export class ${generatedClassName} implements PiValidator {
            myTyper : ${Names.typerInterface()};

            public validate(modelelement: ${allLangConcepts}, includeChildren?: boolean) : PiError[]{
                let result : PiError[] = [];
                ${language.concepts.map(concept => `
                if(modelelement instanceof ${concept.name}) {
                    result.concat( this.validate${concept.name}(modelelement, includeChildren) );
                }`).join("")}

                return result;
            }

            ${language.concepts.map(concept => `
                public validate${concept.name}(modelelement: ${concept.name}, includeChildren?: boolean) : PiError[]{
                    let result : PiError[] = [];
                    result.concat(new ${Names.checker(language, validdef)}().check${concept.name}(modelelement, this.myTyper));

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
                    
                    ${((!!concept.base )?
                        `// check rules of baseconcept(s)
                        result.concat( this.validate${concept.base.name}(modelelement, includeChildren) );`
                    :
                        ``
                    )}
                    return result;
                }`).join("\n")}
        }`;
    }
}
