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

    /**
     * Writes a string representation of 'modelelement' to the file located at 'filepath'. If the
     * file is not present it will be created.
     * May throw an Error if the file cannot be written or created.
     * @param filepath
     * @param modelelement
     * @param startIndent
     */
    // TODO writeToFile(filepath: string, modelelement: PiElement, startIndent?: number);
}
// end::writer-interface[]
