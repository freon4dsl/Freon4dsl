import type {
    SubscribeToChangingPartitionsResponse,
    SubscribeToPartitionContentsResponse,
    UnsubscribeFromPartitionContentsResponse,
    ListPartitionsResponse,
    GetAvailableIdsResponse,
} from "@lionweb/server-delta-shared"
import { type ReceivingDelta } from "@lionweb/server-delta-client"
import type { FreModelUnit } from "../../ast/index.js"
import { FREON } from "../../environment/index.js"
import { FreLogger } from "../../logging/index.js"
import { FreLionwebSerializer } from "../serializer/index.js"

const LOGGER = new FreLogger("FreonResponseEvents")

export class FreonResponseEvents {
    constructor() {}

    SubscribeToChangingPartitionsResponseFunction = (msg: SubscribeToChangingPartitionsResponse): void => {
        LOGGER.log("Called SubscribeToChangingPartitionsResponseFunction " + msg.messageKind)
    }

    SubscribeToPartitionContentsResponseFunction = (msg: SubscribeToPartitionContentsResponse): void => {
        LOGGER.log("Running SubscribeToPartitionContentsResponseFunction " + JSON.stringify(msg))
        const serializer = new FreLionwebSerializer()
        const unit = serializer.toTypeScriptInstance({
            serializationFormatVersion: "2023.1",
            languages: [],
            nodes: msg.contents.nodes,
        })
        FREON.astChanger.changeIgnore("SubscribeToPartitionContentsResponseFunction", () => {
            FREON.modelManager.model.addUnit(unit as FreModelUnit)
        })
    }

    UnsubscribeFromPartitionContentsResponseFunction = (msg: UnsubscribeFromPartitionContentsResponse): void => {
        LOGGER.log("Called UnsubscribeFromPartitionContentsResponseFunction " + msg.messageKind)
    }

    ListPartitionsResponseFunction = (msg: ListPartitionsResponse): void => {
        LOGGER.log("Called ListPartitionsResponseFunction " + msg.messageKind)
        // FREON.modelManager.
    }

    GetAvailableIdsResponseFunction = (msg: GetAvailableIdsResponse): void => {
        LOGGER.log("Called GetAvailableIdsResponseFunction " + msg.messageKind)
    }

    eventFunctions: ReceivingDelta[] = [
        {
            messageKind: "ListPartitionsResponse",
            // @ts-expect-error TS2322
            processor: this.ListPartitionsResponseFunction,
        },
        {
            messageKind: "GetAvailableIdsResponse",
            // @ts-expect-error TS2322
            processor: this.GetAvailableIdsResponseFunction,
        },
        {
            messageKind: "SubscribeToChangingPartitionsResponse",
            // @ts-expect-error TS2322
            processor: this.SubscribeToChangingPartitionsResponseFunction,
        },
        {
            messageKind: "SubscribeToPartitionContentsResponse",
            // @ts-expect-error TS2322
            processor: this.SubscribeToPartitionContentsResponseFunction,
        },
        {
            messageKind: "UnsubscribeFromPartitionContentsResponse",
            // @ts-expect-error TS2322
            processor: this.UnsubscribeFromPartitionContentsResponseFunction,
        },
    ]
}
