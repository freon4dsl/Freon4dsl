import type { QueryId } from "./DeltaTypes.js";
import type { String } from "./DeltaTypes.js";
import type { AdditionalInfo } from "./DeltaTypes.js";
import type { Boolean } from "./DeltaTypes.js";
import type { Number } from "./DeltaTypes.js";
import type { LionWebId } from "./Chunks.js";
import type { ClientId } from "./DeltaTypes.js";
import type { ParticipationId } from "./DeltaTypes.js";
import type { SequenceNumber } from "./DeltaTypes.js";

// The overall "super-type"
export type DeltaRequest = {
    queryId: QueryId;
    messageKind: RequestMessageKind;
    additionalInfo: AdditionalInfo[];
};

/**
 *  @see https://lionWeb.io/specification/delta/delta-api.html#qry-InformAboutChangingPartitions
 */
export type InformAboutChangingPartitionsRequest = DeltaRequest & {
    creation: Boolean;
    deletion: Boolean;
    depthLimit: Number;
    messageKind: "InformAboutChangingPartitionsRequest";
};

/**
 *  @see https://lionWeb.io/specification/delta/delta-api.html#qry-SubscribeToChangingPartitions
 */
export type SubscribeToChangingPartitionsRequest = DeltaRequest & {
    creation: Boolean;
    deletion: Boolean;
    messageKind: "SubscribeToChangingPartitionsRequest";
};

/**
 *  @see https://lionWeb.io/specification/delta/delta-api.html#qry-SubscribeToPartitionContents
 */
export type SubscribeToPartitionContentsRequest = DeltaRequest & {
    partition: LionWebId;
    messageKind: "SubscribeToPartitionContentsRequest";
};

/**
 *  @see https://lionWeb.io/specification/delta/delta-api.html#qry-UnsubscribeFromPartitionContents
 */
export type UnsubscribeFromPartitionContentsRequest = DeltaRequest & {
    partition: LionWebId;
    messageKind: "UnsubscribeFromPartitionContentsRequest";
};

/**
 *  @see https://lionWeb.io/specification/delta/delta-api.html#qry-SignOn
 */
export type SignOnRequest = DeltaRequest & {
    deltaProtocolVersion: String;
    clientId: ClientId;
    repositoryId: String;
    messageKind: "SignOnRequest";
};

/**
 *  @see https://lionWeb.io/specification/delta/delta-api.html#qry-SignOff
 */
export type SignOffRequest = DeltaRequest & {
    messageKind: "SignOffRequest";
};

/**
 *  @see https://lionWeb.io/specification/delta/delta-api.html#qry-Reconnect
 */
export type ReconnectRequest = DeltaRequest & {
    participationId: ParticipationId;
    lastReceivedSequenceNumber: SequenceNumber;
    messageKind: "ReconnectRequest";
};

/**
 *  @see https://lionWeb.io/specification/delta/delta-api.html#qry-GetAvailableIds
 */
export type GetAvailableIdsRequest = DeltaRequest & {
    count: Number;
    messageKind: "GetAvailableIdsRequest";
};

/**
 *  @see https://lionWeb.io/specification/delta/delta-api.html#qry-ListPartitions
 */
export type ListPartitionsRequest = DeltaRequest & {
    messageKind: "ListPartitionsRequest";
};

// The type for the tagged union property
export type RequestMessageKind =
    | "InformAboutChangingPartitionsRequest"
    | "SubscribeToChangingPartitionsRequest"
    | "SubscribeToPartitionContentsRequest"
    | "UnsubscribeFromPartitionContentsRequest"
    | "SignOnRequest"
    | "SignOffRequest"
    | "ReconnectRequest"
    | "GetAvailableIdsRequest"
    | "ListPartitionsRequest";

// Type Guard function
export function isDeltaRequest(object: unknown): object is DeltaRequest {
    const castObject = object as DeltaRequest;
    return (
        castObject.messageKind !== undefined &&
        [
            "InformAboutChangingPartitionsRequest",
            "SubscribeToChangingPartitionsRequest",
            "SubscribeToPartitionContentsRequest",
            "UnsubscribeFromPartitionContentsRequest",
            "SignOnRequest",
            "SignOffRequest",
            "ReconnectRequest",
            "GetAvailableIdsRequest",
            "ListPartitionsRequest",
        ].includes(castObject.messageKind)
    );
}
