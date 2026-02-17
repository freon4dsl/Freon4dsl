import type { String } from "./DeltaTypes.js";
import type { Number } from "./DeltaTypes.js";
import type { CommandSource } from "./DeltaTypes.js";
import type { AdditionalInfo } from "./DeltaTypes.js";
import type { LionWebId } from "./Chunks.js";
import type { LionWebJsonMetaPointer } from "./Chunks.js";
import type { LionWebDeltaJsonChunk } from "./DeltaTypes.js";
// cannot find import type for Event

// The overall "super-type"
export type DeltaEvent = {
    messageKind: EventMessageKind;
    sequenceNumber: Number;
    originCommands: CommandSource[];
    additionalInfo: AdditionalInfo[];
};

/**
 *  @see https://lionWeb.io/specification/delta/delta-api.html#evnt-ClassifierChanged
 */
export type ClassifierChangedEvent = DeltaEvent & {
    node: LionWebId;
    oldClassifier: LionWebJsonMetaPointer;
    newClassifier: LionWebJsonMetaPointer;
    messageKind: "ClassifierChanged";
};

/**
 *  @see https://lionWeb.io/specification/delta/delta-api.html#evnt-PartitionAdded
 */
export type PartitionAddedEvent = DeltaEvent & {
    newPartition: LionWebDeltaJsonChunk;
    messageKind: "PartitionAdded";
};

/**
 *  @see https://lionWeb.io/specification/delta/delta-api.html#evnt-PartitionDeleted
 */
export type PartitionDeletedEvent = DeltaEvent & {
    deletedPartition: LionWebId;
    deletedDescendants: LionWebId[];
    messageKind: "PartitionDeleted";
};

/**
 *  @see https://lionWeb.io/specification/delta/delta-api.html#evnt-PropertyAdded
 */
export type PropertyAddedEvent = DeltaEvent & {
    node: LionWebId;
    property: LionWebJsonMetaPointer;
    newValue: String;
    messageKind: "PropertyAdded";
};

/**
 *  @see https://lionWeb.io/specification/delta/delta-api.html#evnt-PropertyDeleted
 */
export type PropertyDeletedEvent = DeltaEvent & {
    node: LionWebId;
    property: LionWebJsonMetaPointer;
    oldValue: String;
    messageKind: "PropertyDeleted";
};

/**
 *  @see https://lionWeb.io/specification/delta/delta-api.html#evnt-PropertyChanged
 */
export type PropertyChangedEvent = DeltaEvent & {
    node: LionWebId;
    property: LionWebJsonMetaPointer;
    newValue: String;
    oldValue: String;
    messageKind: "PropertyChanged";
};

/**
 *  @see https://lionWeb.io/specification/delta/delta-api.html#evnt-ChildAdded
 */
export type ChildAddedEvent = DeltaEvent & {
    parent: LionWebId;
    containment: LionWebJsonMetaPointer;
    newChild: LionWebDeltaJsonChunk;
    index: Number;
    messageKind: "ChildAdded";
};

/**
 *  @see https://lionWeb.io/specification/delta/delta-api.html#evnt-ChildDeleted
 */
export type ChildDeletedEvent = DeltaEvent & {
    parent: LionWebId;
    index: Number;
    containment: LionWebJsonMetaPointer;
    deletedChild: LionWebId;
    deletedDescendants: LionWebId[];
    messageKind: "ChildDeleted";
};

/**
 *  @see https://lionWeb.io/specification/delta/delta-api.html#evnt-ChildReplaced
 */
export type ChildReplacedEvent = DeltaEvent & {
    parent: LionWebId;
    index: Number;
    containment: LionWebJsonMetaPointer;
    replacedChild: LionWebId;
    replacedDescendants: LionWebId[];
    newChild: LionWebDeltaJsonChunk;
    messageKind: "ChildReplaced";
};

/**
 *  @see https://lionWeb.io/specification/delta/delta-api.html#evnt-ChildMovedFromOtherContainment
 */
export type ChildMovedFromOtherContainmentEvent = DeltaEvent & {
    newParent: LionWebId;
    newIndex: Number;
    newContainment: LionWebJsonMetaPointer;
    oldParent: LionWebId;
    oldIndex: Number;
    oldContainment: LionWebJsonMetaPointer;
    movedChild: LionWebId;
    messageKind: "ChildMovedFromOtherContainment";
};

/**
 *  @see https://lionWeb.io/specification/delta/delta-api.html#evnt-ChildMovedFromOtherContainmentInSameParent
 */
export type ChildMovedFromOtherContainmentInSameParentEvent = DeltaEvent & {
    parent: LionWebId;
    newIndex: Number;
    newContainment: LionWebJsonMetaPointer;
    oldIndex: Number;
    oldContainment: LionWebJsonMetaPointer;
    movedChild: LionWebId;
    messageKind: "ChildMovedFromOtherContainmentInSameParent";
};

/**
 *  @see https://lionWeb.io/specification/delta/delta-api.html#evnt-ChildMovedInSameContainment
 */
export type ChildMovedInSameContainmentEvent = DeltaEvent & {
    parent: LionWebId;
    newIndex: Number;
    containment: LionWebJsonMetaPointer;
    oldIndex: Number;
    movedChild: LionWebId;
    messageKind: "ChildMovedInSameContainment";
};

/**
 *  @see https://lionWeb.io/specification/delta/delta-api.html#evnt-ChildMovedAndReplacedFromOtherContainment
 */
export type ChildMovedAndReplacedFromOtherContainmentEvent = DeltaEvent & {
    newParent: LionWebId;
    newIndex: Number;
    newContainment: LionWebJsonMetaPointer;
    oldParent: LionWebId;
    oldIndex: Number;
    oldContainment: LionWebJsonMetaPointer;
    movedChild: LionWebId;
    replacedDescendants: LionWebId[];
    replacedChild: LionWebId;
    messageKind: "ChildMovedAndReplacedFromOtherContainment";
};

/**
 *  @see https://lionWeb.io/specification/delta/delta-api.html#evnt-ChildMovedAndReplacedFromOtherContainmentInSameParent
 */
export type ChildMovedAndReplacedFromOtherContainmentInSameParentEvent = DeltaEvent & {
    parent: LionWebId;
    newIndex: Number;
    newContainment: LionWebJsonMetaPointer;
    movedChild: LionWebId;
    oldIndex: Number;
    oldContainment: LionWebJsonMetaPointer;
    replacedDescendants: LionWebId[];
    replacedChild: LionWebId;
    messageKind: "ChildMovedAndReplacedFromOtherContainmentInSameParent";
};

/**
 *  @see https://lionWeb.io/specification/delta/delta-api.html#evnt-ChildMovedAndReplacedInSameContainment
 */
export type ChildMovedAndReplacedInSameContainmentEvent = DeltaEvent & {
    parent: LionWebId;
    newIndex: Number;
    containment: LionWebJsonMetaPointer;
    movedChild: LionWebId;
    oldIndex: Number;
    replacedDescendants: LionWebId[];
    replacedChild: LionWebId;
    messageKind: "ChildMovedAndReplacedInSameContainment";
};

/**
 *  @see https://lionWeb.io/specification/delta/delta-api.html#evnt-AnnotationAdded
 */
export type AnnotationAddedEvent = DeltaEvent & {
    parent: LionWebId;
    newAnnotation: LionWebDeltaJsonChunk;
    index: Number;
    messageKind: "AnnotationAdded";
};

/**
 *  @see https://lionWeb.io/specification/delta/delta-api.html#evnt-AnnotationDeleted
 */
export type AnnotationDeletedEvent = DeltaEvent & {
    parent: LionWebId;
    deletedAnnotation: LionWebId;
    deletedDescendants: LionWebId[];
    index: Number;
    messageKind: "AnnotationDeleted";
};

/**
 *  @see https://lionWeb.io/specification/delta/delta-api.html#evnt-AnnotationReplaced
 */
export type AnnotationReplacedEvent = DeltaEvent & {
    parent: LionWebId;
    index: Number;
    replacedAnnotation: LionWebId;
    replacedDescendants: LionWebId[];
    newAnnotation: LionWebDeltaJsonChunk;
    messageKind: "AnnotationReplaced";
};

/**
 *  @see https://lionWeb.io/specification/delta/delta-api.html#evnt-AnnotationMovedFromOtherParent
 */
export type AnnotationMovedFromOtherParentEvent = DeltaEvent & {
    newParent: LionWebId;
    newIndex: Number;
    movedAnnotation: LionWebId;
    oldParent: LionWebId;
    oldIndex: Number;
    messageKind: "AnnotationMovedFromOtherParent";
};

/**
 *  @see https://lionWeb.io/specification/delta/delta-api.html#evnt-AnnotationMovedInSameParent
 */
export type AnnotationMovedInSameParentEvent = DeltaEvent & {
    parent: LionWebId;
    newIndex: Number;
    movedAnnotation: LionWebId;
    oldIndex: Number;
    messageKind: "AnnotationMovedInSameParent";
};

/**
 *  @see https://lionWeb.io/specification/delta/delta-api.html#evnt-AnnotationMovedAndReplacedFromOtherParent
 */
export type AnnotationMovedAndReplacedFromOtherParentEvent = DeltaEvent & {
    newParent: LionWebId;
    newIndex: Number;
    movedAnnotation: LionWebId;
    oldParent: LionWebId;
    oldIndex: Number;
    replacedAnnotation: LionWebId;
    replacedDescendants: LionWebId[];
    messageKind: "AnnotationMovedAndReplacedFromOtherParent";
};

/**
 *  @see https://lionWeb.io/specification/delta/delta-api.html#evnt-AnnotationMovedAndReplacedInSameParent
 */
export type AnnotationMovedAndReplacedInSameParentEvent = DeltaEvent & {
    parent: LionWebId;
    newIndex: Number;
    movedAnnotation: LionWebId;
    oldIndex: Number;
    replacedAnnotation: LionWebId;
    replacedDescendants: LionWebId[];
    messageKind: "AnnotationMovedAndReplacedInSameParent";
};

/**
 *  @see https://lionWeb.io/specification/delta/delta-api.html#evnt-ReferenceAdded
 */
export type ReferenceAddedEvent = DeltaEvent & {
    parent: LionWebId;
    index: Number;
    reference: LionWebJsonMetaPointer;
    newTarget?: LionWebId | null;
    newResolveInfo?: String | null;
    messageKind: "ReferenceAdded";
};

/**
 *  @see https://lionWeb.io/specification/delta/delta-api.html#evnt-ReferenceDeleted
 */
export type ReferenceDeletedEvent = DeltaEvent & {
    parent: LionWebId;
    index: Number;
    reference: LionWebJsonMetaPointer;
    deletedTarget?: LionWebId | null;
    deletedResolveInfo?: String | null;
    messageKind: "ReferenceDeleted";
};

/**
 *  @see https://lionWeb.io/specification/delta/delta-api.html#evnt-ReferenceChanged
 */
export type ReferenceChangedEvent = DeltaEvent & {
    parent: LionWebId;
    index: Number;
    reference: LionWebJsonMetaPointer;
    newTarget?: LionWebId | null;
    newResolveInfo?: String | null;
    oldTarget?: LionWebId | null;
    oldResolveInfo?: String | null;
    messageKind: "ReferenceChanged";
};

/**
 *  @see https://lionWeb.io/specification/delta/delta-api.html#evnt-CompositeEvent
 */
export type CompositeEvent = DeltaEvent & {
    parts: DeltaEvent[];
    messageKind: "CompositeEvent";
};

/**
 *  @see https://lionWeb.io/specification/delta/delta-api.html#evnt-NoOp
 */
export type NoOpEvent = DeltaEvent & {
    messageKind: "NoOp";
};

/**
 *  @see https://lionWeb.io/specification/delta/delta-api.html#evnt-ErrorEvent
 */
export type ErrorEvent = DeltaEvent & {
    errorCode: String;
    message: String;
    messageKind: "ErrorEvent";
};

// The type for the tagged union property
export type EventMessageKind =
    | "ClassifierChanged"
    | "PartitionAdded"
    | "PartitionDeleted"
    | "PropertyAdded"
    | "PropertyDeleted"
    | "PropertyChanged"
    | "ChildAdded"
    | "ChildDeleted"
    | "ChildReplaced"
    | "ChildMovedFromOtherContainment"
    | "ChildMovedFromOtherContainmentInSameParent"
    | "ChildMovedInSameContainment"
    | "ChildMovedAndReplacedFromOtherContainment"
    | "ChildMovedAndReplacedFromOtherContainmentInSameParent"
    | "ChildMovedAndReplacedInSameContainment"
    | "AnnotationAdded"
    | "AnnotationDeleted"
    | "AnnotationReplaced"
    | "AnnotationMovedFromOtherParent"
    | "AnnotationMovedInSameParent"
    | "AnnotationMovedAndReplacedFromOtherParent"
    | "AnnotationMovedAndReplacedInSameParent"
    | "ReferenceAdded"
    | "ReferenceDeleted"
    | "ReferenceChanged"
    | "CompositeEvent"
    | "NoOp"
    | "ErrorEvent";

// Type Guard function
export function isDeltaEvent(object: unknown): object is DeltaEvent {
    const castObject = object as DeltaEvent;
    return (
        castObject.messageKind !== undefined &&
        [
            "ClassifierChanged",
            "PartitionAdded",
            "PartitionDeleted",
            "PropertyAdded",
            "PropertyDeleted",
            "PropertyChanged",
            "ChildAdded",
            "ChildDeleted",
            "ChildReplaced",
            "ChildMovedFromOtherContainment",
            "ChildMovedFromOtherContainmentInSameParent",
            "ChildMovedInSameContainment",
            "ChildMovedAndReplacedFromOtherContainment",
            "ChildMovedAndReplacedFromOtherContainmentInSameParent",
            "ChildMovedAndReplacedInSameContainment",
            "AnnotationAdded",
            "AnnotationDeleted",
            "AnnotationReplaced",
            "AnnotationMovedFromOtherParent",
            "AnnotationMovedInSameParent",
            "AnnotationMovedAndReplacedFromOtherParent",
            "AnnotationMovedAndReplacedInSameParent",
            "ReferenceAdded",
            "ReferenceDeleted",
            "ReferenceChanged",
            "CompositeEvent",
            "NoOp",
            "ErrorEvent",
        ].includes(castObject.messageKind)
    );
}
