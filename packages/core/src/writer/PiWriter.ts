import { PiElement } from "../language";

// Part of the ProjectIt Framework.
export interface PiWriter {

    /**
     * Returns a string representation of 'modelelement'.
     * If 'short' is present and true, then a single-line result will be given.
     * Otherwise, the result is always a multi-line string.
     * Note that the single-line-string cannot be parsed into a correct model.
     *
     * @param modelelement
     * @param startIndent
     * @param short
     */
    writeToString(modelelement: PiElement, startIndent?: number, short?: boolean): string;

    /**
     * Returns a string representation of 'modelelement', divided into an array of strings,
     * each of which contain a single line (without newline).
     * If 'short' is present and true, then a single-line result will be given.
     * Otherwise, the result is always a multi-line string.
     *
     * @param modelelement
     * @param startIndent
     * @param short
     */
    writeToLines(modelelement: PiElement, startIndent?: number, short?: boolean): string[];

    /**
     * Returns the name of 'modelelement' if it has one, else returns
     * a short unparsing of 'modelelement'.
     * Used by the validator to produce readable error messages.
     *
     * @param modelelement
     */
    writeNameOnly(modelelement: PiElement): string;
}
