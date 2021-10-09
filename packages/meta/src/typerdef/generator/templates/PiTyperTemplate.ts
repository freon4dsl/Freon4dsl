import { Names, PROJECTITCORE, LANGUAGE_GEN_FOLDER, sortClasses, langExpToTypeScript } from "../../../utils";
import { PiClassifier, PiConcept, PiInterface, PiLanguage, PiLangExp, PiLangSelfExp } from "../../../languagedef/metalanguage";
import { PiTypeDefinition, PiTypeClassifierRule, PiTypeIsTypeRule, PiTypeAnyTypeRule } from "../../metalanguage";

export class PiTyperTemplate {
    typerdef: PiTypeDefinition;
    language: PiLanguage;

    generateTyper(language: PiLanguage, typerdef: PiTypeDefinition, relativePath: string): string {
        if (!!typerdef) {
            return this.generateFromDefinition(typerdef, language, relativePath);
        } else {
            return this.generateDefault(language, relativePath);
        }
    }

    private generateFromDefinition(typerdef: PiTypeDefinition, language: PiLanguage, relativePath: string) {
        this.typerdef = typerdef;
        this.language = language;
        const rootType: string = this.typerdef.typeroot.name;
        const allLangConcepts: string = Names.allConcepts(language);
        const generatedClassName: string = Names.typer(language);
        const typerInterfaceName: string = Names.PiTyper;
        const defaultType: string = this.findDefault();
        const allTypeConcepts: PiConcept[] = this.findAllConceptsThatAreTypes();

        // TODO make if-else-statement instead of lots of if-statements in inferType
        // TODO should equalsType return true when one of the type is ANY, or is this up to the lang developer?
        // Template starts here
        return `
        import { ${typerInterfaceName} } from "${PROJECTITCORE}";
        import { ${allLangConcepts} } from "${relativePath}${LANGUAGE_GEN_FOLDER}";
        import { ${language.concepts.map(concept => `
                ${Names.concept(concept)}`).join(", ")} } from "${relativePath}${LANGUAGE_GEN_FOLDER}";       
        import { ${language.interfaces.map(intf => `
                ${intf.name}`).join(", ")} } from "${relativePath}${LANGUAGE_GEN_FOLDER}";       

        /**
         * Class ${generatedClassName} implements the typer generated from, if present, the typer definition,
         * otherwise this class implements the default typer.
         */
        export class ${generatedClassName} implements ${typerInterfaceName} {
            defaultType: ${rootType} = ${defaultType};

            /**
             * See interface 
             */
            public equalsType(elem1: ${allLangConcepts}, elem2: ${allLangConcepts}): boolean {
                ${this.makeEqualsStatement()}
                if ( this.inferType(elem1) === this.inferType(elem2)) return true;
                return false;
            }
            
            /**
             * See interface 
             */        
            public inferType(modelelement: ${allLangConcepts}): ${rootType} {
                ${this.makeInferenceStatements(allTypeConcepts)}
                return this.defaultType;
            }
            
            /**
             * See interface 
             */
            public conformsTo(elem1: ${rootType}, elem2: ${rootType}): boolean {
                ${this.makeConformsStatements()}
                if ( this.equalsType(elem1, elem2) ) return true;
                return false;
            }
            
            /**
             * See interface 
             */
            public conformList(typelist1: ${rootType}[], typelist2: ${rootType}[]): boolean {
                if (typelist1.length !== typelist2.length) return false;
                let result: boolean = true;
                for (let index in typelist1) {
                    result = this.conformsTo(typelist1[index], typelist2[index]);
                    if (result == false) return result;
                }
                return result;
            }

            /**
             * See interface 
             */        
            public isType(elem: ${allLangConcepts}): boolean { // entries for all types marked as @isType
                ${this.makeIsType(allTypeConcepts)}
            } 
        }`;
    }

    generateDefault(language: PiLanguage, relativePath: string): string {
        const allLangConcepts: string = Names.allConcepts(language);
        const typerInterfaceName: string = Names.PiTyper;
        const generatedClassName: string = Names.typer(language);

        // Template starts here
        return `
        import { ${typerInterfaceName} } from "${PROJECTITCORE}";
        import { ${allLangConcepts} } from "${relativePath}${LANGUAGE_GEN_FOLDER }";
        
        export class ${generatedClassName} implements ${typerInterfaceName} {
            /**
             * See interface 
             */
            public inferType(modelelement: ${allLangConcepts}): ${allLangConcepts} {
                return null;
            }
            /**
             * See interface 
             */
            public equalsType(elem1: ${allLangConcepts}, elem2: ${allLangConcepts}): boolean {
                return true;
            }
            /**
             * See interface 
             */
            public conformsTo(elem1: ${allLangConcepts}, elem2: ${allLangConcepts}): boolean {
                return true;
            }
            /**
             * See interface 
             */
            public conformList(typelist1: ${allLangConcepts}[], typelist2: ${allLangConcepts}[]): boolean {
                return true;
            }
            /**
             * See interface 
             */
            public isType(elem: ${allLangConcepts}): boolean {
                return false;
            }      
        }`;
    }

    generateGenIndex(language: PiLanguage): string {
        return `
        export * from "./${Names.typer(language)}";
        `;
    }

    private findDefault(): string {
        const result: string = "";
        for (const tr of this.typerdef.typerRules) {
            if (tr instanceof PiTypeAnyTypeRule) {
                for (const stat of tr.statements) {
                    if (stat.statementtype === "conformsto" || stat.statementtype === "equalsto") {
                        return `${this.makeTypeExp(stat.exp)}`;
                    }
                }
            }
        }
        return result;
    }

    private makeConformsStatements(): string {
        let result: string = "";
        for (const tr of this.typerdef.typerRules ) {
            if (tr instanceof PiTypeClassifierRule) {
                const myConceptName = tr.conceptRef.name;
                for (const stat of tr.statements) {
                    if (stat.statementtype === "conformsto") {
                        result = result.concat(`if ( this.inferType(elem1) instanceof ${myConceptName}) {
                            return true;
                        }`);
                    }
                }
            }
            if (tr instanceof PiTypeAnyTypeRule) {
                // console.log(" rule: " + tr.toPiString());
                for (const stat of tr.statements) {
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

    private makeInferenceStatements(allTypes: PiConcept[]): string {
        // TODO check what to do with PiTypeAnyTypeRule
        let result: string = "";
        // first add statements for all concepts that are marked 'isType'
        for (const type of allTypes) {
            result = result.concat(`if (modelelement instanceof ${Names.concept(type)}) {
                                    return modelelement;
                                }`);
        }

        // next, add statements for every 'infertype' rule in the typer definition
        // beware of the order in which the statements are generated, because subclasses need to overwrite their super
        // and thus their statement needs to come before the super statement
        const myList = this.sortConceptRules(this.typerdef.classifierRules);
        for (const tr of myList) {
            const myConceptName = tr.conceptRef.name;
            for (const stat of tr.statements) {
                 if ( stat.statementtype === "infertype" && !stat.isAbstract) {
                    result = result.concat(`if (modelelement instanceof ${myConceptName}) {
                            return ${this.makeTypeExp(stat.exp)};
                        }`);
                }
            }
        }
        return result;
    }

    private sortConceptRules(conceptRules: PiTypeClassifierRule[]): PiTypeClassifierRule[] {
        const sortedConceptRules: PiTypeClassifierRule[] = [];
        const sortedClasses = sortClasses(this.language.concepts);
        for (const piclass of sortedClasses) {
            // find conceptRule for this piclass
            let myRule: PiTypeClassifierRule = null;
            for (const rule of conceptRules) {
                if (piclass === rule.conceptRef.referred) {
                    myRule = rule;
                }
            }
            // if found push rule
            if (!!myRule) {
                sortedConceptRules.push(myRule);
            }
        }
        return sortedConceptRules;
    }

    private makeIsType(allTypes: PiConcept[]): string {
        let result: string = "";
        // add statements for all concepts that are marked 'isType'
        for (const type of allTypes) {
            result = result.concat(`if (elem instanceof ${Names.concept(type)}) {
                                    return true;
                                }`);
        }
        result = result.concat(`return false;`);
        return result;
    }

    /**
     * Returns a list of all concepts that are marked 'isType',
     * including all concepts that implement an interface marked 'isType'
     */
    private findAllConceptsThatAreTypes(): PiConcept[] {
        let allTypes: PiConcept[] = [];
        for (const tr of this.typerdef.typerRules) {
            if (tr instanceof PiTypeIsTypeRule) {
                for (const type of tr.types) {
                    const realType = type.referred;
                    if (!!realType && (realType instanceof PiInterface)) {
                        const yy = realType as PiInterface;
                        // add all concepts that implement this interface
                        this.language.concepts.filter(con => con.allInterfaces().some(intf => intf === yy )).map (implementor => {
                            if (!allTypes.includes(implementor)) {
                                allTypes.push(implementor);
                            }
                        });
                    } else if (!!realType && (realType instanceof PiConcept)) {
                        if (!allTypes.includes(realType)) {
                            allTypes.push(realType);
                        }
                    }
                }
            }
        }
        return allTypes;
    }

    private makeEqualsStatement(): string {
        for (const rule of this.typerdef.typerRules) {
            // TODO check makeEqualsStatement
            if (rule instanceof PiTypeClassifierRule) {
                for (const stat of rule.statements) {
                    if (stat.statementtype === "equalsto") {
                        return `${langExpToTypeScript(stat.exp)}`;
                    }
                }
            }
        }
        return "";
    }

    private makeTypeExp(exp: PiLangExp): string {
        if (exp instanceof PiLangSelfExp) {
            return `this.inferType(modelelement.${langExpToTypeScript(exp.appliedfeature)})`;
        } else {
            return `${langExpToTypeScript(exp)}`;
        }
    }
}
