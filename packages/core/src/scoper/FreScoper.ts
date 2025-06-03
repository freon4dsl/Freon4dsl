import { FreNode, FreNamedNode, FreNodeReference } from '../ast/index.js';
import { FreCompositeScoper } from "./FreCompositeScoper.js";
import { FreNamespaceInfo } from './FreNamespaceInfo.js';

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
    getVisibleNodes(node: FreNode | FreNodeReference<FreNamedNode>, metaType?: string): FreNamedNode[];

    /**
     * Returns all nodes and/or node references that represent namespaces which should be added to the namespace
     * represented by 'node'.
     *
     * @param node
     */
    importedNamespaces(node: FreNode): FreNamespaceInfo[];

    /**
     * Returns all nodes and/or node references that represent namespaces which should be used to replace
     * the parent namespace of the namespace represented by 'node'.
     *
     * @param node
     */
    alternativeNamespaces(node: FreNode): FreNamespaceInfo[];
}
