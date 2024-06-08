import {LanguageParser} from "../../languagedef/parser/LanguageParser";
import {FreMetaLanguage} from "../../languagedef/metalanguage";

export function parseCorrectModel(parser: LanguageParser, parseFile: string) {
    let model: FreMetaLanguage = null;
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
