import { FreNode, FreNamedNode } from '../ast/index.js';
import { FreCompositeScoper } from "./FreCompositeScoper.js";
import { FreNamespace } from './FreNamespace.js';

// Part of the Freon Framework

export interface FreScoper {
    mainScoper: FreCompositeScoper;

    /**
     * Returns the element to which the 'pathname' refers. If the element cannot be found, or if the element is
     * not visible (private) from the location of 'modelelement', then null is returned.
     * If present, then the search is limited to elements which type is 'metatype'.
     * If this scoper does not handle the scope for 'modelelement' 'undefined' is returned.
     *
     * @param node          the containing element, where 'pathname' should be visible
     * @param doNotSearch   the element that we are trying to resolve
     * @param pathname      the name or series of names of the element that we are searching for
     * @param metatype      the metatype of the element that we are searching for
     */
    // resolvePathName(node: FreNode, doNotSearch: FreNodeReference<FreNamedNode>, pathname: string[], metatype?: string): FreNamedNode;

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
    getVisibleNodes(node: FreNode, metatype?: string, excludeSurrounding?: boolean): FreNamedNode[];

    /**
     * Returns all FreNodes that are defined as additional namespaces for 'node'.
     * @param node
     */
    additionalNamespaces(node: FreNode): FreNode[];

    /**
     * Returns the replacement namespace if it can be found for 'node'.
     * @param node
     */
    replacementNamespace(node: FreNode): FreNamespace | undefined;
}
