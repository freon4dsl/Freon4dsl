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

            public validate(modelelement: ${allLangConcepts}, includeChildren?: boolean) : ${Names.errorClassName()}[]{
                let result : ${Names.errorClassName()}[] = [];
                ${language.concepts.map(concept => `
                if(modelelement instanceof ${concept.name}) {
                    this.validate${concept.name}(modelelement, result, includeChildren );
                }`).join("")}

                return result;
            }

            ${language.concepts.map(concept => `
                public validate${concept.name}(modelelement: ${concept.name}, result: ${Names.errorClassName()}[], includeChildren?: boolean) {
                    new ${Names.checker(language, validdef)}().check${concept.name}(modelelement, this.myTyper, result);

                    ${((concept.parts.length > 0)?
                    `if(!(includeChildren === undefined) && includeChildren) { 
                        ${concept.parts.map( part =>
                            (part.isList ?
                                `modelelement.${part.name}.forEach(p => {
                                    this.validate${part.type.name}(p, result, includeChildren );
                                });`
                            :
                                `this.validate${part.type.name}(modelelement.${part.name}, result, includeChildren );`
                            )
                        ).join("\n")}
                    }`
                    : ``
                    )}
                    
                    ${((!!concept.base )?
                        `// check rules of baseconcept(s)
                        this.validate${concept.base.name}(modelelement, result, includeChildren);`
                    :
                        ``
                    )}
                }`).join("\n")}
        }`;
    }
}
