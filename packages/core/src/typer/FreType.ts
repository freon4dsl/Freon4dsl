import { FreWriter } from "../writer";
import { FreNode } from "../ast";

export interface FreType {
    /**
     * Holds the name of the class of the type, i.e. the meta name.
     */
    readonly $typename: string;

    /**
     * If this type corresponds with an element from the AST, then the corresponding element is returned.
     * Otherwise, the result is null.
     */
    toAstElement(): FreNode;

    /**
     * Returns a human-readable rendering of this type.
     * @param writer The writer to use for the rendering of AST elements
     */
    toFreString(writer: FreWriter): string;

    copy(): FreType;
}
