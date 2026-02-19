import type { DeltaEvent } from "@lionweb/server-delta-shared"
import type { FreNode } from "../../ast/index.js"

export class ProcessedDelta {
    delta: DeltaEvent
    originalNode: FreNode
    changedNode: FreNode
}

export class ProcessedDeltaList {
    deltas: ProcessedDelta[]
    
    deltaProcessed: (p : ProcessedDelta) => void = () => {}
    
    add(processedDelta: ProcessedDelta): void {
        this.deltas.push(processedDelta)
        this.deltaProcessed(processedDelta)
    }
}
