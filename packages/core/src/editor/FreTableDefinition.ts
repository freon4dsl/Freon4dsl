import { FreNode } from "../ast";
import { Box } from "./boxes/index";

export type FreTableDefinition = {
    headers: string[];
    cells: ((e: FreNode) => Box)[];
}
