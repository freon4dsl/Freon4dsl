import fs from "fs";
import { FreMetaLanguage } from "../metalanguage/index.js";
import { FreGenericParser, LOG2USER } from "../../utils/index.js";
import { parseIds } from "./IdParser.js";
import { parser } from "./LanguageGrammar.js";

import { cleanNonFatalParseErrors, getNonFatalParseErrors, setCurrentFileName, setIdMap } from "./LanguageCreators.js";
import { FreLangChecker } from "../checking/FreLangChecker.js";

// const LOGGER = new MetaLogger("LanguageParser").mute();

export class LanguageParser extends FreGenericParser<FreMetaLanguage> {
    idFile: string | undefined;

    constructor(idFile?: string) {
        super();
        this.idFile = idFile ? idFile : undefined;
        this.parser = parser;
        this.checker = new FreLangChecker(undefined);
    }

    parse(definitionFile: string): FreMetaLanguage | undefined {
        LOG2USER.log("ParseFile: " + definitionFile);
        if (this.idFile !== undefined && this.idFile !== null && this.idFile.length > 0) {
            const idFileString = fs.readFileSync(this.idFile, "utf-8");
            const idJson = JSON.parse(idFileString);
            const idMap = parseIds(idJson);
            setIdMap(idMap);
        } else {
            LOG2USER.log("No id.json found");
        }
        return super.parse(definitionFile);
    }

    parseMulti(filePaths: string[]): FreMetaLanguage | undefined {
        if (this.idFile !== undefined && this.idFile !== null) {
            const idFileString = fs.readFileSync(this.idFile, "utf-8");
            const idJson = JSON.parse(idFileString);
            const idMap = parseIds(idJson);
            setIdMap(idMap);
        } else {
            LOG2USER.log("No id.json found");
        }
        return super.parseMulti(filePaths);
    }

    protected merge(submodels: FreMetaLanguage[]): FreMetaLanguage | undefined {
        if (submodels.length > 0) {
            const result: FreMetaLanguage = new FreMetaLanguage();
            result.name = submodels[0].name;
            for (const sub of submodels) {
                result.usedLanguages.push(sub.name);
                // if (sub.name === result.name) { // all submodels should be of the same language
                if (!!sub.modelConcept) {
                    result.modelConcept = sub.modelConcept;
                }
                result.units.push(...sub.units);
                result.concepts.push(...sub.concepts);
                result.interfaces.push(...sub.interfaces);
                // } else {
                //     LOGGER.error("All sublanguages should be of the same language, found sublanguage: '" + sub.name + "' in '" + result.name + "'.");
                // }
            }
            result.conceptsAndInterfaces().forEach((classifier) => {
                classifier.language = result;
            });
            return result;
        } else {
            return undefined;
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
