import type { FreEditPropertyProjection } from "./internal.js";
import { FreEditClassifierProjection } from "./internal.js";

/**
 * A table projection for a concept or interface
 */
export class FreEditTableProjection extends FreEditClassifierProjection {
    headers: string[] = [];
    cells: FreEditPropertyProjection[] = [];

    /**
     * Find all projections or parts.
     */
    findAllPartProjections(): FreEditPropertyProjection[] {
        return this.cells;
    }

    toString() {
        return `${this.classifier?.name} {
        table [
        ${this.headers.map((head) => `"${head}"`).join(" | ")}
        ${this.cells.map((it) => it.toString()).join(" | ")}
        ]}`;
    }
}
