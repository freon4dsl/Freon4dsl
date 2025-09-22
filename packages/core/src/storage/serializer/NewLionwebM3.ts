// import { LionWebJsonMetaPointer, LwJsonUsedLanguage } from "@lionweb/validation";

import type { LionWebJsonChunk, LionWebJsonNode } from "@lionweb/json";

export function isLionWebJsonChunk(object: any): object is LionWebJsonChunk {
    const cnk = object as LionWebJsonChunk;
    return cnk.serializationFormatVersion !== undefined && cnk.languages !== undefined && cnk.nodes !== undefined;
}

export function createLionWebJsonNode(): LionWebJsonNode {
    return {
        id: null,
        classifier: null,
        properties: [],
        containments: [],
        references: [],
        annotations: [],
        parent: null,
    };
}
