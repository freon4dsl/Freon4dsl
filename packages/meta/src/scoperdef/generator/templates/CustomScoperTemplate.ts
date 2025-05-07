import { FreMetaLanguage } from "../../../languagedef/metalanguage/index.js";
import { Names, FREON_CORE } from "../../../utils/index.js";

export class CustomScoperTemplate {
    generateCustomScoperPart(language: FreMetaLanguage): string {
        const scoperInterfaceName: string = Names.FrScoperPart;
        const generatedClassName: string = Names.customScoper(language);

        // Template starts here
        return `
        import { ${Names.FreNode}, ${Names.FreNamedNode}, ${Names.FrScoperPart}, ${Names.FreScoperComposite}, ${Names.FreNamespace} } from "${FREON_CORE}";

        /**
         * Class '${generatedClassName}' is meant to be a convenient place to add any
         * custom code for scoping.
         */
        export class ${generatedClassName} implements ${scoperInterfaceName} {
            mainScoper: ${Names.FreScoperComposite};

            /**
             * Returns the element to which the 'pathname' refers. If the element cannot be found, or if the element is
             * not visible (private) from the location of 'modelelement', then null is returned.
             * If present, then the search is limited to elements which type is 'metatype'.
             * If this scoper does not handle the scope for 'modelelement' 'undefined' is returned.
             *
             * @param node: the containing element, where 'pathname' should be visible
             * @param doNotSearch: the role or property name of the element that we are searching for
             * @param pathname: the name or series of names of the element that we are searching for
             * @param metatype: the metatype of the element that we are searching for
             */
            resolvePathName(node: ${Names.FreNode}, doNotSearch: string, pathname: string[], metatype?: string): ${Names.FreNamedNode} {
                return undefined;
            }

            /**
             *   Returns true if 'name' is known in the namespace containing 'node' or one
             *   of its surrounding namespaces.
             *   If this scoper does not handle the scope for 'node' 'undefined' is returned.     *
             *
             *   When parameter 'metatype' is present, it returns true if the element named 'name'
             *   is an instance of 'metatype'. There is no default setting for this parameter.
             *
             *   When parameter 'excludeSurrounding' is present, it returns true if the element named 'name'
             *   is known in the namespace containing 'modelelement', without looking in surrounding namespaces.
             *
             * @param node
             * @param name
             * @param metatype
             * @param excludeSurrounding
             */
            isInScope(node: ${Names.FreNode}, name: string, metatype?: string, excludeSurrounding?: boolean): boolean {
                return undefined;
            }

            /**
             *   Returns all elements that are visible in the namespace containing 'node' or one
             *   of its surrounding namespaces.
             *
             *   When parameter 'metatype' is present, it returns all elements that are an instance of 'metatype'.
             *   There is no default setting for this parameter.
             *
             *   When parameter 'excludeSurrounding' is present, it returns all elements that are visible in
             *   the namespace containing 'node', without looking in surrounding namespaces. Elements in
             *   surrounding namespaces are normally shadowed by elements with the same name in an inner namespace.
             *
             * @param node
             * @param metatype
             * @param excludeSurrounding
             */
            getVisibleElements(node: ${Names.FreNode}, metatype?: string, excludeSurrounding?: boolean): ${Names.FreNamedNode}[] {
                return undefined;
            }

            /**
             *   Returns the element named 'name' which is visible in the namespace containing 'node' or one
             *   of its surrounding namespaces.
             *
             *   When parameter 'metatype' is present, it returns the element that is an instance of 'metatype'.
             *   There is no default setting for this parameter.
             *
             *   When parameter 'excludeSurrounding' is present, it returns the element that is visible in
             *   the namespace containing 'node', without looking in surrounding namespaces. Elements in
             *   surrounding namespaces are normally shadowed by elements with the same name in an inner namespace.
             *
             * @param node
             * @param name
             * @param metatype
             * @param excludeSurrounding
             */
            getFromVisibleElements(node: ${Names.FreNode}, name: string, metatype?: string, excludeSurrounding?: boolean): ${Names.FreNamedNode} {
                return undefined;
            }
    
            /**
             *   Does the same as getVisibleElements, only it does not return the elements,
             *   but the names of the elements.
             *
             * @param node
             * @param metatype
             * @param excludeSurrounding
             */
            getVisibleNames(node: ${Names.FreNode}, metatype?: string, excludeSurrounding?: boolean): string[] {
                return undefined;
            }

            /**
            * Returns all ${Names.FreNode}s that are defined as additional namespaces for 'node'.
            * @param node
            */
            additionalNamespaces(element: ${Names.FreNode}): ${Names.FreNode}[] {
                return undefined;
            }

            /**
             * Returns the alternative namespace that can be found for 'node'.
             * @param node
             */
            getAlternativeScope(node: ${Names.FreNode}): ${Names.FreNamespace} {
                return undefined;
            }

            /**
             * Returns true if an alternative namespace can be found for 'node'.
             * @param node
             */
            hasAlternativeScope(node: ${Names.FreNode}): boolean {
                return false;
            }
        }`;
    }
}
