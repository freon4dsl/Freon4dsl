import type { LionWebJsonChunk, LionWebJsonNode, LionWebJsonUsedLanguage, LionWebSerializationFormatVersion } from "@lionweb/json"

export function isLionWebJsonChunk(object: any): object is LionWebJsonChunk {
    const cnk = object as LionWebJsonChunk
    return cnk.serializationFormatVersion !== undefined && cnk.languages !== undefined && cnk.nodes !== undefined
}

// export function isLionWebJsonChunk(value: unknown): value is LionWebJsonChunk {
//     if (typeof value !== "object" || value === null || Array.isArray(value)) {
//         return false
//     }
//
//     const candidate = value as Record<string, unknown>
//
//     if (!isLionWebSerializationFormatVersion(candidate.serializationFormatVersion) || !Array.isArray(candidate.languages) || !Array.isArray(candidate.nodes)) {
//         return false
//     }
//
//     return candidate.languages.every((language) => isLionWebJsonUsedLanguage(language)) && candidate.nodes.every((node) => isLionWebJsonNode(node))
// }

export function isLionWebSerializationFormatVersion(value: unknown): value is LionWebSerializationFormatVersion {
    return typeof value === "string"
}

export function isLionWebJsonUsedLanguage(value: unknown): value is LionWebJsonUsedLanguage {
    // todo other type than string?
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
        return false
    }

    const candidate = value as Record<string, unknown>

    return typeof candidate.key === "string" && typeof candidate.version === "string"
}

export function isLionWebJsonNode(value: unknown): value is LionWebJsonNode {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
        return false
    }

    const candidate = value as Record<string, unknown>

    return (
        typeof candidate.id === "string" &&
        isLionWebMetaPointer(candidate.classifier) &&
        Array.isArray(candidate.properties) &&
        Array.isArray(candidate.containments) &&
        Array.isArray(candidate.references) &&
        Array.isArray(candidate.annotations) &&
        (candidate.parent === null || typeof candidate.parent === "string")
    )
}

export function isLionWebMetaPointer(value: unknown): boolean {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
        return false
    }

    const candidate = value as Record<string, unknown>

    return typeof candidate.language === "string" && typeof candidate.version === "string" && typeof candidate.key === "string"
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
