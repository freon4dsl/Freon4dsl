import { PiLanguage } from "../../languagedef/metalanguage";
import { PiParser } from "../../utils";

const editorParser = require("./PiEditGrammar");
import { setCurrentFileName as editFileName } from "./PiEditCreators";
import { setCurrentFileName as expressionFileName } from "../../languagedef/parser/ExpressionCreators";
import { ExtraClassifierInfo, PiEditUnit } from "../metalanguage/PiEditDefLang";
import { PiEditChecker } from "../metalanguage/PiEditChecker";

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
                if (index > 0) {
                    result.projectiongroups.push(...sub.projectiongroups);
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
        const defaultGroup = result.getDefaultProjectiongroup();
        if (!!defaultGroup) { //
            if (!defaultGroup.extras) {
                defaultGroup.extras = [];
            }
            result.projectiongroups.forEach(group => {
                if (group !== defaultGroup) {
                    if (!!group.extras && group.extras.length > 0) {
                        for (const extra of group.extras) {
                            const knownOne = defaultGroup.extras.find(ex => ex.classifier.referred === extra.classifier.referred);
                            if (!!knownOne) {
                                // merge the extra info, when possible
                                if (!!extra.symbol) {
                                    if (!!knownOne.symbol) {
                                        throw new Error(`merge error: symbol for classifier ${extra.classifier.name} is defined twice ${this.location(extra)}`);
                                    } else {
                                        knownOne.symbol = extra.symbol;
                                    }
                                }
                                if (!!extra.trigger) {
                                    if (!!knownOne.trigger) {
                                        throw new Error(`merge error: trigger for classifier ${extra.classifier.name} is defined twice ${this.location(extra)}`);
                                    } else {
                                        knownOne.trigger = extra.trigger;
                                    }
                                }
                                if (!!extra.referenceShortCut) {
                                    if (!!knownOne.referenceShortCut) {
                                        throw new Error(`merge error: symbol for classifier ${extra.classifier.name} is defined twice ${this.location(extra)}`);
                                    } else {
                                        knownOne.referenceShortCut = extra.referenceShortCut;
                                    }
                                }
                            } else {
                                // this is a new extra
                                defaultGroup.extras.push(extra);
                            }
                        }
                    }
                    group.extras = null;
                }
            });
        } else { // should not happen, because PiEditProjectionUtil adds a default group
            console.log("internal error: no default projection group found");
        }
    }

    protected setCurrentFileName(file: string) {
        editFileName(file);
        expressionFileName(file);
    }

    protected getNonFatalParseErrors(): string[] {
        return [];
    }
}
