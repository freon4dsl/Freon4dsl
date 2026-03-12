import type { DeltaEvent } from "@lionweb/server-delta-shared"
import type { FreNode } from "../../ast/index.js"

export type ProcessedDelta = {
    delta: DeltaEvent
    originalNode: FreNode | undefined
    changedNode: FreNode | undefined
    nodeName?: string
    propertyName?: string
    propertyIndex?: number
}

class ProcessedDeltaList {
    deltas: ProcessedDelta[] = []

    /**
     * Callback used to notify that a new Delta has been added to the list
     */
    deltaProcessed: (p: ProcessedDelta) => void = () => {}

    add(processedDelta: ProcessedDelta): void {
        this.deltas.push(processedDelta)
        this.deltaProcessed(processedDelta)
    }
}
 
/**
 * Converts a ProcessedDelta into a human-readable description.
 *
 * Format:
 *   "<Message kind> on <Node name>: <PropertyName>[index]"
 *
 * Examples:
 *   "Property changed on Task A: Availability[7]"
 *   "Node created on Customer"
 *   "Child removed on Order: Parts"
 *
 * Notes:
 * - The messageKind is converted from camel case (e.g. "PropertyChanged")
 *   into a spaced, capitalized sentence ("Property changed").
 * - The node name is only included if present.
 * - The property name and index are only included if present.
 * - No trailing punctuation is added when optional parts are missing.
 */
export function processedDeltaAsString(d: ProcessedDelta): string {
    const rawKind = d.delta.messageKind.toString()

    // Insert space before capital letters (camelCase → spaced)
    const spaced = rawKind.replace(/([a-z])([A-Z])/g, "$1 $2")

    // Capitalise first letter, lowercase the rest
    const kind = spaced.charAt(0).toUpperCase() + spaced.slice(1).toLowerCase()

    const nodePart = d.nodeName ? ` on ${d.nodeName}` : ""

    let propertyPart = ""
    if (d.propertyName) {
        const indexPart = d.propertyIndex !== undefined ? `[${d.propertyIndex}]` : ""
        propertyPart = `: ${d.propertyName}${indexPart}`
    }

    return `${kind}${nodePart}${propertyPart}`
}

export const deltaList = new ProcessedDeltaList()
