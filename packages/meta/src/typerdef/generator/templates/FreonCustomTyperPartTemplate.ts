import { PiLanguage } from "../../../languagedef/metalanguage";
import { Names, PROJECTITCORE, TYPER_GEN_FOLDER } from "../../../utils";

export class FreonCustomTyperPartTemplate {
    generateCustomTyperPart(language: PiLanguage, relativePath: string): string {
        // const allLangConcepts: string = Names.allConcepts(language);
        const typerInterfaceName: string = Names.PiTyperPart;
        const generatedClassName: string = Names.customTyper(language);

        // TODO add comments to generated class
        // Template starts here
        return `
        import { PiElement, PiType, PiTyper, PiTyperPart } from "${PROJECTITCORE}";
        import { ${Names.typer(language)} } from "${relativePath}${TYPER_GEN_FOLDER}/${Names.typer(language)}";
        
        /**
         * Class '${generatedClassName}' is meant to be a convient place to add any
         * custom code for type checking.
         */
        export class ${generatedClassName} implements ${typerInterfaceName} {
            mainTyper: ${Names.typer(language)};
        
            isType(elem: PiElement): boolean | null {
                return null;
            }
        
            inferType(modelelement: PiElement): PiType | null {
                return null;
            }
        
            equals(type1: PiType, type2: PiType): boolean | null {
                return null;
            }
        
            conforms(type1: PiType, type2: PiType): boolean | null {
                return null;
            }
               
            conformsList(typelist1: PiType[], typelist2: PiType[]): boolean | null {
                return null;
            }
        
            commonSuper(typelist: PiType[]): PiType | null {
                return null;
            }    
            
            public getSuperTypes(type: PiType): PiType[] | null {
                return null;
            } 
        }`;
    }
}
