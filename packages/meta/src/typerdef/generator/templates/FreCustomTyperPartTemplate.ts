import { FreMetaLanguage } from "../../../languagedef/metalanguage/index.js";
import { Names, Imports } from "../../../utils/on-lang/index.js"

export class FreCustomTyperPartTemplate {
    generateCustomTyperPart(language: FreMetaLanguage): string {
        // const allLangConcepts: string = Names.allConcepts(language);
        const typerInterfaceName: string = Names.FreTyper;
        const generatedClassName: string = Names.customTyper(language);
        const imports = new Imports()
        imports.core = new Set<string>([
            Names.FreNode, Names.FreType, Names.FreTyper
        ])

        // TODO add comments to generated class
        // todo remove commented statements
        // Template starts here
        return `
        // TEMPLATE: FreCustomTyperPartTemplate,generateCustomTyperPart(...)
        ${imports.makeImports(language)}

        /**
         * Class '${generatedClassName}' is meant to be a convenient place to add any
         * custom code for type checking.
         */
        export class ${generatedClassName} implements ${typerInterfaceName} {
            mainTyper: FreTyper;

            isType(node: ${Names.FreNode}): boolean | null {
                return null;
            }

            inferType(node: ${Names.FreNode}): ${Names.FreType} | null {
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
