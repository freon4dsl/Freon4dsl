import { PiElement, PiNamedElement } from "../language";

// Part of the ProjectIt Framework

// tag::scoper-interface[]
export interface PiScoper {

    /**
     * Returns the element to which the 'pathname' refers. If the elment cannot be found, or if the element is
     * not visible (private) from the location of 'modelelement', then null is returned.
     * If present, then the search is limited to elements which type is 'metatype'.
     *
     * @param modelelement
     * @param pathname
     * @param metatype
     */
    resolvePathName(modelelement: PiElement, pathname: string[], metatype?: string): PiNamedElement;

    /**
     *   Returns true if 'name' is known in the namespace containing 'modelelement' or one
     *   of its surrounding namespaces.
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
    isInScope(modelElement: PiElement, name: string, metatype?: string, excludeSurrounding?: boolean): boolean;

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
    getVisibleElements(modelelement: PiElement, metatype?: string, excludeSurrounding?: boolean): PiNamedElement[];

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
    getFromVisibleElements(modelelement: PiElement, name: string, metatype?: string, excludeSurrounding?: boolean): PiNamedElement;

    /**
     *   Does the same as getVisibleElements, only it does not return the elements,
     *   but the names of the elements.
     *
     * @param modelelement
     * @param metatype
     * @param excludeSurrounding
     */
    getVisibleNames(modelelement: PiElement, metatype?: string, excludeSurrounding?: boolean): string[];
}
// end::scoper-interface[]
