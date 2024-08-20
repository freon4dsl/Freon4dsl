// import { LionWebJsonMetaPointer, LwJsonUsedLanguage } from "@lionweb/validation";

import { LionWebJsonChunk, LionWebJsonNode } from "@lionweb/validation";

export function isLionWebJsonChunk(object: any): object is LionWebJsonChunk {
    const cnk = object as LionWebJsonChunk;
    return cnk.serializationFormatVersion !== undefined && cnk.languages !== undefined && cnk.nodes !== undefined;
}

export function createLionWebJsonNode(): LionWebJsonNode {
    return {
        id: null,
        classifier: null,
        properties: [],
        containments: [],
        references: [],
        annotations: [],
        parent: null,
    };
}
/**
 * The types defining the structure of the lionweb JSON format.
 * @see https://lionweb-org.github.io/organization/lioncore/serialization/serialization.html
 * We use types instead of classes, because the purpose is to define the Lionweb JSON to be sent over the line.
 */
// type Id = string;
//
// export type LwChunk = {
//     serializationFormatVersion: string;
//     languages: LwJsonUsedLanguage[];
//     nodes: LwNode[];
// }
//
// export function isLwChunk(box: any): box is LwChunk {
//     const cnk = box as LwChunk;
//     return cnk.serializationFormatVersion !== undefined &&
//         cnk.languages !== undefined &&
//         cnk.nodes !== undefined;
// }
//
//
//
// export type LwNode = {
//     id: Id;
//     classifier: LionWebJsonMetaPointer;
//     properties: LwProperty[];
//     containments: LwContainment[];
//     references: LwReference[];
//     annotations: Id[]
//     parent: Id | null
// }
//
// export function createLwNode(): LwNode {
//     return {
//         id: null,
//         classifier: null,
//         properties: [],
//         containments: [],
//         references: [],
//         annotations: [],
//         parent: null
//     }
// }
//
// export type LwProperty = {
//     property: LionWebJsonMetaPointer;
//     value: string;
// }
//
// export type LwContainment = {
//     containment: LionWebJsonMetaPointer;
//     children: string[];
// }
//
// export type LwReference = {
//     reference: LionWebJsonMetaPointer;
//     targets: LwReferenceTarget[];
// }
// export type LwReferenceTarget = {
//     resolveInfo: string;
//     reference: Id;
// }
//

// export type LwUsedLanguage = {
//     key: Id;
//     version: string;
// }
//
// export function isLionWebJsonMetaPointer(node: any): node is LionWebJsonMetaPointer {
//     const metaPointer = node as LionWebJsonMetaPointer;
//     return metaPointer.key !== undefined &&
//         metaPointer.version !== undefined &&
//         metaPointer.language !== undefined;
// }
// export function isLwUsedLanguage(obj: any): obj is LwUsedLanguage {
//     const lwUsedLanguage = obj as LwUsedLanguage;
//     return lwUsedLanguage.key !== undefined &&
//         lwUsedLanguage.version !== undefined
// }
// export function isLwNode(box: any): box is LwNode {
//     const lwNode = box as LwNode;
//     return lwNode.id !== undefined &&
//         lwNode.classifier !== undefined &&
//         lwNode.properties !== undefined &&
//         lwNode.containments !== undefined &&
//         lwNode.references !== undefined &&
//         lwNode.parent !== undefined;
// }
//
// export function isLwProperty(obj: any): obj is LwProperty {
//     const lwProperty = obj as LwProperty;
//     return lwProperty.property !== undefined &&
//         lwProperty.value !== undefined;
// }
//
//
//
// export function isLwChild(obj: any): obj is LwContainment {
//     const lwChild = obj as LwContainment;
//     return lwChild.containment !== undefined &&
//         lwChild.children !== undefined;
// }
// export function isLwReference(obj: any): obj is LwReference {
//     const lwReference = obj as LwReference;
//     return lwReference.reference !== undefined &&
//         lwReference.targets !== undefined;
// }
//
// export function isLwReferenceTarget (obj: any): obj is  LwReferenceTarget {
//     const lwReferenceTarget = obj as LwReferenceTarget;
//     return lwReferenceTarget.reference !== undefined &&
//         lwReferenceTarget.resolveInfo !== undefined;
// }
