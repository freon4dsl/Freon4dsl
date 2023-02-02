import { FreNode, FreNamedNode } from "../ast";
import { FreScoperComposite } from "./FreScoperComposite";

// Part of the Freon Framework

export interface FreScoper {
    mainScoper: FreScoperComposite;
    
    /**
     * Returns the element to which the 'pathname' refers. If the element cannot be found, or if the element is
     * not visible (private) from the location of 'modelelement', then null is returned.
     * If present, then the search is limited to elements which type is 'metatype'.
     * If this scoper does not handle the scope for 'modelelement' 'undefined' is returned.
     *
     * @param modelelement: the containing element, where 'pathname' should be visible
     * @param doNotSearch: the role or property name of the element that we are searching for
     * @param pathname: the name or series of names of the element that we are searching for
     * @param metatype: the metatype of the element that we are searching for
     */
    resolvePathName(modelelement: FreNode, doNotSearch: string, pathname: string[], metatype?: string): FreNamedNode;

    /**
     *   Returns true if 'name' is known in the namespace containing 'modelelement' or one
     *   of its surrounding namespaces.
     *   If this scoper does not handle the scope for 'modelelement' 'undefined' is returned.     *
     *
     *   When parameter 'metatype' is present, it returns true if the element named 'name'
     *   is an instance of 'metatype'. There is no default setting for this parameter.
     *
     *   When parameter 'excludeSurrounding' is present, it returns true if the element named 'name'
     *   is known in the namespace containing 'modelelement', without looking in surrounding namespaces.
     *
     * @param modelElement
     * @param name
     * @param metatype
     * @param excludeSurrounding
     */
    isInScope(modelElement: FreNode, name: string, metatype?: string, excludeSurrounding?: boolean): boolean;

    /**
     *   Returns all elements that are visible in the namespace containing 'modelelement' or one
     *   of its surrounding namespaces.
     *
     *   When parameter 'metatype' is present, it returns all elements that are an instance of 'metatype'.
     *   There is no default setting for this parameter.
     *
     *   When parameter 'excludeSurrounding' is present, it returns all elements that are visible in
     *   the namespace containing 'modelelement', without looking in surrounding namespaces. Elements in
     *   surrounding namespaces are normally shadowed by elements with the same name in an inner namespace.
     *
     * @param modelelement
     * @param metatype
     * @param excludeSurrounding
     */
    getVisibleElements(modelelement: FreNode, metatype?: string, excludeSurrounding?: boolean): FreNamedNode[];

    /**
     *   Returns the element named 'name' which is visible in the namespace containing 'modelelement' or one
     *   of its surrounding namespaces.
     *
     *   When parameter 'metatype' is present, it returns the element that is an instance of 'metatype'.
     *   There is no default setting for this parameter.
     *
     *   When parameter 'excludeSurrounding' is present, it returns the element that is visible in
     *   the namespace containing 'modelelement', without looking in surrounding namespaces. Elements in
     *   surrounding namespaces are normally shadowed by elements with the same name in an inner namespace.
     *
     * @param modelelement
     * @param name
     * @param metatype
     * @param excludeSurrounding
     */
    getFromVisibleElements(modelelement: FreNode, name: string, metatype?: string, excludeSurrounding?: boolean): FreNamedNode;

    /**
     *   Does the same as getVisibleElements, only it does not return the elements,
     *   but the names of the elements.
     *
     * @param modelelement
     * @param metatype
     * @param excludeSurrounding
     */
    getVisibleNames(modelelement: FreNode, metatype?: string, excludeSurrounding?: boolean): string[];

    /**
     * Returns all FreNodes that are defined as additional namespaces for `element'.
     * @param element
     */
    additionalNamespaces(element: FreNode): FreNode[];
}
