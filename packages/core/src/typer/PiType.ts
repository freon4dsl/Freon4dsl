import { PiWriter } from "../writer";
import { PiElement } from "../ast";

export interface PiType {
    /**
     * Holds the name of the class of the type, i.e. the meta name.
     */
    readonly $typename: string;

    /**
     * If this type corresponds with an element from the AST, then the corresponding element is returned.
     * Otherwise the result is null.
     */
    toAstElement(): PiElement;

    /**
     * Returns a human-readable rendering of this type.
     * @param writer The writer to use for the rendering of AST elements
     */
    toPiString(writer: PiWriter): string;

    copy(): PiType;
}
