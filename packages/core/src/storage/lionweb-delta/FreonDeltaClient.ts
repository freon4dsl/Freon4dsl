import { DeltaClient } from "@lionweb/server-delta-client"
import { FreonChildEvents } from "./FreonChildEvents.js"
import { FreonPropertyEvents } from "./FreonPropertyEvents.js"
import { FreonResponseEvents } from "./FreonResponseEvents.js"

export class FreonDeltaClient {
    private _deltaApiClient: DeltaClient
    get deltaApiClient(): DeltaClient {
        return this._deltaApiClient
    }

    constructor() {
        const propertyEvents = new FreonPropertyEvents()
        const childEvents = new FreonChildEvents()
        const responseEvents = new FreonResponseEvents()
        this._deltaApiClient = new DeltaClient({}, [
            propertyEvents.eventFunctions,
            childEvents.eventFunctions,
            responseEvents.eventFunctions
        ])
    }

    async connect(): Promise<void> {
        await this.deltaApiClient.connect()
    }
}
