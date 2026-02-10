import type { ListRepositoriesAdminResponse, CreateRepositoryAdminResponse, DeleteRepositoryAdminResponse } from "@lionweb/server-delta-shared"
import { type ReceivingDelta } from "@lionweb/server-delta-client"
import { FreLogger } from "../../logging/index.js"

const LOGGER = new FreLogger("FreonResponseEvents")

const ListRepositoriesAdminResponseFunction = (msg: ListRepositoriesAdminResponse): void => {
    LOGGER.log("Called ListRepositoriesAdminResponseFunction " + msg.messageKind)
}

const CreateRepositoryAdminResponseFunction = (msg: CreateRepositoryAdminResponse): void => {
    LOGGER.log("Running CreateRepositoryAdminResponseFunction " + JSON.stringify(msg))
}

const DeleteRepositoryAdminResponseFunction = (msg: DeleteRepositoryAdminResponse): void => {
    LOGGER.log("Called DeleteRepositoryAdminResponseFunction " + msg.messageKind)
}

export const adminResponseFunctions: ReceivingDelta[] = [
    {
        messageKind: "ListRepositoriesAdminResponse",
        // @ts-expect-error TS2322
        processor: ListRepositoriesAdminResponseFunction,
    },
    {
        messageKind: "CreateRepositoryAdminResponse",
        // @ts-expect-error TS2322
        processor: CreateRepositoryAdminResponseFunction,
    },
    {
        messageKind: "DeleteRepositoryAdminResponse",
        // @ts-expect-error TS2322
        processor: DeleteRepositoryAdminResponseFunction,
    },
]
