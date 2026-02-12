import { DeltaClient } from "@lionweb/server-delta-client"
import { adminResponseFunctions } from "./FreonAdminResponses.js"
import { childEventFunctions } from "./FreonChildEvents.js"
import { partitionEventFunctions } from "./FreonPartitionEvents.js"
import { propertyEventFunctions } from "./FreonPropertyEvents.js"
import { queryResponseFunctions } from "./FreonQueryResponses.js"
import { referenceEventFunctions } from "./FreonReferenceEvents.js"

export class FreonDeltaClient {
    private _deltaApiClient: DeltaClient
    get deltaApiClient(): DeltaClient {
        return this._deltaApiClient
    }

    constructor() {
        this._deltaApiClient = new DeltaClient({}, [
            propertyEventFunctions,
            childEventFunctions,
            partitionEventFunctions,
            queryResponseFunctions,
            adminResponseFunctions,
            referenceEventFunctions
        ])
        this.connect()
    }

    async connect(): Promise<void> {
        await this.deltaApiClient.connect()
    }
}
