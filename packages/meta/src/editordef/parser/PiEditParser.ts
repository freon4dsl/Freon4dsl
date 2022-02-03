import { PiLanguage } from "../../languagedef/metalanguage";
import { Checker, Names, PiParser } from "../../utils";

const editorParser = require("./PiEditGrammar");
import { setCurrentFileName as editFileName } from "./PiEditCreators";
import { setCurrentFileName as expressionFileName } from "../../languagedef/parser/ExpressionCreators";
import { ExtraClassifierInfo, PiEditProjectionGroup, PiEditUnit } from "../metalanguage/PiEditDefLang";
import { PiEditChecker } from "../metalanguage/PiEditChecker";
import { DefaultEditorGenerator } from "../metalanguage/DefaultEditorGenerator";

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
            const result: PiEditUnit = submodels[0];
            submodels.forEach((sub, index) => {
                if (index > 0) { // we have already added submodels[0] to the result
                    sub.projectiongroups.forEach(group => {
                        result.projectiongroups.push(group);
                    });
                }
            });

            // place extra classifier information always in the default projection group
            this.mergeExtraInformation(result);
            return result;
        } else {
            return null;
        }
    }

    private mergeExtraInformation(result: PiEditUnit) {
        // first make sure there is a default projection group
        let defaultGroup = result.getDefaultProjectiongroup();
        if (!defaultGroup) {
            defaultGroup = new PiEditProjectionGroup();
            defaultGroup.name = Names.defaultProjectionName;
            result.projectiongroups.push(defaultGroup);
        }
        // add all extra information to the default group
        const allExtras: ExtraClassifierInfo[] = [];
        result.projectiongroups.forEach(group => {
            if (!!group.extras) {
                allExtras.push(...group.extras);
            }
            group.extras = null;
        });
        defaultGroup.extras = allExtras;
    }

    protected setCurrentFileName(file: string) {
        editFileName(file);
        expressionFileName(file);
    }

    protected getNonFatalParseErrors(): string[] {
        return [];
    }
}
