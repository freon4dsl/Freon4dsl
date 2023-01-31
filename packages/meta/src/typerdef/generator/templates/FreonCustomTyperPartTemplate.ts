import { PiLanguage } from "../../../languagedef/metalanguage";
import { Names, PROJECTITCORE, TYPER_GEN_FOLDER } from "../../../utils";

export class FreonCustomTyperPartTemplate {
    generateCustomTyperPart(language: PiLanguage, relativePath: string): string {
        // const allLangConcepts: string = Names.allConcepts(language);
        const typerInterfaceName: string = Names.FreonTyperPart;
        const generatedClassName: string = Names.customTyper(language);

        // TODO add comments to generated class
        // todo remove commented statements
        // Template starts here
        return `
        import { ${Names.PiElement}, ${Names.PiType}, FreTyper } from "${PROJECTITCORE}";
        
        /**
         * Class '${generatedClassName}' is meant to be a convient place to add any
         * custom code for type checking.
         */
        export class ${generatedClassName} implements ${typerInterfaceName} {
            mainTyper: FreTyper; // ${Names.typer(language)};
        
            isType(modelelement: ${Names.PiElement}): boolean | null {
                return null;
            }
        
            inferType(modelelement: ${Names.PiElement}): ${Names.PiType} | null {
                return null;
            }
        
            equals(type1: ${Names.PiType}, type2: ${Names.PiType}): boolean | null {
                return null;
            }
        
            conforms(type1: ${Names.PiType}, type2: ${Names.PiType}): boolean | null {
                return null;
            }
               
            conformsList(typelist1: ${Names.PiType}[], typelist2: ${Names.PiType}[]): boolean | null {
                return null;
            }
        
            commonSuper(typelist: ${Names.PiType}[]): ${Names.PiType} | null {
                return null;
            }    
            
            public getSuperTypes(type: ${Names.PiType}): ${Names.PiType}[] | null {
                return null;
            } 
        }`;
    }
}
