import { FreNode, FreNamedNode, FreNodeReference } from '../ast/index.js';
import { FreCompositeScoper } from "./FreCompositeScoper.js";

// Part of the Freon Framework

export interface FreScoper {
    mainScoper: FreCompositeScoper;

    /**
     *   Returns all elements that are visible in the namespace containing 'node'. Note that 'node' can 
     *   be any node in the AST, not only namespaces!
     *
     *   When parameter 'metaType' is present, it returns all elements that are an instance of 'metaType'.
     *   There is no default setting for this parameter.
     *
     *   When parameter 'excludeSurrounding' is present, it returns all elements that are visible in
     *   the namespace containing 'node', without looking in surrounding namespaces.
     *
     * @param node
     * @param metaType
     */
    getVisibleNodes(node: FreNode, metaType?: string): FreNamedNode[];

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
