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
     * @param node
     * @param metaType
     */
    // todo should the param type be 'FreNode | FreNodeReference<FreNamedNode>'?
    getVisibleNodes(node: FreNode, metaType?: string): FreNamedNode[];

    /**
     * Returns all nodes and/or node references that represent namespaces which should be added to the namespace
     * represented by 'node'.
     *
     * @param node
     */
    additionalNamespaces(node: FreNode): (FreNode | FreNodeReference<FreNamedNode>)[];

    /**
     * Returns all nodes and/or node references that represent namespaces which should be used to replace
     * the parent namespace of the namespace represented by 'node'.
     *
     * @param node
     */
    replacementNamespaces(node: FreNode): (FreNode | FreNodeReference<FreNamedNode>)[];
}
