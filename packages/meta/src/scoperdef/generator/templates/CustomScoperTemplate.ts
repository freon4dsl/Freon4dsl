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
             * If present, then the search is limited to elements which type is '_metatype'.
             * If this scoper does not handle the scope for 'modelelement' 'undefined' is returned.
             *
             * @param _node         the containing element, where 'pathname' should be visible
             * @param _doNotSearch  the role or property _name of the element that we are searching for
             * @param _pathname     the name or series of names of the element that we are searching for
             * @param _metatype     the _metatype of the element that we are searching for
             */
            resolvePathName(_node: ${Names.FreNode}, _doNotSearch: string, _pathname: string[], _metatype?: string): ${Names.FreNamedNode} {
                return undefined;
            }

            /**
             *   Returns true if '_name' is known in the namespace containing '_node' or one
             *   of its surrounding namespaces.
             *   If this scoper does not handle the scope for '_node' 'undefined' is returned.     *
             *
             *   When parameter '_metatype' is present, it returns true if the element named '_name'
             *   is an instance of '_metatype'. There is no default setting for this parameter.
             *
             *   When parameter '_excludeSurrounding' is present, it returns true if the element named '_name'
             *   is known in the namespace containing 'modelelement', without looking in surrounding namespaces.
             *
             * @param _node
             * @param _name
             * @param _metatype
             * @param _excludeSurrounding
             */
            isInScope(_node: ${Names.FreNode}, _name: string, _metatype?: string, _excludeSurrounding?: boolean): boolean {
                return undefined;
            }

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
            getVisibleElements(_node: ${Names.FreNode}, _metatype?: string, _excludeSurrounding?: boolean): ${Names.FreNamedNode}[] {
                return undefined;
            }

            /**
             *   Returns the element named '_name' which is visible in the namespace containing '_node' or one
             *   of its surrounding namespaces.
             *
             *   When parameter '_metatype' is present, it returns the element that is an instance of '_metatype'.
             *   There is no default setting for this parameter.
             *
             *   When parameter '_excludeSurrounding' is present, it returns the element that is visible in
             *   the namespace containing '_node', without looking in surrounding namespaces. Elements in
             *   surrounding namespaces are normally shadowed by elements with the same name in an inner namespace.
             *
             * @param _node
             * @param _name
             * @param _metatype
             * @param _excludeSurrounding
             */
            getFromVisibleElements(_node: ${Names.FreNode}, _name: string, _metatype?: string, _excludeSurrounding?: boolean): ${Names.FreNamedNode} {
                return undefined;
            }
    
            /**
             *   Does the same as getVisibleElements, only it does not return the elements,
             *   but the names of the elements.
             *
             * @param _node
             * @param _metatype
             * @param _excludeSurrounding
             */
            getVisibleNames(_node: ${Names.FreNode}, _metatype?: string, _excludeSurrounding?: boolean): string[] {
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
