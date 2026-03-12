import { DeltaClient } from "@lionweb/server-delta-client"
import { wait } from "../../editor/index.js"
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
        this._deltaApiClient.loggingOn = true
        this.connect()
        wait(2000)
    }

    async connect(): Promise<void> {
        console.log(">>>>>>>>> connecting ")
        await this.deltaApiClient.connect()
        console.log("<<<<<<<<< connecting ")
    }
}
