import type {
    ChildMovedFromOtherContainmentEvent,
    ChildReplacedEvent,
    ChildDeletedEvent,
    ChildAddedEvent,
    ChildMovedAndReplacedFromOtherContainmentEvent,
    ChildMovedAndReplacedFromOtherContainmentInSameParentEvent,
    ChildMovedAndReplacedInSameContainmentEvent,
    ChildMovedFromOtherContainmentInSameParentEvent,
    ChildMovedInSameContainmentEvent
} from "@lionweb/server-delta-shared"
import { type ReceivingDelta } from "@lionweb/server-delta-client"
import { findNode } from "../../ast-utils/FindNodes.js"
import { FREON } from "../../environment/index.js"
import { FreLogger } from "../../logging/index.js"
import { isNullOrUndefined } from "../../util/index.js"

const LOGGER = new FreLogger("FreonChildEvents")

export class FreonChildEvents {
    constructor() {
    }

    ChildAddedFunction = (msg: ChildAddedEvent): void => {
        LOGGER.log("Called ChildAddedFunction " + msg.messageKind)
        const parent = findNode(msg.parent, FREON.modelManager.model!)
        if (isNullOrUndefined(parent)) {
            LOGGER.error(`Node with id ${msg.parent} not found in the model`)
            return
        }
    }

    ChildDeletedFunction = (msg: ChildDeletedEvent): void => {
        LOGGER.log("Called ChildDeletedFunction " + msg.messageKind)
    }

    ChildReplacedFunction = (msg: ChildReplacedEvent): void => {
        LOGGER.log("Called ChildReplacedFunction " + msg.messageKind)
    }

    ChildMovedFromOtherContainmentFunction = (msg: ChildMovedFromOtherContainmentEvent): void => {
        LOGGER.log("Called ChildMovedFromOtherContainmentFunction " + msg.messageKind)
    }

    ChildMovedFromOtherContainmentInSameParentFunction = (msg: ChildMovedFromOtherContainmentInSameParentEvent): void => {
        LOGGER.log("Called ChildMovedFromOtherContainmentInSameParentFunction " + msg.messageKind)
    }

    ChildMovedInSameContainmentFunction = (msg: ChildMovedInSameContainmentEvent): void => {
        LOGGER.log("Called ChildMovedInSameContainmentFunction " + msg.messageKind)
    }

    ChildMovedAndReplacedFromOtherContainmentFunction = (msg: ChildMovedAndReplacedFromOtherContainmentEvent): void => {
        LOGGER.log("Called ChildMovedAndReplacedFromOtherContainmentFunction " + msg.messageKind)
    }

    ChildMovedAndReplacedFromOtherContainmentInSameParentFunction = (msg: ChildMovedAndReplacedFromOtherContainmentInSameParentEvent): void => {
        LOGGER.log("Called ChildMovedAndReplacedFromOtherContainmentInSameParentFunction " + msg.messageKind)
    }

    ChildMovedAndReplacedInSameContainmentFunction = (msg: ChildMovedAndReplacedInSameContainmentEvent): void => {
        LOGGER.log("Called ChildMovedAndReplacedInSameContainmentFunction " + msg.messageKind)
    }


    eventFunctions: ReceivingDelta[] = [
        {
            messageKind: "ChildAdded",
            // @ts-expect-error TS2322
            processor: this.ChildAddedFunction
        },
        {
            messageKind: "ChildDeleted",
            // @ts-expect-error TS2322
            processor: this.ChildDeletedFunction
        },
        {
            messageKind: "ChildMovedAndReplacedFromOtherContainment",
            // @ts-expect-error TS2322
            processor: this.ChildMovedAndReplacedFromOtherContainmentFunction
        },
        {
            messageKind: "ChildMovedAndReplacedFromOtherContainmentInSameParent",
            // @ts-expect-error TS2322
            processor: this.ChildMovedAndReplacedFromOtherContainmentInSameParentFunction
        },
        {
            messageKind: "ChildMovedAndReplacedInSameContainment",
            // @ts-expect-error TS2322
            processor: this.ChildMovedAndReplacedInSameContainmentFunction
        },
        {
            messageKind: "ChildMovedFromOtherContainment",
            // @ts-expect-error TS2322
            processor: this.ChildMovedFromOtherContainmentFunction
        },
        {
            messageKind: "ChildMovedFromOtherContainmentInSameParent",
            // @ts-expect-error TS2322
            processor: this.ChildMovedFromOtherContainmentInSameParentFunction
        },
        {
            messageKind: "ChildMovedInSameContainment",
            // @ts-expect-error TS2322
            processor: this.ChildMovedInSameContainmentFunction
        },
        {
            messageKind: "ChildReplaced",
            // @ts-expect-error TS2322
            processor: this.ChildReplacedFunction
        },
    ]
}

