import { type FreNode, notNullOrUndefined } from "@freon4dsl/core"
import { WebappConfigurator } from "$lib/language"

export function goToNode(nodes: FreNode | FreNode[] | undefined) {
    if (notNullOrUndefined(nodes)) {
        if (Array.isArray(nodes)) {
            WebappConfigurator.getInstance().selectElement(nodes[0]);
        } else {
            WebappConfigurator.getInstance().selectElement(nodes);
        }
    }
}
