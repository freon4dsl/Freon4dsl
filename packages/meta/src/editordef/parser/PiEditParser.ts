import { PiLanguage } from "../../languagedef/metalanguage";
import { Names, PiParser } from "../../utils";

const editorParser = require("./PiEditGrammar");
import { setCurrentFileName as editFileName } from "./PiEditCreators";
import { setCurrentFileName as expressionFileName } from "../../languagedef/parser/ExpressionCreators";
import { ExtraClassifierInfo, PiEditProjectionGroup, PiEditUnit } from "../metalanguage/PiEditDefLang";
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

            // make sure we can handle each projection group based on its name
            const projectionGroupsByName: Map<string, PiEditProjectionGroup> = new Map<string, PiEditProjectionGroup>();
            // add all groups from the first submodel
            result.projectiongroups.forEach(group => {
                projectionGroupsByName.set(group.name, group);
            })

            // now merge the other submodels
            submodels.forEach((sub, index) => {
                if (index > 0) { // we have already added submodels[0] to the result
                    sub.projectiongroups.forEach(group => {
                        if (projectionGroupsByName.has(group.name)) {
                            // there is already a group with this name in the definition, so
                            // merge all info into this group
                            const found = projectionGroupsByName.get(group.name);
                            found.projections.push(...group.projections);
                            if (!!found.extras && !!group.extras) {
                                found.extras.push(...group.extras);
                            }
                        } else {
                            // group with this name is not yet encountered,
                            // add it to the definition
                            projectionGroupsByName.set(group.name, group);
                            result.projectiongroups.push(group);
                        }
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
        }
        // initialize extras
        if (!defaultGroup.extras) {
            defaultGroup.extras = [];
        }
        // add all extra information to the default group
        result.projectiongroups.forEach(group => {
            console.log("merging extras, group: " + group.name)
            if (group !== defaultGroup) {
                if (!!group.extras && group.extras.length > 0) {
                    for (const extra of group.extras) {
                        console.log("\t found extras for: " + extra.classifier?.name)
                        // first see whether the default group has extras for this classifier
                        const knownOne = defaultGroup.extras.find(ex => ex.classifier.referred === extra.classifier.referred);
                        // if already present, then merge the extra info
                        if (!!knownOne) {
                            console.log("there is already an extra for " + knownOne.classifier.name);
                            if (!!extra.symbol) {
                                if (!!knownOne.symbol) {
                                    this.checker.warnings.push(`symbol for classifier ${extra.classifier.name} is defined twice: ${this.location(extra)} and ${this.location(knownOne)}.`);
                                } else {
                                    knownOne.symbol = extra.symbol;
                                }
                            }
                            if (!!extra.trigger) {
                                if (!!knownOne.trigger) {
                                    this.checker.warnings.push(`trigger for classifier ${extra.classifier.name} is defined twice: ${this.location(extra)} and ${this.location(knownOne)}.`);
                                } else {
                                    knownOne.trigger = extra.trigger;
                                }
                            }
                            if (!!extra.referenceShortCut) {
                                if (!!knownOne.referenceShortCut) {
                                    this.checker.warnings.push(`reference shortcut for classifier ${extra.classifier.name} is defined twice: ${this.location(extra)} and ${this.location(knownOne)}.`);
                                } else {
                                    knownOne.referenceShortCut = extra.referenceShortCut;
                                }
                            }
                        } else {
                            // this is a new extra, add it to the default group
                            console.log("new extra for " + knownOne.classifier.name);
                            defaultGroup.extras.push(extra);
                        }
                    }
                }
                // remove the extras from all non-default groups
                group.extras = null;
            } else {
                console.log("found in default:" + group.extras.map(ex => ex.classifier.name));
            }
        });
    }

    protected setCurrentFileName(file: string) {
        editFileName(file);
        expressionFileName(file);
    }

    protected getNonFatalParseErrors(): string[] {
        return [];
    }
}
