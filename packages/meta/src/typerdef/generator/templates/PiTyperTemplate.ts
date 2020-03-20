import { Names } from "../../../utils/Names";
import { PiLanguageUnit, PiLangElementProperty } from "../../../languagedef/metalanguage/PiLanguage";
import { PiValidatorDef } from "../../../validatordef/metalanguage/ValidatorDefLang";

export class PiTyperTemplate {
    constructor() {
    }

    generateTyper(language: PiLanguageUnit, validdef: PiValidatorDef): string {
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
                let errorlist : ${Names.errorClassName()}[] = [];
                ${language.concepts.map(concept => `
                if(modelelement instanceof ${concept.name}) {
                    this.validate${concept.name}(modelelement, errorlist, includeChildren );
                }`).join("")}

                return errorlist;
            }

            ${language.concepts.map(concept => `
                public validate${concept.name}(modelelement: ${concept.name}, errorlist: ${Names.errorClassName()}[], includeChildren?: boolean) {
                    let myChecker = new ${Names.checker(language, validdef)}();

                    // use the right checks
                    ${concept.allSubConceptsDirect().map ( sub =>
                        `if( modelelement instanceof ${sub.name}) {
                            this.validate${sub.name}(modelelement, errorlist, includeChildren);
                        }`
                    ).join("\n")}

                    // add checks on this concept
                    myChecker.check${concept.name}(modelelement, this.myTyper, errorlist);

                    ${((!!concept.base )?
                        `// add checks of baseconcept(s)
                        myChecker.check${concept.base.name}(modelelement, this.myTyper, errorlist);`
                    :
                        ``
                    )}

                    ${((concept.parts.length > 0)?
                    ` // checking children in the model tree
                    if(!(includeChildren === undefined) && includeChildren) { 
                        ${concept.parts.map( part =>
                            (part.isList ?
                                `modelelement.${part.name}.forEach(p => {
                                    this.validate${part.type.name}(p, errorlist, includeChildren );
                                });`
                            :
                                `this.validate${part.type.name}(modelelement.${part.name}, errorlist, includeChildren );`
                            )
                        ).join("\n")}
                    }`
                    : ``
                    )}
                    
                }`).join("\n")}
        }`;
    }
}
