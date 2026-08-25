import { FreMetaExpressionConcept } from "./internal.js"

export class FreMetaBinaryExpressionConcept extends FreMetaExpressionConcept {
    // left: FreExpressionConcept;
    // right: FreExpressionConcept;
    priority: number = -1

    getPriority(): number {
        const p = this.priority
        return !!p ? p : -1
    }
}
