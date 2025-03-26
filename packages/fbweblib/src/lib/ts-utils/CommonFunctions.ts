import type { FreNode } from "@freon4dsl/core"

export function goToNode(node: FreNode | FreNode[]) {
    if (Array.isArray(node)) {
        console.log(`gotoNode: ${node[0]?.freId()}`)
    } else {
        console.log(`gotoNode: ${node.freId()}`)
    }
}
