import { FreMetaLanguage } from "../../../languagedef/metalanguage/index.js";
import { Names, Imports } from "../../../utils/index.js"

export class CustomScoperTemplate {
    generateCustomScoperPart(language: FreMetaLanguage): string {
        const scoperInterfaceName: string = Names.FrScoperPart;
        const generatedClassName: string = Names.customScoper(language);
        const imports = new Imports()
        imports.core = new Set([Names.FreNode, Names.FreNamedNode, Names.FrScoperPart, Names.FreScoperComposite])

        // Template starts here
        return `
        ${imports.makeImports(language)}

        /**
         * Class '${generatedClassName}' is meant to be a convenient place to add any
         * custom code for scoping.
         */
        export class ${generatedClassName} implements ${scoperInterfaceName} {
            mainScoper: ${Names.FreScoperComposite};

            resolvePathName(node: ${Names.FreNode}, doNotSearch: string, pathname: string[], metatype?: string): ${Names.FreNamedNode} {
                return undefined;
            }

            isInScope(node: ${Names.FreNode}, name: string, metatype?: string, excludeSurrounding?: boolean): boolean {
                return undefined;
            }

            getVisibleElements(node: ${Names.FreNode}, metatype?: string, excludeSurrounding?: boolean): ${Names.FreNamedNode}[] {
                return undefined;
            }

            getFromVisibleElements(node: ${Names.FreNode}, name: string, metatype?: string, excludeSurrounding?: boolean): ${Names.FreNamedNode} {
                return undefined;
            }

            getVisibleNames(node: ${Names.FreNode}, metatype?: string, excludeSurrounding?: boolean): string[] {
                return undefined;
            }

            additionalNamespaces(element: ${Names.FreNode}): ${Names.FreNode}[] {
                return undefined;
            }
        }`;
    }
}
