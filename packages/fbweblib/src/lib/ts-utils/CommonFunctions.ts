import type { FreNode } from "@freon4dsl/core"
import { WebappConfigurator } from "$lib/language"

export function goToNode(nodes: FreNode | FreNode[] | undefined) {
    if (!!nodes) {
        if (Array.isArray(nodes)) {
            WebappConfigurator.getInstance().selectElement(nodes[0]);
        } else {
            WebappConfigurator.getInstance().selectElement(nodes);
        }
    }
}
