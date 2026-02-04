import type {
    ListRepositoriesAdminResponse,
    CreateRepositoryAdminResponse,
    DeleteRepositoryAdminResponse,
} from "@lionweb/server-delta-shared"
import { type ReceivingDelta } from "@lionweb/server-delta-client"
import { FreLogger } from "../../logging/index.js"

const LOGGER = new FreLogger("FreonResponseEvents")

export class FreonAdminResponses     {
    constructor() {}

    ListRepositoriesAdminResponseFunction = (msg: ListRepositoriesAdminResponse): void => {
        LOGGER.log("Called ListRepositoriesAdminResponseFunction " + msg.messageKind)
    }

    CreateRepositoryAdminResponseFunction = (msg: CreateRepositoryAdminResponse): void => {
        LOGGER.log("Running CreateRepositoryAdminResponseFunction " + JSON.stringify(msg))
    }

    DeleteRepositoryAdminResponseFunction = (msg: DeleteRepositoryAdminResponse): void => {
        LOGGER.log("Called DeleteRepositoryAdminResponseFunction " + msg.messageKind)
    }

    eventFunctions: ReceivingDelta[] = [
        {
            messageKind: "ListRepositoriesAdminResponse",
            // @ts-expect-error TS2322
            processor: this.ListRepositoriesAdminResponseFunction,
        },
        {
            messageKind: "CreateRepositoryAdminResponse",
            // @ts-expect-error TS2322
            processor: this.CreateRepositoryAdminResponseFunction,
        },
        {
            messageKind: "DeleteRepositoryAdminResponse",
            // @ts-expect-error TS2322
            processor: this.DeleteRepositoryAdminResponseFunction,
        }
    ]
}
