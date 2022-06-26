import { PiElement, PiModel } from "../ast";

export interface PiReader {
    /**
     * Parses and performs a syntax analysis on 'sentence', using the parser and analyser
     * for 'metatype', if available. If 'sentence' is correct, a model unit will be created,
     * otherwise an error wil be thrown containing the parse or analysis error.
     * @param sentence      the input string which will be parsed
     * @param metatype      the type of the unit to be created
     * @param model         the model to which the unit will be added
     * @param sourceName    the (optional) name of the source that contains 'sentence'
     */
    readFromString(input: string, metatype: string, model: PiModel, sourceName?: string): PiElement;
}
