import type {
    SubscribeToChangingPartitionsResponse,
    SubscribeToPartitionContentsResponse,
    UnsubscribeFromPartitionContentsResponse,
    ListPartitionsResponse,
    GetAvailableIdsResponse,
    SubscribeToPartitionContentsRequest, LionWebId,
} from "@lionweb/server-delta-shared"
import { type ReceivingDelta } from "@lionweb/server-delta-client"
import type { FreModelUnit } from "../../ast/index.js"
import { FREON } from "../../environment/index.js"
import { FreLogger } from "../../logging/index.js"
import { FreLionwebSerializer } from "../serializer/index.js"

const LOGGER = new FreLogger("FreonResponseEvents")

const SubscribeToChangingPartitionsResponseFunction = (msg: SubscribeToChangingPartitionsResponse): void => {
    LOGGER.log("Called SubscribeToChangingPartitionsResponseFunction " + msg.messageKind)
}

const SubscribeToPartitionContentsResponseFunction = (msg: SubscribeToPartitionContentsResponse): void => {
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

const UnsubscribeFromPartitionContentsResponseFunction = (msg: UnsubscribeFromPartitionContentsResponse): void => {
    LOGGER.log("Called UnsubscribeFromPartitionContentsResponseFunction " + msg.messageKind)
}

const ListPartitionsResponseFunction = (msg: ListPartitionsResponse): void => {
    LOGGER.log("Called ListPartitionsResponseFunction " + msg.messageKind)
    for (const partition of msg.partitions.nodes) {
        const subscribe: SubscribeToPartitionContentsRequest = {
            messageKind: "SubscribeToPartitionContentsRequest",
            queryId: "subscribe",
            partition: partition.id,
            additionalInfos: [],
        }
        FREON.deltaClient.deltaApiClient.sendRequest(subscribe)
    }
}

type IdHandler = (ids: LionWebId[]) => void
let setAvailableIds: IdHandler = (_ids: LionWebId[]) => { };
export function setAvailableIdsHandler(handler: IdHandler): void {
    setAvailableIds = handler
}
const GetAvailableIdsResponseFunction = (msg: GetAvailableIdsResponse): void => {
    LOGGER.log("Called GetAvailableIdsResponseFunction " + msg.ids)
    setAvailableIds(msg.ids)
}

export const queryResponseFunctions: ReceivingDelta[] = [
    {
        messageKind: "ListPartitionsResponse",
        // @ts-expect-error TS2322
        processor: ListPartitionsResponseFunction,
    },
    {
        messageKind: "GetAvailableIdsResponse",
        // @ts-expect-error TS2322
        processor: GetAvailableIdsResponseFunction,
    },
    {
        messageKind: "SubscribeToChangingPartitionsResponse",
        // @ts-expect-error TS2322
        processor: SubscribeToChangingPartitionsResponseFunction,
    },
    {
        messageKind: "SubscribeToPartitionContentsResponse",
        // @ts-expect-error TS2322
        processor: SubscribeToPartitionContentsResponseFunction,
    },
    {
        messageKind: "UnsubscribeFromPartitionContentsResponse",
        // @ts-expect-error TS2322
        processor: UnsubscribeFromPartitionContentsResponseFunction,
    },
]
