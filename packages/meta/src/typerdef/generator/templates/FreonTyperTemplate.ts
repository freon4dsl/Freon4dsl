import { Names, PROJECTITCORE, LANGUAGE_GEN_FOLDER, CONFIGURATION_FOLDER, LANGUAGE_UTILS_GEN_FOLDER } from "../../../utils";
import { FreLanguage } from "../../../languagedef/metalanguage";
import { PiTyperDef } from "../../metalanguage";

/**
 * This class generates the main typer, the one that hanldes the switch between the generated typer and the custom
 * typer(s). It also generates the indexes for the 'gen' folder and the folder with the custom typer.
 */
export class FreonTyperTemplate {
    language: FreLanguage;

    generateTyper(language: FreLanguage, typerdef: PiTyperDef, relativePath: string): string {
        this.language = language;
        // const allLangConcepts: string = Names.allConcepts(language);
        const generatedClassName: string = Names.typer(language);
        const defaultTyperName: string = Names.typerPart(language);
        const typerInterfaceName: string = Names.FreonTyperPart;
        let rootType: string;
        if (!!typerdef) {
            rootType = Names.classifier(typerdef.typeRoot());
        }

        // Template starts here
        return `
        import { ${Names.PiElement}, ${Names.FreType}, ${Names.FreLanguage}, ${typerInterfaceName} } from "${PROJECTITCORE}";

        ${!!rootType ? `import { ${rootType} } from "${relativePath}${LANGUAGE_GEN_FOLDER}";` : ``}
        import { projectitConfiguration } from "${relativePath}${CONFIGURATION_FOLDER}/${Names.configuration()}";
        import { ${defaultTyperName} } from "./${defaultTyperName}";
        import { ${Names.listUtil} } from "${relativePath}${LANGUAGE_UTILS_GEN_FOLDER}/${Names.listUtil}";
                
        /**
         * Class ${generatedClassName} implements the typer generated from, if present, the typer definition,
         * otherwise this class implements the default typer.
         */
        export class ${generatedClassName} implements ${typerInterfaceName} {
            private generatedTyper: ${defaultTyperName};
            mainTyper: ${Names.FreTyper}; // TODO remove tmp needed
            
            constructor() {
                this.generatedTyper = new ${defaultTyperName}();
                this.generatedTyper.mainTyper = this;
            }
                        
            /**
             * Returns true if 'modelelement' is marked as 'isType' in the Typer definition
             * @param modelelement
             */    
            public isType(modelelement: ${Names.PiElement}): boolean { 
                for (const typer of projectitConfiguration.customTypers) {
                    typer.mainTyper = this;
                    let result: boolean = typer.isType(modelelement);
                    if (result) {
                        return result;
                    }
                }
                // no result from custom typers => use the generated typer
                return this.generatedTyper.isType(modelelement);
            } 

            /**
             * Returns the type of 'modelelement' according to the type rules in the Typer Definition
             * @param modelelement
             */   
            public inferType(modelelement: ${Names.PiElement}): ${Names.FreType} {
                for (const typer of projectitConfiguration.customTypers) {
                    typer.mainTyper = this;
                    let result: ${Names.FreType} = typer.inferType(modelelement);
                    if (result !== null) {
                        return result;
                    }
                }
                // no result from custom typers => use the generated typer
                return this.generatedTyper.inferType(modelelement);
            }
                        
            /**
             * Returns true if the type that inferType(elem1) returns equals the type that inferType(elem2) returns.
             * This is a strict equal.
             * @param elem1
             * @param elem2
             */
            public equalsType(elem1: ${Names.PiElement}, elem2: ${Names.PiElement}): boolean {
                if (!elem1 || !elem2) return false;

                const $type1: ${Names.FreType} = this.inferType(elem1);
                const $type2: ${Names.FreType} = this.inferType(elem2);
                if (!$type1 || !$type2) return false;
                
                return this.equals($type1, $type2);
            }
            
             /**
             * Returns true if type1 equals type2.
             * This is a strict equal.
             * @param type1
             * @param type2
             */
            public equals(type1: ${Names.FreType}, type2: ${Names.FreType}): boolean {
                for (const typer of projectitConfiguration.customTypers) {
                    typer.mainTyper = this;
                    let result: boolean = typer.equals(type1, type2);
                    if (result !== null && result !== undefined) {
                        return result;
                    }
                }
                // no result from custom typers => use the generated typer
                return this.generatedTyper.equals(type1, type2);
            }
        
            /**
             * Returns true if the type that inferType(elem1) returns conforms to the type that inferType(elem2) returns, according to
             * the type rules in the Typer definition. The direction is elem1 conforms to elem2.
             * @param elem1
             * @param elem2
             */
            public conformsType(elem1: ${Names.PiElement}, elem2: ${Names.PiElement}): boolean {
                if (!elem1 || !elem2) return false;
        
                const $type1: ${Names.FreType} = this.inferType(elem1);
                const $type2: ${Names.FreType} = this.inferType(elem2);
                if (!$type1 || !$type2) return false;
        
                return this.conforms($type1, $type2);
            }
            
            /**
             * Returns true if type1 conforms to type2. The direction is type1 conforms to type2.
             * @param type1
             * @param type2
             */
            public conforms(type1: ${Names.FreType}, type2: ${Names.FreType}): boolean {
                for (const typer of projectitConfiguration.customTypers) {
                    typer.mainTyper = this;
                    let result: boolean = typer.conforms(type1, type2);
                    if (result !== null) {
                        return result;
                    }
                }
                // no result from custom typers => use the generated typer
                return this.generatedTyper.conforms(type1, type2);
            }
            
            /**
             * Returns true if all types of the elements in elemlist1 conform to the types of the elements in elemlist2, 
             * pairwise, in the given order.
             * @param elemlist1
             * @param elemlist2
             */
            public conformsListType(elemlist1: ${Names.PiElement}[], elemlist2: ${Names.PiElement}[]): boolean {
                if (!elemlist1 || !elemlist2) return false;
                if (elemlist1.length !== elemlist2.length) return false;
        
                const $typelist1: ${Names.FreType}[] = this.elementListToTypeList(elemlist1);
                const $typelist2: ${Names.FreType}[] = this.elementListToTypeList(elemlist2);
                if ($typelist1.length === 0 || $typelist2.length === 0) return false;
                if ($typelist1.length !== $typelist2.length) return false;
        
                return this.conformsList($typelist1, $typelist2);
            }

            /**
             * Returns true if all types in typelist1 conform to the types in typelist2, pairwise, in the given order.
             * @param typelist1
             * @param typelist2
             */
            public conformsList(typelist1: ${Names.FreType}[], typelist2: ${Names.FreType}[]): boolean {
                for (const typer of projectitConfiguration.customTypers) {
                    typer.mainTyper = this;
                    let result: boolean = typer.conformsList(typelist1, typelist2);
                    if (result !== null) {
                        return result;
                    }
                }
                // no result from custom typers => use the generated typer
                return this.generatedTyper.conformsList(typelist1, typelist2);
            }

            /**
             * Returns the common super type of all elements in elemlist
             * @param elemlist
             */            
            public commonSuperType(elemlist: ${Names.PiElement}[]): ${Names.FreType} {
                if (!elemlist ) return null;
                if (elemlist.length === 0 ) return null;
        
                const $typelist: ${Names.FreType}[] = this.elementListToTypeList(elemlist);
                if ($typelist.length === 0) return null;
        
                return this.commonSuper($typelist);
            }
        
            /**
             * Returns the common super type of all types in typelist
             * @param typelist
             */
            public commonSuper(typelist: ${Names.FreType}[]): ${Names.FreType} {
                for (const typer of projectitConfiguration.customTypers) {
                    typer.mainTyper = this;
                    let result: ${Names.FreType} = typer.commonSuper(typelist);
                    if (!!result) {
                        return result;
                    }
                }
                // no result from custom typers => use the generated typer
                return this.generatedTyper.commonSuper(typelist);
            }
            
            /**
             * Returns all super types as defined by the conformance rules in the typer definition.
             * @param type
             */
            public getSuperTypes(type: ${Names.FreType}): ${Names.FreType}[] {
                for (const typer of projectitConfiguration.customTypers) {
                    typer.mainTyper = this;
                    let result: ${Names.FreType}[] = typer.getSuperTypes(type);
                    if (!!result) {
                        return result;
                    }
                }
                // no result from custom typers => use the generated typer
                return this.generatedTyper.getSuperTypes(type);
            }
    
            /**
             * Returns a list of types: one for each element of 'inlist',
             * if this type is not yet present in the result.
             * @param inlist
             * @private
             */            
            private elementListToTypeList(inlist: ${Names.PiElement}[]): ${Names.FreType}[] {
                const typelist: ${Names.FreType}[] = [];
                for (const elem of inlist) {
                    ListUtil.addIfNotPresent<${Names.FreType}>(typelist, this.inferType(elem));
                }
                return typelist;
            }
            
        }`;
    }

    generateGenIndex(language: FreLanguage): string {
        return `
        export * from "./${Names.typerPart(language)}";
        `;
    }

    generateIndex(language: FreLanguage): string {
        return `
        export * from "./${Names.customTyper(language)}";
        `;
    }
}
