import { FreLanguage } from "../../../languagedef/metalanguage";
import { Names, PROJECTITCORE, TYPER_GEN_FOLDER } from "../../../utils";

export class FreCustomTyperPartTemplate {
    generateCustomTyperPart(language: FreLanguage, relativePath: string): string {
        // const allLangConcepts: string = Names.allConcepts(language);
        const typerInterfaceName: string = Names.FreTyperPart;
        const generatedClassName: string = Names.customTyper(language);

        // TODO add comments to generated class
        // todo remove commented statements
        // Template starts here
        return `
        import { ${Names.FreNode}, ${Names.FreType}, FreTyper } from "${PROJECTITCORE}";
        
        /**
         * Class '${generatedClassName}' is meant to be a convient place to add any
         * custom code for type checking.
         */
        export class ${generatedClassName} implements ${typerInterfaceName} {
            mainTyper: FreTyper;
        
            isType(modelelement: ${Names.FreNode}): boolean | null {
                return null;
            }
        
            inferType(modelelement: ${Names.FreNode}): ${Names.FreType} | null {
                return null;
            }
        
            equals(type1: ${Names.FreType}, type2: ${Names.FreType}): boolean | null {
                return null;
            }
        
            conforms(type1: ${Names.FreType}, type2: ${Names.FreType}): boolean | null {
                return null;
            }
               
            conformsList(typelist1: ${Names.FreType}[], typelist2: ${Names.FreType}[]): boolean | null {
                return null;
            }
        
            commonSuper(typelist: ${Names.FreType}[]): ${Names.FreType} | null {
                return null;
            }    
            
            public getSuperTypes(type: ${Names.FreType}): ${Names.FreType}[] | null {
                return null;
            } 
        }`;
    }
}
