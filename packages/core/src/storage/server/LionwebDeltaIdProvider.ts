import type { GetAvailableIdsRequest, LionWebId } from "@lionweb/server-delta-shared"
import { FREON } from "../../environment/index.js"
import { type IdProvider } from "../../util/index.js"
import { setAvailableIdsHandler } from "../lionweb-delta/FreonQueryResponses.js"

export class LionwebDeltaIdProvider implements IdProvider {
    
    constructor() {
        this.availableIds = []
        setAvailableIdsHandler(this.setIds)
        this.sendIdRequest()
    }
    
    public sendIdRequest() {
        console.log(`sendIdRequest`)
        const getIdRequest: GetAvailableIdsRequest = {
            messageKind: "GetAvailableIdsRequest",
            queryId: "whatever",
            count: 400,
            additionalInfos: []
        }
        this.queryRunning = true
        FREON.deltaClient.deltaApiClient.sendRequest(getIdRequest)
    }

    localNumber: number = 0
    queryRunning: boolean = false
    newId(): string {
        if (this.availableIds.length < 100  && !this.queryRunning) {
            this.sendIdRequest()
        }
        if (this.availableIds.length > 0) {
            return this.availableIds.pop()
        } else {
            return "LOCALID-" + this.localNumber++
        }
    }

    usedId(_id: string): void {}

    availableIds: string[] = [];
    
    setIds = (ids: LionWebId[]): void => {
        console.log(`IDS = '${this.availableIds}'`)
        for(const id of ids) {
            this.availableIds.push(id)
        }
        this.queryRunning = false
    }
}
