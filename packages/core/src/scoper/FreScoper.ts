import { FreNode, FreNamedNode, FreNodeReference } from '../ast/index.js';
import { FreCompositeScoper } from "./FreCompositeScoper.js";
import { FreNamespace } from './FreNamespace.js';

// Part of the Freon Framework

export interface FreScoper {
    mainScoper: FreCompositeScoper;

    /**
     *   Returns all elements that are visible in the namespace containing 'node'.
     *
     *   When parameter 'metatype' is present, it returns all elements that are an instance of 'metatype'.
     *   There is no default setting for this parameter.
     *
     *   When parameter 'excludeSurrounding' is present, it returns all elements that are visible in
     *   the namespace containing 'node', without looking in surrounding namespaces.
     *
     * @param node
     * @param metatype
     * @param excludeSurrounding
     */
    // todo remove excludeSurrounding
    getVisibleNodes(node: FreNode, metatype?: string, excludeSurrounding?: boolean): FreNamedNode[];

    /**
     * Returns all FreNamespaces that are defined as additional namespaces for 'node', if 'node' is a namespace.
     * @param node
     */
    additionalNamespaces(node: FreNode): (FreNode | FreNodeReference<FreNamedNode>)[];

    /**
     * Returns the replacement namespace if it can be found for 'node'.
     * @param node
     */
    replacementNamespace(node: FreNode): FreNamespace | undefined;
}
