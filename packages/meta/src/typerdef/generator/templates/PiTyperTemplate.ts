import { Names, PROJECTITCORE, LANGUAGE_GEN_FOLDER, CONFIGURATION_FOLDER } from "../../../utils";
import { PiLanguage } from "../../../languagedef/metalanguage";
import { PiTypeDefinition } from "../../metalanguage";

export class PiTyperTemplate {
    language: PiLanguage;

    generateTyper(language: PiLanguage, typerdef: PiTypeDefinition, relativePath: string): string {
        this.language = language;
        const allLangConcepts: string = Names.allConcepts(language);
        let rootType: string = allLangConcepts;
        if (typerdef) {
            rootType = typerdef.typeroot.name;
        }
        const generatedClassName: string = Names.typer(language);
        const defaultTyperName: string = Names.typerPart(language);
        const typerInterfaceName: string = Names.PiTyper;

        // Template starts here
        return `
        import { ${typerInterfaceName} } from "${PROJECTITCORE}";
        ${ rootType !== allLangConcepts ?
        `import { ${allLangConcepts}, ${rootType} } from "${relativePath}${LANGUAGE_GEN_FOLDER}";`
        : 
        `import { ${allLangConcepts} } from "${relativePath}${LANGUAGE_GEN_FOLDER}";`
        }      
        import { projectitConfiguration } from "${relativePath}${CONFIGURATION_FOLDER}/${Names.configuration()}";
        import { ${defaultTyperName} } from "./${defaultTyperName}";
                
        /**
         * Class ${generatedClassName} implements the typer generated from, if present, the typer definition,
         * otherwise this class implements the default typer.
         */
        export class ${generatedClassName} implements ${typerInterfaceName} {

            /**
             * See interface 
             */
            public equalsType(elem1: ${allLangConcepts}, elem2: ${allLangConcepts}): boolean {
                for (const typer of projectitConfiguration.customTypers) {
                    let result: boolean = typer.equalsType(elem1, elem2);
                    if (result !== null) {
                        return result;
                    }
                }
                // no result from custom typers => use the generated typer
                return new ${defaultTyperName}().equalsType(elem1, elem2);
            }
            
            /**
             * See interface 
             */        
            public inferType(modelelement: ${allLangConcepts}): ${rootType} {
                for (const typer of projectitConfiguration.customTypers) {
                    let result: ${rootType} = typer.inferType(modelelement) as ${rootType};
                    if (result !== null) {
                        return result;
                    }
                }
                // no result from custom typers => use the generated typer
                return new ${defaultTyperName}().inferType(modelelement);
            }
            
            /**
             * See interface 
             */
            public conformsTo(elem1: ${rootType}, elem2: ${rootType}): boolean {
                for (const typer of projectitConfiguration.customTypers) {
                    let result: boolean = typer.conformsTo(elem1, elem2);
                    if (result !== null) {
                        return result;
                    }
                }
                // no result from custom typers => use the generated typer
                return new ${defaultTyperName}().conformsTo(elem1, elem2);
            }
            
            /**
             * See interface 
             */
            public conformList(typelist1: ${rootType}[], typelist2: ${rootType}[]): boolean {
                for (const typer of projectitConfiguration.customTypers) {
                    let result: boolean = typer.conformList(typelist1, typelist2);
                    if (result !== null) {
                        return result;
                    }
                }
                // no result from custom typers => use the generated typer
                return new ${defaultTyperName}().conformList(typelist1, typelist2);
            }

            /**
             * See interface 
             */        
            public isType(elem: ${allLangConcepts}): boolean { // entries for all types marked as @isType
                for (const typer of projectitConfiguration.customTypers) {
                    let result: boolean = typer.isType(elem);
                    if (result) {
                        return result;
                    }
                }
                // no result from custom typers => use the generated typer
                return new ${defaultTyperName}().isType(elem);
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
