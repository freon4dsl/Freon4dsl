import type { PartitionAddedEvent, PartitionDeletedEvent } from "@lionweb/server-delta-shared"
import { type ReceivingDelta } from "@lionweb/server-delta-client"
import type { FreModelUnit } from "../../ast/index.js"
import { FREON } from "../../environment/index.js"
import { FreLogger } from "../../logging/index.js"
import { FreLionWebDeserializer } from "../serializer/index.js"
import { ChunkUtil } from "./ChunkUtil.js"

const LOGGER = new FreLogger("FreonPropertyEvents")

const PartitionAddedFunction = (msg: PartitionAddedEvent): void => {
    LOGGER.log("Called PartitionAddedFunction " + msg.messageKind)
    // TODO Put a check on the `as FreModelUnit`
    FREON.modelManager.model.addUnit(FreLionWebDeserializer.getInstance().deserializeFreNode(ChunkUtil.deltaChunkToChunk(msg.newPartition)) as FreModelUnit)
}

const PartitionDeletedFunction = (msg: PartitionDeletedEvent): void => {
    // FREON.modelManager.model.
    LOGGER.log("Not Implemented Yet: PartitionDeletedFunction " + msg.messageKind)
}

export const partitionEventFunctions: ReceivingDelta[] = [
    {
        messageKind: "PartitionAdded",
        // @ts-expect-error TS2322
        processor: PartitionAddedFunction,
    },
    {
        messageKind: "PartitionDeleted",
        // @ts-expect-error TS2322
        processor: PartitionDeletedFunction,
    },
]
