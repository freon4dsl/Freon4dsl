import { FreMetaLanguage } from "../../../languagedef/metalanguage/index.js";
import { Names, FREON_CORE } from "../../../utils/index.js";

export class FreCustomTyperPartTemplate {
    generateCustomTyperPart(language: FreMetaLanguage): string {
        // const allLangConcepts: string = Names.allConcepts(language);
        const typerInterfaceName: string = Names.FreTyperPart;
        const generatedClassName: string = Names.customTyper(language);

        // TODO add comments to generated class
        // todo remove commented statements
        // Template starts here
        return `
        import { ${Names.FreNode}, ${Names.FreType}, FreTyper } from "${FREON_CORE}";

        /**
         * Class '${generatedClassName}' is meant to be a convenient place to add any
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
