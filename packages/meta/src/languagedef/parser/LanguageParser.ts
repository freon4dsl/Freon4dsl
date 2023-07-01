import { FreMetaLanguage } from "../metalanguage/";
import { FreGenericParser, MetaLogger } from "../../utils";
import * as pegjsParser from "./LanguageGrammar";
import { cleanNonFatalParseErrors, getNonFatalParseErrors, setCurrentFileName } from "./LanguageCreators";
import { FreLangChecker } from "../checking/FreLangChecker";

const LOGGER = new MetaLogger("LanguageParser").mute();

export class LanguageParser extends FreGenericParser<FreMetaLanguage> {
    constructor() {
        super();
        this.parser = pegjsParser;
        this.checker = new FreLangChecker(null);
    }

    protected merge(submodels: FreMetaLanguage[]): FreMetaLanguage {
        if (submodels.length > 0) {
            const result: FreMetaLanguage = new FreMetaLanguage();
            result.name = submodels[0].name;
            for (const sub of submodels) {
                if (sub.name === result.name) { // all submodels should be of the same language
                    if (!!sub.modelConcept) {
                        result.modelConcept = sub.modelConcept;
                    }
                    result.units.push(...sub.units);
                    result.concepts.push(...sub.concepts);
                    result.interfaces.push(...sub.interfaces);
                } else {
                    LOGGER.error("All sublanguages should be of the same language, found sublanguage: '" + sub.name + "' in '" + result.name + "'.");
                }
            }
            result.conceptsAndInterfaces().forEach(classifier => {
                classifier.language = result;
            });
            return result;
        } else {
            return null;
        }
    }

    protected setCurrentFileName(file: string) {
        setCurrentFileName(file);
    }

    protected getNonFatalParseErrors(): string[] {
        return getNonFatalParseErrors();
    }

    protected cleanNonFatalParseErrors() {
        cleanNonFatalParseErrors();
    }
}
