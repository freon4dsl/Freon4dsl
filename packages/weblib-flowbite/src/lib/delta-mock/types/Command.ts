import type { CommandId } from "./DeltaTypes.js";
import type { String } from "./DeltaTypes.js";
import type { AdditionalInfo } from "./DeltaTypes.js";
import type { LionWebDeltaJsonChunk } from "./DeltaTypes.js";
import type { LionWebId } from "./Chunks.js";
import type { LionWebJsonMetaPointer } from "./Chunks.js";
import type { Number } from "./DeltaTypes.js";

// The overall "super-type"
export type DeltaCommand = {
    commandId: CommandId;
    messageKind: CommandMessageKind;
    additionalInfo: AdditionalInfo[];
};

/**
 *  @see https://lionWeb.io/specification/delta/delta-api.html#cmd-AddPartition
 */
export type AddPartitionCommand = DeltaCommand & {
    newPartition: LionWebDeltaJsonChunk;
    messageKind: "AddPartition";
};

/**
 *  @see https://lionWeb.io/specification/delta/delta-api.html#cmd-DeletePartition
 */
export type DeletePartitionCommand = DeltaCommand & {
    deletedPartition: LionWebId;
    messageKind: "DeletePartition";
};

/**
 *  @see https://lionWeb.io/specification/delta/delta-api.html#cmd-ChangeClassifier
 */
export type ChangeClassifierCommand = DeltaCommand & {
    newClassifier: LionWebJsonMetaPointer;
    node: LionWebId;
    messageKind: "ChangeClassifier";
};

/**
 *  @see https://lionWeb.io/specification/delta/delta-api.html#cmd-AddProperty
 */
export type AddPropertyCommand = DeltaCommand & {
    node: LionWebId;
    property: LionWebJsonMetaPointer;
    newValue: String;
    messageKind: "AddProperty";
};

/**
 *  @see https://lionWeb.io/specification/delta/delta-api.html#cmd-ChangeProperty
 */
export type ChangePropertyCommand = DeltaCommand & {
    node: LionWebId;
    property: LionWebJsonMetaPointer;
    newValue: String;
    messageKind: "ChangeProperty";
};

/**
 *  @see https://lionWeb.io/specification/delta/delta-api.html#cmd-DeleteProperty
 */
export type DeletePropertyCommand = DeltaCommand & {
    node: LionWebId;
    property: LionWebJsonMetaPointer;
    messageKind: "DeleteProperty";
};

/**
 *  @see https://lionWeb.io/specification/delta/delta-api.html#cmd-AddChild
 */
export type AddChildCommand = DeltaCommand & {
    parent: LionWebId;
    newChild: LionWebDeltaJsonChunk;
    containment: LionWebJsonMetaPointer;
    index: Number;
    messageKind: "AddChild";
};

/**
 *  @see https://lionWeb.io/specification/delta/delta-api.html#cmd-DeleteChild
 */
export type DeleteChildCommand = DeltaCommand & {
    parent: LionWebId;
    deletedChild: LionWebId;
    containment: LionWebJsonMetaPointer;
    index: Number;
    messageKind: "DeleteChild";
};

/**
 *  @see https://lionWeb.io/specification/delta/delta-api.html#cmd-ReplaceChild
 */
export type ReplaceChildCommand = DeltaCommand & {
    parent: LionWebId;
    newChild: LionWebDeltaJsonChunk;
    containment: LionWebJsonMetaPointer;
    index: Number;
    replacedChild: LionWebId;
    messageKind: "ReplaceChild";
};

/**
 *  @see https://lionWeb.io/specification/delta/delta-api.html#cmd-MoveChildFromOtherContainment
 */
export type MoveChildFromOtherContainmentCommand = DeltaCommand & {
    newParent: LionWebId;
    newContainment: LionWebJsonMetaPointer;
    newIndex: Number;
    movedChild: LionWebId;
    messageKind: "MoveChildFromOtherContainment";
};

/**
 *  @see https://lionWeb.io/specification/delta/delta-api.html#cmd-MoveChildFromOtherContainmentInSameParent
 */
export type MoveChildFromOtherContainmentInSameParentCommand = DeltaCommand & {
    newContainment: LionWebJsonMetaPointer;
    newIndex: Number;
    movedChild: LionWebId;
    messageKind: "MoveChildFromOtherContainmentInSameParent";
};

/**
 *  @see https://lionWeb.io/specification/delta/delta-api.html#cmd-MoveChildInSameContainment
 */
export type MoveChildInSameContainmentCommand = DeltaCommand & {
    newIndex: Number;
    movedChild: LionWebId;
    messageKind: "MoveChildInSameContainment";
};

/**
 *  @see https://lionWeb.io/specification/delta/delta-api.html#cmd-MoveAndReplaceChildFromOtherContainment
 */
export type MoveAndReplaceChildFromOtherContainmentCommand = DeltaCommand & {
    newParent: LionWebId;
    newContainment: LionWebJsonMetaPointer;
    newIndex: Number;
    replacedChild: LionWebId;
    movedChild: LionWebId;
    messageKind: "MoveAndReplaceChildFromOtherContainment";
};

/**
 *  @see https://lionWeb.io/specification/delta/delta-api.html#cmd-MoveAndReplaceChildFromOtherContainmentInSameParent
 */
export type MoveAndReplaceChildFromOtherContainmentInSameParentCommand = DeltaCommand & {
    newContainment: LionWebJsonMetaPointer;
    newIndex: Number;
    replacedChild: LionWebId;
    movedChild: LionWebId;
    messageKind: "MoveAndReplaceChildFromOtherContainmentInSameParent";
};

/**
 *  @see https://lionWeb.io/specification/delta/delta-api.html#cmd-MoveAndReplaceChildInSameContainment
 */
export type MoveAndReplaceChildInSameContainmentCommand = DeltaCommand & {
    newIndex: Number;
    replacedChild: LionWebId;
    movedChild: LionWebId;
    messageKind: "MoveAndReplaceChildInSameContainment";
};

/**
 *  @see https://lionWeb.io/specification/delta/delta-api.html#cmd-AddAnnotation
 */
export type AddAnnotationCommand = DeltaCommand & {
    parent: LionWebId;
    newAnnotation: LionWebDeltaJsonChunk;
    index: Number;
    messageKind: "AddAnnotation";
};

/**
 *  @see https://lionWeb.io/specification/delta/delta-api.html#cmd-DeleteAnnotation
 */
export type DeleteAnnotationCommand = DeltaCommand & {
    parent: LionWebId;
    index: Number;
    deletedAnnotation: LionWebId;
    messageKind: "DeleteAnnotation";
};

/**
 *  @see https://lionWeb.io/specification/delta/delta-api.html#cmd-ReplaceAnnotation
 */
export type ReplaceAnnotationCommand = DeltaCommand & {
    parent: LionWebId;
    newAnnotation: LionWebDeltaJsonChunk;
    index: Number;
    replacedAnnotation: LionWebId;
    messageKind: "ReplaceAnnotation";
};

/**
 *  @see https://lionWeb.io/specification/delta/delta-api.html#cmd-MoveAnnotationFromOtherParent
 */
export type MoveAnnotationFromOtherParentCommand = DeltaCommand & {
    newParent: LionWebId;
    newIndex: Number;
    movedAnnotation: LionWebId;
    messageKind: "MoveAnnotationFromOtherParent";
};

/**
 *  @see https://lionWeb.io/specification/delta/delta-api.html#cmd-MoveAnnotationInSameParent
 */
export type MoveAnnotationInSameParentCommand = DeltaCommand & {
    newIndex: Number;
    movedAnnotation: LionWebId;
    messageKind: "MoveAnnotationInSameParent";
};

/**
 *  @see https://lionWeb.io/specification/delta/delta-api.html#cmd-MoveAndReplaceAnnotationFromOtherParent
 */
export type MoveAndReplaceAnnotationFromOtherParentCommand = DeltaCommand & {
    newParent: LionWebId;
    newIndex: Number;
    replacedAnnotation: LionWebId;
    movedAnnotation: LionWebId;
    messageKind: "MoveAndReplaceAnnotationFromOtherParent";
};

/**
 *  @see https://lionWeb.io/specification/delta/delta-api.html#cmd-MoveAndReplaceAnnotationInSameParent
 */
export type MoveAndReplaceAnnotationInSameParentCommand = DeltaCommand & {
    newIndex: Number;
    replacedAnnotation: LionWebId;
    movedAnnotation: LionWebId;
    messageKind: "MoveAndReplaceAnnotationInSameParent";
};

/**
 *  @see https://lionWeb.io/specification/delta/delta-api.html#cmd-AddReference
 */
export type AddReferenceCommand = DeltaCommand & {
    parent: LionWebId;
    reference: LionWebJsonMetaPointer;
    index: Number;
    newTarget?: LionWebId | null;
    newResolveInfo?: String | null;
    messageKind: "AddReference";
};

/**
 *  @see https://lionWeb.io/specification/delta/delta-api.html#cmd-DeleteReference
 */
export type DeleteReferenceCommand = DeltaCommand & {
    parent: LionWebId;
    reference: LionWebJsonMetaPointer;
    index: Number;
    deletedTarget?: LionWebId | null;
    deletedResolveInfo?: String | null;
    messageKind: "DeleteReference";
};

/**
 *  @see https://lionWeb.io/specification/delta/delta-api.html#cmd-ChangeReference
 */
export type ChangeReferenceCommand = DeltaCommand & {
    parent: LionWebId;
    reference: LionWebJsonMetaPointer;
    index: Number;
    oldTarget?: LionWebId | null;
    oldResolveInfo?: String | null;
    newTarget?: LionWebId | null;
    newResolveInfo?: String | null;
    messageKind: "ChangeReference";
};

// The type for the tagged union property
export type CommandMessageKind =
    | "AddPartition"
    | "DeletePartition"
    | "ChangeClassifier"
    | "AddProperty"
    | "ChangeProperty"
    | "DeleteProperty"
    | "AddChild"
    | "DeleteChild"
    | "ReplaceChild"
    | "MoveChildFromOtherContainment"
    | "MoveChildFromOtherContainmentInSameParent"
    | "MoveChildInSameContainment"
    | "MoveAndReplaceChildFromOtherContainment"
    | "MoveAndReplaceChildFromOtherContainmentInSameParent"
    | "MoveAndReplaceChildInSameContainment"
    | "AddAnnotation"
    | "DeleteAnnotation"
    | "ReplaceAnnotation"
    | "MoveAnnotationFromOtherParent"
    | "MoveAnnotationInSameParent"
    | "MoveAndReplaceAnnotationFromOtherParent"
    | "MoveAndReplaceAnnotationInSameParent"
    | "AddReference"
    | "DeleteReference"
    | "ChangeReference";

// Type Guard function
export function isDeltaCommand(object: unknown): object is DeltaCommand {
    const castObject = object as DeltaCommand;
    return (
        castObject.messageKind !== undefined &&
        [
            "AddPartition",
            "DeletePartition",
            "ChangeClassifier",
            "AddProperty",
            "ChangeProperty",
            "DeleteProperty",
            "AddChild",
            "DeleteChild",
            "ReplaceChild",
            "MoveChildFromOtherContainment",
            "MoveChildFromOtherContainmentInSameParent",
            "MoveChildInSameContainment",
            "MoveAndReplaceChildFromOtherContainment",
            "MoveAndReplaceChildFromOtherContainmentInSameParent",
            "MoveAndReplaceChildInSameContainment",
            "AddAnnotation",
            "DeleteAnnotation",
            "ReplaceAnnotation",
            "MoveAnnotationFromOtherParent",
            "MoveAnnotationInSameParent",
            "MoveAndReplaceAnnotationFromOtherParent",
            "MoveAndReplaceAnnotationInSameParent",
            "AddReference",
            "DeleteReference",
            "ChangeReference",
        ].includes(castObject.messageKind)
    );
}
