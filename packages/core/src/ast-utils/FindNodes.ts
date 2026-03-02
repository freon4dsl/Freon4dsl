import type { LionWebId } from "@lionweb/json"
import { type FreNode } from "../ast/index.js"
import { AstWalker, type AstWorker } from "../ast-utils/index.js"

/**
 * AST worker that updates the referenced name per node.
 * This worker is used in ReferenceUpdateManager when walking the AST.
 */
class FindNodesWorker implements AstWorker {
    private id: LionWebId
    node: FreNode

    constructor(id: LionWebId) {
        this.id = id
    }

    execBefore(node: FreNode): boolean {
        if (node.freId() === this.id) {
            this.node = node
        }
        return true
    }

    // parameter is present to adhere to signature of super class
    execAfter(_node: FreNode): boolean {
        return false
    }
}

/**
 * This simply navigates the full tree, can be made much faster by keeping a map
 * from node-id to node.
 * @param id
 * @param root
 */
export function findNode(id: LionWebId, root: FreNode) {
    const worker = new FindNodesWorker(id)
    const walker = new AstWalker()
    walker.myWorkers.push(worker)
    walker.walk(root)
    return worker.node
}
