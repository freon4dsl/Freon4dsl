import type { FreNode } from "../ast/index.js";
import type { Box } from "./boxes/index.js";

export type FreTableDefinition = {
    headers: string[];
    cells: ((e: FreNode) => Box)[];
};
