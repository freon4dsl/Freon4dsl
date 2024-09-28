import { FreNode } from "../ast/index.js";
import { Box } from "./boxes/index.js";

export type FreTableDefinition = {
    headers: string[];
    cells: ((e: FreNode) => Box)[];
};
