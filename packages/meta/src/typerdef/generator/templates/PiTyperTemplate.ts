import { Names } from "../../../utils/Names";
import { PiLanguageUnit } from "../../../languagedef/metalanguage/PiLanguage";
import { PiValidatorDef } from "../../../validatordef/metalanguage/ValidatorDefLang";
import { PiTyperDef, InferenceRule, TypeEqualsRule } from "../../../typerdef/metalanguage/PiTyperDefLang";
import { PiLangExp, PiLangEnumExp, PiLangThisExp } from "../../../languagedef/metalanguage/PiLangExpressions";

export class PiTyperTemplate {
    constructor() {
    }

    generateTyper(language: PiLanguageUnit, typerdef: PiTyperDef): string {
        const allLangConcepts : string = Names.allConcepts(language);   
        const langConceptType : string = Names.languageConceptType(language);     
        // TODO should take name into account
        // const generatedClassName : String = Names.typer(language, typerdef);
        const generatedClassName : String = Names.typer(language);

        
        // Template starts here 
        return `
        import { ${allLangConcepts} } from "../../language";
        import { ${Names.typerInterface()} } from "@projectit/core";
        import { ${langConceptType} } from "../../language/${language.name}";   
        import { ${language.classes.map(concept => `
                ${concept.name}`).join(", ")} } from "../../language";     
        import { ${language.enumerations.map(concept => `
                ${concept.name}`).join(", ")} } from "../../language";     

        export class ${generatedClassName} implements ${Names.typerInterface()} {

            equalsType(elem1: ${allLangConcepts}, elem2: ${allLangConcepts}): boolean {
                ${typerdef.typerRules.map(rule => 
                    (rule instanceof TypeEqualsRule) ? `${this.makeEqualsStatement(rule)}` : ``
                ).join("\n")}
                if ( this.inferType(elem1).$id === this.inferType(elem2).$id) return true;
                return false;
            }
        
            inferType(modelelement: ${allLangConcepts}): DemoType {
                return null;
            }

            ${language.classes.map(concept => `
                public validate${concept.name}(modelelement: ${concept.name}, errorlist: ${Names.errorClassName()}[], includeChildren?: boolean) {
                    

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

    private makeEqualsStatement(rule: TypeEqualsRule) : string {
        // case: two enum refs
        if (!!rule.type1.enumRef && !!rule.type2.enumRef) {
            return `
                if ( this.inferType(elem1) === ${this.langRefToTypeScript(rule.type1.enumRef)} 
                    && this.inferType(elem2) === ${this.langRefToTypeScript(rule.type2.enumRef)} ) { return true; }
                if ( this.inferType(elem2) === ${this.langRefToTypeScript(rule.type1.enumRef)} 
                    && this.inferType(elem1) === ${this.langRefToTypeScript(rule.type2.enumRef)} ) { return true; }
                `
            ;
        }
        // case: one enum ref and one @anyType
        let enumstr: string = "";
        if (!!rule.type1.enumRef)
            enumstr = this.langRefToTypeScript(rule.type1.enumRef);
        
        if (!!rule.type2.enumRef) {
            enumstr = this.langRefToTypeScript(rule.type2.enumRef);
        }            

        if (!!enumstr && (!!rule.type1.allTypes || !!rule.type2.allTypes)) {
            return `if ( this.inferType(elem1) === ${enumstr} || this.inferType(elem2) === ${enumstr} ) { return true; }`
        }
    }

    private langRefToTypeScript(ref: PiLangExp): string {
        if (ref instanceof PiLangEnumExp) {
            return `${ref.sourceName}.${ref.appliedfeature}`;
        } else if (ref instanceof PiLangThisExp) {
            return `modelelement.${ref.appliedfeature.toPiString()}`;
        } else {
            return ref.toPiString();
        }
    }


}
