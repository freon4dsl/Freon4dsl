import type { GetAvailableIdsRequest, LionWebId } from "@lionweb/server-delta-shared"
import { FREON } from "../../environment/index.js"
import { type IdProvider } from "../../util/index.js"
import { setAvailableIdsHandler } from "../lionweb-delta/FreonQueryResponses.js"
import { v4 as uuidv4 } from "uuid"

export class LionwebDeltaIdProvider implements IdProvider {
    constructor() {
        this.availableIds = []
        setAvailableIdsHandler(this.setIds)
    }

    public sendIdRequest(): void {
        console.log(`sendIdRequest`)
        const getIdRequest: GetAvailableIdsRequest = {
            messageKind: "GetAvailableIdsRequest",
            queryId: "whatever",
            count: 400,
            additionalInfos: [],
        }
        this.queryRunning = true
        FREON.deltaClient.deltaApiClient.sendRequest(getIdRequest)
    }

    queryRunning: boolean = false
    newId(): string {
        if (this.availableIds.length < 100 && !this.queryRunning) {
            this.sendIdRequest()
        }
        if (this.availableIds.length > 0) {
            return this.availableIds.pop()
        } else {
            // Use a local created id, using uuid, so it is hopefully unique.
            return "LOCALID-" + uuidv4()
        }
    }

    usedId(_id: string): void {}

    availableIds: string[] = []

    setIds = (ids: LionWebId[]): void => {
        console.log(`IDS = '${this.availableIds}'`)
        for (const id of ids) {
            this.availableIds.push(id)
        }
        this.queryRunning = false
    }

    reset() {}
}
