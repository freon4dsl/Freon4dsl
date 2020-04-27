import { Names, PROJECTITCORE, LANGUAGE_GEN_FOLDER, sortClasses } from "../../../utils";
import { PiLanguageUnit } from "../../../languagedef/metalanguage/PiLanguage";
import {
    PiLangExp,
    PiLangFunctionCallExp,
    langExpToTypeScript, PiLangSelfExp, PiInstanceExp
} from "../../../languagedef/metalanguage/PiLangExpressions";
import { PiTypeDefinition, PiTypeConceptRule, PiTypeIsTypeRule, PiTypeAnyTypeRule, PiTypeRule } from "../../metalanguage/PiTyperDefLang";

export class PiTyperTemplate {
    typerdef: PiTypeDefinition;
    language: PiLanguageUnit;

    constructor() {
    }

    generateTyper(language: PiLanguageUnit, typerdef: PiTypeDefinition, relativePath: string): string {
        if (typerdef == null) return this.generateDefault(language, relativePath);

        this.typerdef = typerdef;
        this.language = language;
        const rootType : string = this.typerdef.typeroot.name;
        const allLangConcepts : string = Names.allConcepts(language);   
        const generatedClassName : string = Names.typer(language);
        const typerInterfaceName : string = Names.PiTyper;
        const defaultType : string = this.findDefault();
        
        // Template starts here 
        return `
        import { ${typerInterfaceName} } from "${PROJECTITCORE}";
        import { ${allLangConcepts} } from "${relativePath}${LANGUAGE_GEN_FOLDER }";
        import { ${language.concepts.map(concept => `
                ${concept.name}`).join(", ")} } from "${relativePath}${LANGUAGE_GEN_FOLDER }";       

        export class ${generatedClassName} implements ${typerInterfaceName} {
            defaultType : ${rootType} = ${defaultType};

            public equalsType(elem1: ${allLangConcepts}, elem2: ${allLangConcepts}): boolean {
                ${this.makeEqualsStatement()}
                if ( this.inferType(elem1).$id === this.inferType(elem2).$id) return true;
                return false;
            }
        
            public inferType(modelelement: ${allLangConcepts}): ${rootType} {
                ${this.makeInferenceStatements()}
                return this.defaultType;
            }

            public conformsTo(elem1: ${rootType}, elem2: ${rootType}): boolean {
                ${this.makeConformsStatements()}
                if ( this.equalsType(elem1, elem2) ) return true;
                return false;
            }

            public conformList(typelist1: ${rootType}[], typelist2: ${rootType}[]): boolean {
                if (typelist1.length !== typelist2.length) return false;
                let result : boolean = true;
                for (let index in typelist1) {
                    result = this.conformsTo(typelist1[index], typelist2[index]);
                    if (result == false) return result;
                }
                return result;
            }
        
            public isType(elem: ${allLangConcepts}): boolean { // entries for all types marked as @isType
                ${this.makeIsType()}
                return false;
            }

            private commonSuperType(type1: ${rootType}, type2: ${rootType}) : ${rootType} {
                // not yet possible to define supertypes in any language
                if (type1 === type2) return type1;
                return this.defaultType;
            }   
        }`;
    }

    generateDefault(language: PiLanguageUnit, relativePath: string): string {
        const allLangConcepts : string = Names.allConcepts(language);   
        const typerInterfaceName : string = Names.PiTyper;
        const generatedClassName : string = Names.typer(language);

        // Template starts here 
        return `
        import { ${typerInterfaceName} } from "${PROJECTITCORE}";
        import { ${allLangConcepts} } from "${relativePath}${LANGUAGE_GEN_FOLDER }";
        
        export class ${generatedClassName} implements ${typerInterfaceName} {
            inferType(modelelement: ${allLangConcepts}): ${allLangConcepts} {
                return null;
            }
            equalsType(elem1: ${allLangConcepts}, elem2: ${allLangConcepts}): boolean {
                return true;
            }
            conformsTo(elem1: ${allLangConcepts}, elem2: ${allLangConcepts}): boolean {
                return true;
            }
            conformList(typelist1: ${allLangConcepts}[], typelist2: ${allLangConcepts}[]): boolean {
                return true;
            }
            isType(elem: ${allLangConcepts}): boolean {
                return false;
            }      
        }`;
    }

    generateGenIndex(language: PiLanguageUnit): string {
        return `
        export * from "./${Names.typer(language)}";
        `;
    }

    private findDefault() : string {
        let result : string = "";
        for ( let tr of this.typerdef.typerRules ) {
            if (tr instanceof PiTypeAnyTypeRule) {
                for ( let stat of tr.statements  ) {
                    if ( stat.statementtype === "conformsto" ) {                        
                        result = result.concat(`${this.makeTypeExp(stat.exp)}`);
                    }
                }
            } 
        }
        return result;
    }

    private makeConformsStatements() : string {
        let result : string = "";
        for ( let tr of this.typerdef.typerRules ) {
            if (tr instanceof PiTypeConceptRule) {
                let myConceptName = tr.conceptRef.name;
                for ( let stat of tr.statements  ) {
                    if ( stat.statementtype === "conformsto" ) {                        
                        result = result.concat(`if ( this.inferType(elem1) instanceof ${myConceptName}) {
                            return true;
                        }`);
                    }
                }
            } 
            if (tr instanceof PiTypeAnyTypeRule) {
                // console.log(" rule: " + tr.toPiString());
                for ( let stat of tr.statements  ) {
                    // console.log(" stat: " + stat.toPiString());
                    if ( stat.statementtype === "conformsto" ) {                        
                        // console.log(" stat.statementtype: " + stat.statementtype);
                        result = result.concat(`if ( this.inferType(elem2) === ${this.makeTypeExp(stat.exp)}) {
                            return true;
                        }`);
                    }
                }
            } 
        }
        return result;
    }

    private makeInferenceStatements() : string {
        let result : string = "";

        for ( let tr of this.typerdef.typerRules) {
            if (tr instanceof PiTypeIsTypeRule) {
                for (let type of tr.types) {
                    let myConceptName = type.name;
                    result = result.concat(`if (modelelement instanceof ${myConceptName}) {
                            return modelelement;
                        }`);
                }
            }
            // TODO check what to do with PiTypeAnyTypeRule
        }
        // change the order in which the statements are generated, because subclasses need to overwrite their super
        // and thus their statement needs to come before the super statement
        let myList = this.sortConceptRules(this.typerdef.conceptRules);
        for (let tr of myList) {
            let myConceptName = tr.conceptRef.name;
            for ( let stat of tr.statements  ) {
                 if ( stat.statementtype === "infertype" && !stat.isAbstract) {
                    result = result.concat(`if (modelelement instanceof ${myConceptName}) {
                            return ${this.makeTypeExp(stat.exp)};
                        }`);
                }
            }
        }
        return result;
    }

    private sortConceptRules(conceptRules: PiTypeConceptRule[]): PiTypeConceptRule[] {
        let sortedConceptRules: PiTypeConceptRule[] = [];
        let sortedClasses = sortClasses(this.language.concepts);
        for (let piclass of sortedClasses) {
            // find conceptRule for this piclass
            let myRule: PiTypeConceptRule;
            for (let rule of conceptRules) {
                if (piclass === rule.conceptRef.referred) {
                    myRule = rule;
                    // console.log("found " + piclass.name + ", index in classes: " + sortedClasses.indexOf(piclass) + ", index in rules: " + conceptRules.indexOf(rule));
                }
            }
            // if found push rule
            if (!!myRule) {
                sortedConceptRules.push(myRule);
            }
        }
        return sortedConceptRules;
    }

    private makeIsType() : string {
        let result : string = "";
        for ( let tr of this.typerdef.typerRules ) {
            if (tr instanceof PiTypeIsTypeRule) {
                for ( let type of tr.types  ) {
                    result = result.concat(`if (elem instanceof ${type.name}) {
                            return true;
                        }`);
                }
            }
        }
        return result;
    }

    private makeEqualsStatement() : string {
        for ( let rule of this.typerdef.typerRules ) {

        // case: two enum refs
        // if (!!rule.type1.enumRef && !!rule.type2.enumRef) {
        //     return `
        //         if ( this.inferType(elem1) === ${this.langExpToTypeScript(rule.type1.enumRef)}
        //             && this.inferType(elem2) === ${this.langExpToTypeScript(rule.type2.enumRef)} ) { return true; }
        //         if ( this.inferType(elem2) === ${this.langExpToTypeScript(rule.type1.enumRef)}
        //             && this.inferType(elem1) === ${this.langExpToTypeScript(rule.type2.enumRef)} ) { return true; }
        //         `
        //     ;
        // }
        // // case: one enum ref and one @anyType
        // let enumstr: string = "";
        // if (!!rule.type1.enumRef)
        //     enumstr = this.langExpToTypeScript(rule.type1.enumRef);

        // if (!!rule.type2.enumRef) {
        //     enumstr = this.langExpToTypeScript(rule.type2.enumRef);
        // }

        // if (!!enumstr && (!!rule.type1.allTypes || !!rule.type2.allTypes)) {
        //     return `if ( this.inferType(elem1) === ${enumstr} || this.inferType(elem2) === ${enumstr} ) { return true; }`
        // }
    }
    return "";
    }

    private makeTypeExp(exp: PiLangExp) : string {
        // if (exp instanceof PiLangEnumExp) {
        //     return `${exp.sourceName}.${exp.appliedfeature}`;
        // } else
        if (exp instanceof PiLangSelfExp) {
            return `this.inferType(modelelement.${langExpToTypeScript(exp.appliedfeature)})`;
        } else if (exp instanceof PiLangFunctionCallExp) {
            return `this.${exp.sourceName} (${exp.actualparams.map(
                param => `${this.makeTypeExp(param)}`
            ).join(", ")})`
        } else if (exp instanceof PiInstanceExp) {
            return `${exp.sourceName}.${langExpToTypeScript(exp.appliedfeature)}`
        } else{
            return exp?.toPiString();
        }
    }
}
