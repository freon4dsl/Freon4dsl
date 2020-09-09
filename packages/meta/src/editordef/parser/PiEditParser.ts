import { PiLanguage } from "../../languagedef/metalanguage";
import { PiParser } from "../../utils";
import { PiEditChecker, PiEditUnit } from "../metalanguage";

const editorParser = require("./PiEditGrammar");
import { setCurrentFileName as editFileName } from "./PiEditCreators";
import { setCurrentFileName as expressionFileName } from "../../languagedef/parser/ExpressionCreators";

export class PiEditParser extends PiParser<PiEditUnit> {
    language: PiLanguage;

    constructor(language: PiLanguage) {
        super();
        this.language = language;
        this.parser = editorParser;
        this.checker = new PiEditChecker(language);
    }

    protected merge(submodels: PiEditUnit[]): PiEditUnit {
        if (submodels.length > 0) {
            let result: PiEditUnit = submodels[0];
            submodels.forEach((sub, index) => {
                if (index > 0) {
                    result.conceptEditors.push(...sub.conceptEditors);
                }
            });
            return result;
        } else {
            return null;
        }
    }

    protected setCurrentFileName(file: string) {
        editFileName(file);
        expressionFileName(file);
    }
}
