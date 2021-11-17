import { PiElement } from "../language";

// tag::reader-interface[]
export interface PiReader {
    /**
     * Parses the 'input' into a model unit of type 'metatype'.
     * May throw an Error if a syntax error occurs.
     * @param input
     * @param metatype
     */
    readFromString(input: string, metatype: string): PiElement;
}
// end::reader-interface[]
