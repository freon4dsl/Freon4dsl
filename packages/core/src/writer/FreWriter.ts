import { FreNode } from "../ast";

// Part of the Freon Framework.
export interface FreWriter {
    /**
     * Returns a string representation of 'node'.
     * If 'short' is present and true, then a single-line result will be given.
     * Otherwise, the result is always a multi-line string.
     * Note that the single-line-string cannot be parsed into a correct model.
     *
     * @param node
     * @param startIndent
     * @param short
     */
    writeToString(node: FreNode, startIndent?: number, short?: boolean): string;

    /**
     * Returns a string representation of 'node', divided into an array of strings,
     * each of which contain a single line (without newline).
     * If 'short' is present and true, then a single-line result will be given.
     * Otherwise, the result is always a multi-line string.
     *
     * @param node
     * @param startIndent
     * @param short
     */
    writeToLines(node: FreNode, startIndent?: number, short?: boolean): string[];

    /**
     * Returns the name of 'node' if it has one, else returns
     * a short unparsing of 'node'.
     * Used by the validator to produce readable error messages.
     *
     * @param node
     */
    writeNameOnly(node: FreNode): string;
}
