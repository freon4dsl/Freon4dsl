import { PiLanguage } from "../../languagedef/metalanguage";
import { PiParser } from "../../utils";
import { PiEditChecker, PiEditUnit } from "../metalanguage";

const editorParser = require("./PiEditGrammar");
import { setCurrentFileName as editFileName } from "./PiEditCreators";
import { setCurrentFileName as expressionFileName } from "../../languagedef/parser/ExpressionCreators";
import { PiLogger } from "../../../../core/src/util/PiLogging";

const LOGGER = new PiLogger("PiEditParser"); //.mute();

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
                    if (sub.name === result.name) { // all submodels should be of the same model
                        result.conceptEditors.push(...sub.conceptEditors);
                    } else {
                        // TODO error message: is this really wrong???
                        LOGGER.error(this, "Submodels do not have the same name");
                    }
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
