import type { QueryId } from "./DeltaTypes.js";
import type { String } from "./DeltaTypes.js";
import type { AdditionalInfo } from "./DeltaTypes.js";

// The overall "super-type"
export type DeltaAdminRequest = {
    queryId: QueryId;
    messageKind: AdminRequestMessageKind;
    additionalInfo: AdditionalInfo[];
};

/**
 *  @see unknown-ListRepositories
 */
export type ListRepositoriesAdminRequest = DeltaAdminRequest & {
    messageKind: "ListRepositoriesAdminRequest";
};

/**
 *  @see unknown-CreateRepository
 */
export type CreateRepositoryAdminRequest = DeltaAdminRequest & {
    repositoryName: String;
    messageKind: "CreateRepositoryAdminRequest";
};

/**
 *  @see unknown-DeleteRepository
 */
export type DeleteRepositoryAdminRequest = DeltaAdminRequest & {
    repositoryName: String;
    messageKind: "DeleteRepositoryAdminRequest";
};

/**
 *  @see unknown-RenameRepository
 */
export type RenameRepositoryAdminRequest = DeltaAdminRequest & {
    repositoryName: String;
    messageKind: "RenameRepositoryAdminRequest";
};

// The type for the tagged union property
export type AdminRequestMessageKind =
    | "ListRepositoriesAdminRequest"
    | "CreateRepositoryAdminRequest"
    | "DeleteRepositoryAdminRequest"
    | "RenameRepositoryAdminRequest";

// Type Guard function
export function isDeltaAdminRequest(object: unknown): object is DeltaAdminRequest {
    const castObject = object as DeltaAdminRequest;
    return (
        castObject.messageKind !== undefined &&
        ["ListRepositoriesAdminRequest", "CreateRepositoryAdminRequest", "DeleteRepositoryAdminRequest", "RenameRepositoryAdminRequest"].includes(
            castObject.messageKind,
        )
    );
}
