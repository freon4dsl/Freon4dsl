import type { FreMetaLanguage } from "../../languagedef/metalanguage/index.js";
import { Names } from "../../utils/on-lang/index.js";
import { ParseLocationUtil, FreGenericParser } from "../../utils/basic-dependencies/index.js";
import type {
    FreEditExtraClassifierInfo,
    FreEditUnit} from "../metalanguage/index.js";
import {
    FreEditProjectionGroup,
    FreEditChecker,
} from "../metalanguage/index.js";
import { setCurrentFileName as editFileName } from "./FreEditCreators.js";
import { parse } from "./FreEditGrammar.js";

export class FreEditParser extends FreGenericParser<FreEditUnit> {
    language: FreMetaLanguage;

    constructor(language: FreMetaLanguage) {
        super();
        this.language = language;
        this.parseFunction = parse;
        this.checker = new FreEditChecker(language);
    }

    protected merge(submodels: FreEditUnit[]): FreEditUnit | undefined {
        if (submodels.length > 0) {
            const result: FreEditUnit = submodels[0];
            // remember the files where we encountered global projections, in order to give a good warning
            const filesWithStdProj: string[] = [];

            // we merge all edit files based on the name of the 'editor'
            // same name => all info is stored in the same group
            // therefore we build a map of projection groups by name
            const projectionGroupsByName: Map<string, FreEditProjectionGroup> = new Map<
                string,
                FreEditProjectionGroup
            >();
            // add the groups from the first submodel (should be a single group)
            result.projectiongroups.forEach((group) => {
                projectionGroupsByName.set(group.name, group);
                if (group.globalProjections.length > 0) {
                    filesWithStdProj.push(ParseLocationUtil.location(group.globalProjections[0]));
                }
            });

            // now merge the other submodels
            submodels.forEach((sub, index) => {
                if (index > 0) {
                    // we have already added submodels[0] to the result
                    sub.projectiongroups.forEach((group) => {
                        if (projectionGroupsByName.has(group.name)) {
                            // there is already a group with this name in the definition, so
                            // merge all info into this group
                            const found = projectionGroupsByName.get(group.name);
                            if (!!found) {
                                found.projections.push(...group.projections);
                                if (group.globalProjections.length > 0) {
                                    filesWithStdProj.push(ParseLocationUtil.location(group.globalProjections[0]));
                                }
                                found.globalProjections.push(...group.globalProjections);
                                if (!!group.extras) {
                                    if (!found.extras) {
                                        found.extras = [];
                                    }
                                    found.extras.push(...group.extras);
                                }
                                if (group.precedence !== null && group.precedence !== undefined) {
                                    // precedence may be 0, "!!group.precedence" would return false
                                    if (found.precedence !== null && found.precedence !== undefined) {
                                        if (group.precedence !== found.precedence) {
                                            this.checker.errors.push(
                                                `Precedence of ${group.name} in ${ParseLocationUtil.location(group)} is not equal to the one found in ${ParseLocationUtil.location(found)}.`,
                                            );
                                        }
                                    } else {
                                        found.precedence = group.precedence;
                                    }
                                }
                            }
                        } else {
                            // group with this name is not yet encountered,
                            // add it to the editor definition
                            // and add it to the map
                            projectionGroupsByName.set(group.name, group);
                            result.projectiongroups.push(group);
                        }
                    });
                }
            });

            if (filesWithStdProj.length > 1) {
                this.checker.warnings.push(
                    `Found multiple definitions for global projections, please note that they may be overridden ${filesWithStdProj}.`,
                );
            }

            // place extra classifier information always in the default projection group
            this.mergeExtraInformation(result);
            return result;
        } else {
            return undefined;
        }
    }

    private mergeExtraInformation(result: FreEditUnit) {
        // first make sure there is a default projection group
        let defaultGroup = result.getDefaultProjectiongroup();
        if (!defaultGroup) {
            defaultGroup = new FreEditProjectionGroup();
            defaultGroup.name = Names.defaultProjectionName;
            result.projectiongroups.push(defaultGroup);
        }
        // add all extra information to the default group
        const allExtras: FreEditExtraClassifierInfo[] = [];
        result.projectiongroups.forEach((group) => {
            if (!!group.extras) {
                allExtras.push(...group.extras);
            }
            group.extras = [];
        });
        defaultGroup.extras = allExtras;
    }

    protected setCurrentFileName(file: string) {
        editFileName(file);
    }

    protected getNonFatalParseErrors(): string[] {
        return [];
    }
}
