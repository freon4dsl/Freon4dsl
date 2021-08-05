import { PiElement } from "../language";

// tag::reader-interface[]
export interface PiReader {
    /**
     * Reads the contents of the file located at 'filepath' and
     * parses this content into a model unit of type 'metatype'.
     * May throw an Error if the file cannot be found, or if a syntax error
     * occurs.
     * @param filepath
     * @param metatype
     */
    // TODO readFromFile(filepath: string, metatype: string): PiElement;

    /**
     * Parses the 'input' into a model unit of type 'metatype'.
     * May throw an Error if a syntax error occurs.
     * @param input
     * @param metatype
     */
    readFromString(input: string, metatype: string): PiElement;
}
// end::reader-interface[]
