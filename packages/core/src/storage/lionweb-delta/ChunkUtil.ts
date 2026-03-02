import type { LionWebJsonChunk } from "@lionweb/json"
import type { LionWebDeltaJsonChunk } from "@lionweb/server-delta-shared"
import { collectUsedLanguages } from "../server/index.js"

export class ChunkUtil {
    static deltaChunkToChunk(deltaChunk: LionWebDeltaJsonChunk): LionWebJsonChunk {
        return {
            nodes: deltaChunk.nodes,
            languages: collectUsedLanguages(deltaChunk.nodes),
            serializationFormatVersion: "2023.1"
        }
    }
}
