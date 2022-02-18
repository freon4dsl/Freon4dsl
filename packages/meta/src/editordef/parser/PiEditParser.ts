import { PiLanguage } from "../../languagedef/metalanguage";
import { Checker, Names, PiParser } from "../../utils";
import { setCurrentFileName as editFileName } from "./PiEditCreators";
import { setCurrentFileName as expressionFileName } from "../../languagedef/parser/ExpressionCreators";
import { ExtraClassifierInfo, PiEditProjectionGroup, PiEditUnit } from "../metalanguage/PiEditDefLang";
import { PiEditChecker } from "../metalanguage/PiEditChecker";

const editorParser = require("./PiEditGrammar");

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

            // we merge all edit files based on the name of the 'editor'
            // same name => all info is stored in the same group
            // therefore we build a map of projection groups by name
            const projectionGroupsByName: Map<string, PiEditProjectionGroup> = new Map<string, PiEditProjectionGroup>();
            // add the groups from the first submodel (should be a single group)
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
                            if (group.precedence !== null && group.precedence !== undefined) { // precedence may be 0, "!!group.precedence" would return false
                                if (found.precedence !== null && found.precedence !== undefined) {
                                    if (group.precedence !== found.precedence) {
                                        this.checker.errors.push(`Precendence of ${group.name} in ${Checker.location(group)} is not equal to the one found in ${Checker.location(found)}.`)
                                    }
                                } else {
                                    found.precedence = group.precedence;
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
