import { PiLanguage } from "../../../languagedef/metalanguage";
import { LANGUAGE_GEN_FOLDER, Names, PROJECTITCORE, TYPER_GEN_FOLDER } from "../../../utils";

export class CustomTyperPartTemplate {
    generateCustomTyperPart(language: PiLanguage, relativePath: string): string {
        const allLangConcepts: string = Names.allConcepts(language);
        const typerInterfaceName: string = Names.PiTyperPart;
        const generatedClassName: string = Names.customTyper(language);

        // Template starts here
        return `
        import { ${typerInterfaceName} } from "${PROJECTITCORE}";
        import { ${allLangConcepts} } from "${relativePath}${LANGUAGE_GEN_FOLDER}";
        import { ${Names.typer(language)} } from "${relativePath}${TYPER_GEN_FOLDER}/${Names.typer(language)}";
        
        /**
         * Class '${generatedClassName}' is meant to be a convient place to add any
         * custom code for type checking.
         */
        export class ${generatedClassName} implements ${typerInterfaceName} {
            mainTyper: ${Names.typer(language)};
        
            /**
             * See interface 
             */
            public inferType(modelelement: ${allLangConcepts}): ${allLangConcepts} | null {
                return null;
            }
            /**
             * See interface 
             */
            public equalsType(elem1: ${allLangConcepts}, elem2: ${allLangConcepts}): boolean | null {
                return null;
            }
            /**
             * See interface 
             */
            public conformsTo(elem1: ${allLangConcepts}, elem2: ${allLangConcepts}): boolean | null {
                return null;
            }
            /**
             * See interface 
             */
            public conformList(typelist1: ${allLangConcepts}[], typelist2: ${allLangConcepts}[]): boolean | null {
                return null;
            }
            /**
             * See interface 
             */
            public isType(elem: ${allLangConcepts}): boolean | null {
                return null;
            }      
        }`;
    }
}
