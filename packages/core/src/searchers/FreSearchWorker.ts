import type { FreNode } from "../ast/index.js";
import type { AstWorker } from "../ast-utils/index.js";

export interface FreSearchWorker extends AstWorker {
    result: FreNode[];
}
