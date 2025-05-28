import { FreMetaLanguage } from "../../../languagedef/metalanguage/index.js";
import { Names, Imports } from "../../../utils/index.js"

export class CustomScoperTemplate {
    generateCustomScoperPart(language: FreMetaLanguage): string {
        const imports = new Imports()
        imports.core = new Set([Names.FreNode, Names.FreNamedNode, Names.FreNodeReference, Names.FreScoperPart, Names.FreCompositeScoper])

        // Template starts here
        return `
        ${imports.makeImports(language)}

        /**
         * Class '${Names.customScoper(language)}' is meant to be a convenient place to add any
         * custom code for scoping.
         */
        export class ${Names.customScoper(language)} implements ${Names.FreScoperPart} {
            mainScoper: ${Names.FreCompositeScoper};

            /**
             *   Returns all elements that are visible in the namespace containing '_node'. Note that '_node' can 
             *   be any node in the AST, not only namespaces!
             *
             *   When parameter '_metaType' is present, it returns all elements that are an instance of '_metaType'.
             *   There is no default setting for this parameter.
             *
             * @param _node
             * @param _metaType
             */
            getVisibleNodes(_node: ${Names.FreNode}, _metaType?: string): ${Names.FreNamedNode}[] {
                return [];
            }

            /**
             * Returns all nodes and/or node references that represent namespaces which should be added to the namespace
             * represented by '_node'.
             *
             * @param _node
             */
            additionalNamespaces(_node: ${Names.FreNode}): (${Names.FreNode} | ${Names.FreNodeReference}<${Names.FreNamedNode}>)[] {
                return [];
            }

            /**
             * Returns all nodes and/or node references that represent namespaces which should be used to replace
             * the parent namespace of the namespace represented by '_node'.
             * 
             * @param _node
             */
            public replacementNamespaces(_node: ${Names.FreNode}): (${Names.FreNode} | ${Names.FreNodeReference}<${Names.FreNamedNode}>)[]  {
                return [];
            }
        }`;
    }
}
