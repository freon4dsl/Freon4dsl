import { PiParser } from "../../utils";
import { PiLanguage } from "../../languagedef/metalanguage";
import { PiTypeDefinition } from "../metalanguage";
import { PiTyperChecker } from "../metalanguage";

const typerParser = require("./PiTyperGrammar");
import { setCurrentFileName } from "./PiTyperCreators";

export class PiTyperParser extends PiParser<PiTypeDefinition> {
    public language: PiLanguage;

    constructor(language: PiLanguage) {
        super();
        this.parser = typerParser;
        this.language = language;
        this.checker = new PiTyperChecker(language);
    }

    protected merge(submodels: PiTypeDefinition[]): PiTypeDefinition {
        if (submodels.length > 0) {
            let result: PiTypeDefinition = submodels[0];
            submodels.forEach((sub, index) => {
                if (index > 0) {
                    result.classifierRules.push(...sub.classifierRules);
                    result.typerRules.push(...sub.typerRules);
                }
            });
            return result;
        } else {
            return null;
        }
    }

    protected setCurrentFileName(file: string) {
        setCurrentFileName(file);
    }
}
