import type {
    AnnotationAddedEvent,
    AnnotationDeletedEvent,
    AnnotationMovedAndReplacedFromOtherParentEvent,
    AnnotationMovedAndReplacedInSameParentEvent,
    AnnotationMovedFromOtherParentEvent,
    AnnotationMovedInSameParentEvent,
    AnnotationReplacedEvent,
    ClassifierChangedEvent,
    ErrorEvent,
    NoOpEvent,
    PartitionAddedEvent,
    PartitionDeletedEvent,
    ReferenceAddedEvent,
    ReferenceChangedEvent,
    ReferenceDeletedEvent,
} from "@lionweb/server-delta-shared"

import type { ReceivingDelta } from "@lionweb/server-delta-client"

const ClassifierChangedFunction = (msg: ClassifierChangedEvent): void => {
    console.log("Called ClassifierChangedFunction " + msg.messageKind)
}

const PartitionAddedFunction = (msg: PartitionAddedEvent): void => {
        console.log("Called PartitionAddedFunction " + msg.messageKind)
    }

const PartitionDeletedFunction = (msg: PartitionDeletedEvent): void => {
        console.log("Called PartitionDeletedFunction " + msg.messageKind)
    }

const AnnotationAddedFunction = (msg: AnnotationAddedEvent): void => {
        console.log("Called AnnotationAddedFunction " + msg.messageKind)
    }

const AnnotationDeletedFunction = (msg: AnnotationDeletedEvent): void => {
        console.log("Called AnnotationDeletedFunction " + msg.messageKind)
    }

const AnnotationReplacedFunction = (msg: AnnotationReplacedEvent): void => {
        console.log("Called AnnotationReplacedFunction " + msg.messageKind)
    }

const AnnotationMovedFromOtherParentFunction = (msg: AnnotationMovedFromOtherParentEvent): void => {
        console.log("Called AnnotationMovedFromOtherParentFunction " + msg.messageKind)
    }

const AnnotationMovedInSameParentFunction = (msg: AnnotationMovedInSameParentEvent): void => {
        console.log("Called AnnotationMovedInSameParentFunction " + msg.messageKind)
    }

const AnnotationMovedAndReplacedFromOtherParentFunction = (msg: AnnotationMovedAndReplacedFromOtherParentEvent): void => {
        console.log("Called AnnotationMovedAndReplacedFromOtherParentFunction " + msg.messageKind)
    }

const AnnotationMovedAndReplacedInSameParentFunction = (msg: AnnotationMovedAndReplacedInSameParentEvent): void => {
        console.log("Called AnnotationMovedAndReplacedInSameParentFunction " + msg.messageKind)
    }

const ReferenceAddedFunction = (msg: ReferenceAddedEvent): void => {
        console.log("Called ReferenceAddedFunction " + msg.messageKind)
    }

const ReferenceDeletedFunction = (msg: ReferenceDeletedEvent): void => {
        console.log("Called ReferenceDeletedFunction " + msg.messageKind)
    }

const ReferenceChangedFunction = (msg: ReferenceChangedEvent): void => {
        console.log("Called ReferenceChangedFunction " + msg.messageKind)
    }


const ErrorFunction = (msg: ErrorEvent): void => {
        console.log("Called ErrorFunction " + msg.messageKind)
    }

const NoOpEventFunction = (msg: NoOpEvent): void => {
        console.log("Called NoOpEventFunction " + msg.messageKind)
}

export const eventFunctions: ReceivingDelta[] = [
    {
        messageKind: "ClassifierChanged",
        // @ts-expect-error TS2322
        processor: ClassifierChangedFunction
    },
    {
        messageKind: "PartitionAdded",
        // @ts-expect-error TS2322
        processor: PartitionAddedFunction
    },
    {
        messageKind: "PartitionDeleted",
        // @ts-expect-error TS2322
        processor: PartitionDeletedFunction
    },
    {
        messageKind: "ReferenceAdded",
        // @ts-expect-error TS2322
        processor: ReferenceAddedFunction
    },
    {
        messageKind: "ReferenceChanged",
        // @ts-expect-error TS2322
        processor: ReferenceChangedFunction
    },
    {
        messageKind: "ReferenceDeleted",
        // @ts-expect-error TS2322
        processor: ReferenceDeletedFunction
    },
    {
        messageKind: "AnnotationAdded",
        // @ts-expect-error TS2322
        processor: AnnotationAddedFunction
    },
    {
        messageKind: "AnnotationDeleted",
        // @ts-expect-error TS2322
        processor: AnnotationDeletedFunction
    },
    {
        messageKind: "AnnotationReplaced",
        // @ts-expect-error TS2322
        processor: AnnotationReplacedFunction
    },
    {
        messageKind: "AnnotationMovedFromOtherParent",
        // @ts-expect-error TS2322
        processor: AnnotationMovedFromOtherParentFunction
    },
    {
        messageKind: "AnnotationMovedInSameParent",
        // @ts-expect-error TS2322
        processor: AnnotationMovedInSameParentFunction
    },
    {
        messageKind: "AnnotationMovedAndReplacedFromOtherParent",
        // @ts-expect-error TS2322
        processor: AnnotationMovedAndReplacedFromOtherParentFunction
    },
    {
        messageKind: "AnnotationMovedAndReplacedInSameParent",
        // @ts-expect-error TS2322
        processor: AnnotationMovedAndReplacedInSameParentFunction
    },
    {
        messageKind: "ErrorEvent",
        // @ts-expect-error TS2322
        processor: ErrorFunction
    },
    {
        messageKind: "NoOp",
        // @ts-expect-error TS2322
        processor: NoOpEventFunction
    },
]
