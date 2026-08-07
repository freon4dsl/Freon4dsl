import type {
    Custom_ListRepositoriesAdminResponse,
    Custom_CreateRepositoryAdminResponse,
    Custom_DeleteRepositoryAdminResponse,
} from "@lionweb/server-delta-shared"
import { type ReceivingDelta } from "@lionweb/server-delta-client"
import { FreLogger } from "../../logging/index.js"

const LOGGER = new FreLogger("FreonResponseEvents")

const ListRepositoriesAdminResponseFunction = (msg: Custom_ListRepositoriesAdminResponse): void => {
    LOGGER.log("Called ListRepositoriesAdminResponseFunction " + msg.messageKind)
}

const CreateRepositoryAdminResponseFunction = (msg: Custom_CreateRepositoryAdminResponse): void => {
    LOGGER.log("Running CreateRepositoryAdminResponseFunction " + JSON.stringify(msg))
}

const DeleteRepositoryAdminResponseFunction = (msg: Custom_DeleteRepositoryAdminResponse): void => {
    LOGGER.log("Called DeleteRepositoryAdminResponseFunction " + msg.messageKind)
}

export const adminResponseFunctions: ReceivingDelta[] = [
    {
        messageKind: "Custom_ListRepositoriesAdminResponse",
        // @ts-expect-error TS2322
        processor: ListRepositoriesAdminResponseFunction,
    },
    {
        messageKind: "Custom_CreateRepositoryAdminResponse",
        // @ts-expect-error TS2322
        processor: CreateRepositoryAdminResponseFunction,
    },
    {
        messageKind: "Custom_DeleteRepositoryAdminResponse",
        // @ts-expect-error TS2322
        processor: DeleteRepositoryAdminResponseFunction,
    },
]
