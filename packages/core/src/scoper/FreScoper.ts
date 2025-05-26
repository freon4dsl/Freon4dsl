import { FreNode, FreNamedNode, FreNodeReference } from '../ast/index.js';
import { FreCompositeScoper } from "./FreCompositeScoper.js";

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
     */
    getVisibleNodes(node: FreNode, metatype?: string): FreNamedNode[];

    /**
     * Returns todo
     * @param node
     */
    additionalNamespaces(node: FreNode): (FreNamedNode | FreNodeReference<FreNamedNode>)[];

    /**
     * Returns todo
     * @param node
     */
    replacementNamespaces(node: FreNode): (FreNamedNode | FreNodeReference<FreNamedNode>)[];
}
