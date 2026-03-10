import { type FreNode, notNullOrUndefined } from "@freon4dsl/core"
import { WebappConfigurator } from "$lib/language"

export function goToNode(nodes: FreNode | FreNode[] | undefined) {
    if (!nodes) return
    if (Array.isArray(nodes)) {
        if (notNullOrUndefined(nodes[0])) {
            WebappConfigurator.getInstance().selectElement(nodes[0])
        }
    } else {
        WebappConfigurator.getInstance().selectElement(nodes)
    }
}
