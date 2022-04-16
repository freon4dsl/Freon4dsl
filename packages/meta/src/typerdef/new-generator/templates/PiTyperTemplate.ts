import { Names, PROJECTITCORE, LANGUAGE_GEN_FOLDER, CONFIGURATION_FOLDER } from "../../../utils";
import { PiLanguage } from "../../../languagedef/metalanguage";
import { PiTyperDef } from "../../new-metalanguage";

export class PiTyperTemplate {
    language: PiLanguage;

    generateTyper(language: PiLanguage, typerdef: PiTyperDef, relativePath: string): string {
        this.language = language;
        const allLangConcepts: string = Names.allConcepts(language);
        const generatedClassName: string = Names.typer(language);
        const defaultTyperName: string = Names.typerPart(language);
        const typerInterfaceName: string = Names.PiTyper;
        let rootType: string;
        if (!!typerdef) {
            rootType = Names.classifier(typerdef.typeRoot());
        }

        // Template starts here
        return `
        import { PiElement, PiType, ${typerInterfaceName} } from "${PROJECTITCORE}";

        ${!!rootType ? `import { ${rootType} } from "${relativePath}${LANGUAGE_GEN_FOLDER}";` : ``}
        import { projectitConfiguration } from "${relativePath}${CONFIGURATION_FOLDER}/${Names.configuration()}";
        import { ${defaultTyperName} } from "./${defaultTyperName}";
                
        /**
         * Class ${generatedClassName} implements the typer generated from, if present, the typer definition,
         * otherwise this class implements the default typer.
         */
        export class ${generatedClassName} implements ${typerInterfaceName} {
            private generatedTyper: ${defaultTyperName};
        
            constructor() {
                this.generatedTyper = new ${defaultTyperName}();
                this.generatedTyper.mainTyper = this;
            }
                        
            /**
             * Returns true if 'modelelement' is marked as 'isType' in the Typer definition
             * @param modelelement
             */    
            public isType(modelelement: PiElement): boolean { 
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
            public inferType(modelelement: PiElement): PiType {
                for (const typer of projectitConfiguration.customTypers) {
                    typer.mainTyper = this;
                    let result: PiType = typer.inferType(modelelement);
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
            public equalsType(elem1: PiElement, elem2: PiElement): boolean {
                if (!elem1 || !elem2) return false;

                const $type1: PiType = this.inferType(elem1);
                const $type2: PiType = this.inferType(elem2);
                if (!$type1 || !$type2) return false;
                
                return this.equals($type1, $type2);
            }
            
             /**
             * Returns true if type1 equals type2.
             * This is a strict equal.
             * @param type1
             * @param type2
             */
            public equals(type1: PiType, type2: PiType): boolean {
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
            public conformsType(elem1: PiElement, elem2: PiElement): boolean {
                if (!elem1 || !elem2) return false;
        
                const $type1: PiType = this.inferType(elem1);
                const $type2: PiType = this.inferType(elem2);
                if (!$type1 || !$type2) return false;
        
                return this.conforms($type1, $type2);
            }
            
            /**
             * Returns true if type1 conforms to type2. The direction is type1 conforms to type2.
             * @param type1
             * @param type2
             */
            public conforms(type1: PiType, type2: PiType): boolean {
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
            public conformsListType(elemlist1: PiElement[], elemlist2: PiElement[]): boolean {
                if (!elemlist1 || !elemlist2) return false;
                if (elemlist1.length !== elemlist2.length) return false;
        
                const $typelist1: PiType[] = this.elementListToTypeList(elemlist1);
                const $typelist2: PiType[] = this.elementListToTypeList(elemlist2);
                if ($typelist1.length === 0 || $typelist2.length === 0) return false;
                if ($typelist1.length !== $typelist2.length) return false;
        
                return this.conformsList($typelist1, $typelist2);
            }

            /**
             * Returns true if all types in typelist1 conform to the types in typelist2, pairwise, in the given order.
             * @param typelist1
             * @param typelist2
             */
            public conformsList(typelist1: PiType[], typelist2: PiType[]): boolean {
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
            public commonSuperType(elemlist: PiElement[]): PiType {
                if (!elemlist ) return null;
                if (elemlist.length === 0 ) return null;
        
                const $typelist: PiType[] = this.elementListToTypeList(elemlist);
                if ($typelist.length === 0) return null;
        
                return this.commonSuper($typelist);
            }
        
            /**
             * Returns the common super type of all types in typelist
             * @param typelist
             */
            public commonSuper(typelist: PiType[]): PiType {
                for (const typer of projectitConfiguration.customTypers) {
                    typer.mainTyper = this;
                    let result: PiType = typer.commonSuper(typelist);
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
            public getSuperTypes(type: PiType): PiType[] {
                for (const typer of projectitConfiguration.customTypers) {
                    typer.mainTyper = this;
                    let result: PiType[] = typer.getSuperTypes(type);
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
            private elementListToTypeList(inlist: PiElement[]): PiType[] {
                const typelist: PiType[] = [];
                for (const elem of inlist) {
                    this.addIfNotPresent(typelist, this.inferType(elem));
                }
                return typelist;
            }
            
            private addIfNotPresent<T>(list: T[], addition: T) {
                if (!!addition && !list.includes(addition)) {
                    list.push(addition);
                }
            }
            
        }`;
    }

    generateGenIndex(language: PiLanguage): string {
        return `
        export * from "./${Names.typer(language)}";
        export * from "./${Names.typerPart(language)}";
        `;
    }

    generateIndex(language: PiLanguage): string {
        return `
        export * from "./${Names.customTyper(language)}";
        `;
    }
}
