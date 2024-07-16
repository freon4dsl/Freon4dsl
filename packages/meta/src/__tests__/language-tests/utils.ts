import {LanguageParser} from "../../languagedef/parser/LanguageParser";
import {FreMetaLanguage} from "../../languagedef/metalanguage/index.js";
import { expect } from "vitest"

export function parseCorrectModel(parser: LanguageParser, parseFile: string) {
    let model: FreMetaLanguage | undefined = undefined;
    try {
        model = parser.parse(parseFile);
    } catch (e: unknown) {
        if (e instanceof Error) {
            // console.log(e.message + e.stack);
            // console.log(parser.checker.errors.map(err => `"${err}"`).join("\n") );
            expect(e.message).toBeNull();
        }
    }
    return model;
}
