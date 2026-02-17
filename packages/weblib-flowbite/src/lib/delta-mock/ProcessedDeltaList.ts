import type { FreNode } from "@freon4dsl/core"
import  { type DeltaEvent  } from "./types"
import { WebappConfigurator } from "$lib/language/WebappConfigurator"

export type ProcessedDelta = {
    delta: DeltaEvent
    originalNode: FreNode | undefined
    changedNode: FreNode | undefined
}

class ProcessedDeltaList {
    deltas: ProcessedDelta[] = [];

    /**
     * Callback used to notify that a new Delta has been added to the list
     */
    deltaProcessed: (p : ProcessedDelta) => void = () => {}
    
    add(processedDelta: ProcessedDelta): void {
        this.deltas.push(processedDelta)
        this.deltaProcessed(processedDelta)
    }
}

export const deltaList = new ProcessedDeltaList();

export function mockDeltaList() {
    deltaList.add({
        delta: {
            messageKind: "PropertyChanged",
            sequenceNumber: 101,
            originCommands: [],
            additionalInfo: []
        },
        originalNode: undefined,
        changedNode: undefined
    })
    deltaList.add({
        delta: {
            messageKind: "ChildAdded",
            sequenceNumber: 102,
            originCommands: [],
            additionalInfo: [],
        },
        originalNode: undefined,
        changedNode: undefined,
    })
}
