import { FreNode } from "../ast";
import { Box } from "./boxes";

export type FreTableDefinition = {
    headers: string[];
    cells: ((e: FreNode) => Box)[];
};
