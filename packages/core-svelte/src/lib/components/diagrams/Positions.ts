import { AST, Box, FreEditor, FreNode, isNullOrUndefined } from "@freon4dsl/core"
import { DiagramPosition } from "@freon4dsl/samples-example/dist/language/gen/index.js"
import { type NodeBase } from "@xyflow/system"

export type NodeWithBox = NodeBase<{ box: Box; editor: FreEditor }>

export class PositionsHelper {
    static saveNodePositions(nodes: NodeWithBox[]): void {
        console.log("PositionsHelper")
        nodes.forEach((node) => {
            const position = PositionsHelper.findOrCreatePosition(node.data.box.node, node.position.x, node.position.y)
            if (position.x !== node.position.x || position.y !== node.position.y) {
                // console.log(`PositionsHelper: New position for ${node.data.box.node.freId()}: x ${node.position.x} y ${node.position.y}`)
                position.x = node.position.x
                position.y = node.position.y
            }
        })
    }

    static findOrCreatePosition(freNode: FreNode, posX: number, posY: number): DiagramPosition {
        let positionAvailable = false
        let x = posX
        let y = posY
        // Find current position in annotations
        const anns = freNode["annotations"] as FreNode[]
        if (!isNullOrUndefined(anns)) {
            const position = anns.find((ann) => ann.freLanguageConcept() === "DiagramPosition")
            if (!isNullOrUndefined(position)) {
                const diagramPosition = position as DiagramPosition
                x = diagramPosition.x
                y = diagramPosition.y
                positionAvailable = true
                // console.log(`Position found for ${freNode.freId()}: x ${x} y ${y}`)
                return diagramPosition
            }
        }
        if (!positionAvailable) {
            const newP = new DiagramPosition()
            // console.log(`Position created for ${freNode.freId()}: x ${x} y ${y}`)
            AST.changeNamed("add diagram position", () => {
                newP.x = x
                newP.y = y
                ;(freNode["annotations"] as FreNode[]).push(newP)
            })
            return newP
        }
    }
}
