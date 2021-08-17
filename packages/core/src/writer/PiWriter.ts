import { PiElement } from "../language";

// Part of the ProjectIt Framework.
// TODO change tags
// tag::writer-interface[]
export interface PiWriter {

    /**
     * Returns a string representation of 'modelelement'.
     * If 'short' is present and false, then a multi-line result will be given.
     * Otherwise, the result is always a single-line string.
     * @param modelelement
     * @param startIndent
     * @param short
     */
    writeToString(modelelement: PiElement, startIndent?: number, short?: boolean): string;

    /**
     * Returns a string representation of 'modelelement', divided into an array of strings,
     * each of which contain a single line (without newline).
     * If 'short' is present and false, then a multi-line result will be given.
     * Otherwise, the result is always a single-line string.
     * @param modelelement
     * @param startIndent
     * @param short
     */
    writeToLines(modelelement: PiElement, startIndent?: number, short?: boolean): string[];
}
// end::writer-interface[]
