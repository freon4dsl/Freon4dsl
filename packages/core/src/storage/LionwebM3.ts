/**
 * The types defining the structure of the lionweb JSON format.
 * @see https://lionweb-org.github.io/organization/lioncore/serialization/serialization.html
 * We use types instead of classes, because the purpose is to define the Lionweb JSON to be sent over the line.
 */
type Id = string;

export type LwMetaPointer = {
    language: Id;
    version: string;
    key: Id;
}

export function isLwMetaPointer(node: any): node is LwMetaPointer {
    const metaPointer = node as LwMetaPointer;
    return metaPointer.key !== undefined &&
        metaPointer.version !== undefined &&
        metaPointer.language !== undefined;
}

export type LwChunk = {
    serializationFormatVersion: string;
    languages: LwUsedLanguage[];
    nodes: LwNode[];
}

export function isLwChunk(box: any): box is LwChunk {
    const cnk = box as LwChunk;
    return cnk.serializationFormatVersion !== undefined &&
        cnk.languages !== undefined &&
        cnk.nodes !== undefined;
}

export type LwUsedLanguage = {
    key: Id;
    version: string;
}

export type LwNode = {
    id: Id;
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
    targets: LwReferenceTarget[];
}

export type LwReferenceTarget = {
    resolveInfo: string;
    reference: Id;
}
