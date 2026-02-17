import { type String } from "./DeltaTypes.js";
import { type KeyValuePair } from "./DeltaTypes.js";

export type LionWebId = string;
export type LionWebKey = string;
export type LionWebVersion = string;
export type LionWebSerializationFormatVersion = string;

export type LionWebJsonMetaPointer = {
    key: LionWebKey;
    version: LionWebVersion;
    language: LionWebKey;
};

export type ResponseMessage = {
    kind: String;
    message: String;
    data?: KeyValuePair | null;
};

export type LionWebJsonChunk = {
    serializationFormatVersion: LionWebSerializationFormatVersion;
    languages: LionWebJsonUsedLanguage[];
    nodes: LionWebJsonNode[];
};

export type LionWebJsonUsedLanguage = {
    key: LionWebKey;
    version: LionWebVersion;
};

export type LionWebJsonNode = {
    id: LionWebId;
    classifier: LionWebJsonMetaPointer;
    properties: LionWebJsonProperty[];
    containments: LionWebJsonContainment[];
    references: LionWebJsonReference[];
    annotations: LionWebId[];
    parent: LionWebId | null;
};

export type LionWebJsonProperty = {
    property: LionWebJsonMetaPointer;
    value: String | null;
};

export type LionWebJsonContainment = {
    containment: LionWebJsonMetaPointer;
    children: LionWebId[];
};

export type LionWebJsonReference = {
    reference: LionWebJsonMetaPointer;
    targets: LionWebJsonReferenceTarget[];
};

export type LionWebJsonReferenceTarget = {
    resolveInfo: String ;
    reference: LionWebId | null;
} | {
    resolveInfo: String | null;
    reference: LionWebId;
};
