import type { LionWebJsonChunk } from "@lionweb/json"
import type { LionWebDeltaJsonChunk } from "@lionweb/server-delta-shared"
import { collectUsedLanguages, SerializationFormatVersion } from "../utils/index.js"

export class ChunkUtil {
    static deltaChunkToChunk(deltaChunk: LionWebDeltaJsonChunk): LionWebJsonChunk {
        return {
            nodes: deltaChunk.nodes,
            languages: collectUsedLanguages(deltaChunk.nodes),
            serializationFormatVersion: SerializationFormatVersion
        }
    }
}
