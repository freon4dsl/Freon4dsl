/**
 * The types defining the struicture of the lionweb JSON format.
 * We use types instead of classes, because the purpose is to define the Lionweb JSON to be sent over the line.
 */

export type LwMetaPointer = {
    metamodel: string;
    version: string;
    key: string;
}

export function isLwMetaPointer(node: any): node is LwMetaPointer {
    const metaPointer = node as LwMetaPointer;
    return metaPointer.key !== undefined &&
        metaPointer.version !== undefined &&
        metaPointer.metamodel !== undefined;
}

export type LwChunk = {
    serializationFormatVersion: string;
    metamodels: LwUsedLanguage[];
    nodes: LwNode[];
}

export function isLwChunk(box: any): box is LwChunk {
    const cnk = box as LwChunk;
    return cnk.serializationFormatVersion !== undefined &&
        cnk.metamodels !== undefined &&
        cnk.nodes !== undefined;
}

export type LwUsedLanguage = {
    key: string;
    version: string;
}

export type LwNode = {
    id: string;
    concept: LwMetaPointer;
    properties: LwProperty[];
    children: LwChild[];
    references: LwReference[];
    parent: string;
}

export function isLwNode(box: any): box is LwNode {
    const lwNode = box as LwNode;
    return lwNode.id !== undefined &&
        lwNode.concept !== undefined &&
        lwNode.properties !== undefined &&
        lwNode.children !== undefined &&
        lwNode.references !== undefined &&
        lwNode.parent !== undefined;
}

export function createLwNode(): LwNode {
    return {
        id: null,
        concept: null,
        properties: [],
        children: [],
        references: [],
        parent: null
    }
}

export type LwProperty = {
    property: LwMetaPointer;
    value: string;
}

export type LwChild = {
    containment: LwMetaPointer;
    children: string[];
}

export type LwReference = {
    reference: LwMetaPointer;
    targets: LwTarget[];
}

export type LwTarget = {
    resolveInfo: string;
    reference: string;
}
