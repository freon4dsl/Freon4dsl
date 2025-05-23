import { FreMetaLanguage } from "../../../languagedef/metalanguage/index.js";
import { Names, Imports } from "../../../utils/index.js"

export class CustomScoperTemplate {
    generateCustomScoperPart(language: FreMetaLanguage): string {
        const scoperInterfaceName: string = Names.FreScoperPart;
        const generatedClassName: string = Names.customScoper(language);
        const imports = new Imports()
        imports.core = new Set([Names.FreNode, Names.FreNamedNode, Names.FreNodeReference, Names.FreNamespace, Names.FreScoperPart, Names.FreCompositeScoper])

        // Template starts here
        return `
        ${imports.makeImports(language)}

        /**
         * Class '${generatedClassName}' is meant to be a convenient place to add any
         * custom code for scoping.
         */
        export class ${generatedClassName} implements ${scoperInterfaceName} {
            mainScoper: ${Names.FreCompositeScoper};

            /**
             *   Returns all elements that are visible in the namespace containing '_node' or one
             *   of its surrounding namespaces.
             *
             *   When parameter '_metatype' is present, it returns all elements that are an instance of '_metatype'.
             *   There is no default setting for this parameter.
             *
             *   When parameter '_excludeSurrounding' is present, it returns all elements that are visible in
             *   the namespace containing '_node', without looking in surrounding namespaces. Elements in
             *   surrounding namespaces are normally shadowed by elements with the same name in an inner namespace.
             *
             * @param _node
             * @param _metatype
             * @param _excludeSurrounding
             */
            getVisibleNodes(_node: ${Names.FreNode}, _metatype?: string, _excludeSurrounding?: boolean): ${Names.FreNamedNode}[] {
                return undefined;
            }

            /**
            * Returns all ${Names.FreNode}s that are defined as additional namespaces for '_node'.
            * @param _node
            */
            additionalNamespaces(_node: ${Names.FreNode}): ${Names.FreNode}[] {
                return undefined;
            }

            /**
             * Returns the replacement namespace that can be found for '_node'.
             * @param _node
             */
            replacementNamespace(_node: ${Names.FreNode}): ${Names.FreNamespace} | undefined {
                return undefined;
            }
        }`;
    }
}
