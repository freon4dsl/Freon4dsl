/**
 * The types defining the structure of the lionweb JSON format.
 * @see https://lionweb-org.github.io/organization/lioncore/serialization/serialization.html
 * We use types instead of classes, because the purpose is to define the Lionweb JSON to be sent over the line.
 */
type Id = string;

// export type LwMetaPointer = {
//     language: Id;
//     version: string;
//     key: Id;
// }
//
// export function isLwMetaPointer(node: any): node is LwMetaPointer {
//     const metaPointer = node as LwMetaPointer;
//     return metaPointer.key !== undefined &&
//         metaPointer.version !== undefined &&
//         metaPointer.language !== undefined;
// }
//
// export type LwChunk = {
//     serializationFormatVersion: string;
//     languages: LwUsedLanguage[];
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
// export type LwUsedLanguage = {
//     key: Id;
//     version: string;
// }
//
// export function isLwUsedLanguage(obj: any): obj is LwUsedLanguage {
//     const lwUsedLanguage = obj as LwUsedLanguage;
//     return lwUsedLanguage.key !== undefined &&
//         lwUsedLanguage.version !== undefined
// }
//
// export type LwNode = {
//     id: Id;
//     classifier: LwMetaPointer;
//     properties: LwProperty[];
//     containments: LwContainment[];
//     references: LwReference[];
//     parent: string;
// }
//
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
// export function createLwNode(): LwNode {
//     return {
//         id: null,
//         classifier: null,
//         properties: [],
//         containments: [],
//         references: [],
//         parent: null
//     }
// }
//
// export type LwProperty = {
//     property: LwMetaPointer;
//     value: string;
// }
//
// export function isLwProperty(obj: any): obj is LwProperty {
//     const lwProperty = obj as LwProperty;
//     return lwProperty.property !== undefined &&
//         lwProperty.value !== undefined;
// }
//
// export type LwContainment = {
//     containment: LwMetaPointer;
//     children: string[];
// }
//
// export function isLwChild(obj: any): obj is LwContainment {
//     const lwChild = obj as LwContainment;
//     return lwChild.containment !== undefined &&
//         lwChild.children !== undefined;
// }
//
// export type LwReference = {
//     reference: LwMetaPointer;
//     targets: LwReferenceTarget[];
// }
//
// export function isLwReference(obj: any): obj is LwReference {
//     const lwReference = obj as LwReference;
//     return lwReference.reference !== undefined &&
//         lwReference.targets !== undefined;
// }
//
// export type LwReferenceTarget = {
//     resolveInfo: string;
//     reference: Id;
// }
//
// export function isLwReferenceTarget (obj: any): obj is  LwReferenceTarget {
//     const lwReferenceTarget = obj as LwReferenceTarget;
//     return lwReferenceTarget.reference !== undefined &&
//         lwReferenceTarget.resolveInfo !== undefined;
// }
//
// export type LwDiff = {
//     isEqual: boolean;
//     diffMessage: string;
// }
//
// function check(b: boolean, message: string): void {
//     if (!b) {
//         console.error("check errorr: " + message);
//     }
// }
//
// function findNode(nodes: LwNode[], key: string): LwNode | null {
//     for (const node of nodes) {
//         check(isLwNode(node), "Expected an LwNode, but got " + JSON.stringify(node));
//         if (node.classifier.key === key) {
//             return node;
//         }
//     }
//     return null;
// }
//
// export function lwDiff(obj1: any, obj2: any): LwDiff {
//     if (isLwChunk(obj1) && isLwChunk(obj2)) {
//         if (obj1.serializationFormatVersion !== obj2.serializationFormatVersion) {
//             return { isEqual: false, diffMessage: `Serialization versions do not match: ${obj1.serializationFormatVersion} vs ${obj2.serializationFormatVersion}`}
//         }
//         // TODO check languages 
//         for (const node of obj1.nodes) {
//             check(isLwNode(node), "Expected an LwNode, but got " + JSON.stringify(node));
//             const key = node.classifier.key;
//             const otherNode = findNode(obj2.nodes, key);
//             if (otherNode === null) {
//                 return { isEqual: false, diffMessage: `Node with concept key ${key} does not exist in second object`};
//             }
//             return lwDiff(node, otherNode);
//         }
//     }  
//     return { isEqual: true, diffMessage: "ok"};
// }
