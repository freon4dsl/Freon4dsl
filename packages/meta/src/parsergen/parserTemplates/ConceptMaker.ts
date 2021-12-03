import {
    ListInfoType,
    PiEditConcept,
    PiEditProjectionItem,
    PiEditProjectionLine,
    PiEditProjectionText,
    PiEditPropertyProjection,
    PiEditSubProjection,
    PiEditUnit,
} from "../../editordef/metalanguage";
import { PiBinaryExpressionConcept, PiClassifier, PiLimitedConcept, PiPrimitiveProperty, PiPrimitiveType, PiProperty } from "../../languagedef/metalanguage";
import { ParserGenUtil } from "./ParserGenUtil";
import {
    GrammarRule,
    ConceptRule,
    RightHandSideEntry,
    RHSText,
    RHSPropEntry,
    RHSOptionalGroup,
    RHSBooleanWithKeyWord,
    RHSPrimEntry,
    RHSPrimOptionalEntry,
    RHSPrimListEntry,
    RHSPrimListEntryWithSeparator,
    RHSPartEntry,
    RHSPartOptionalEntry,
    RHSPartListEntry,
    RHSPartListEntryWithSeparator,
    RHSRefEntry,
    RHSRefOptionalEntry,
    RHSRefListEntry,
    RHSRefListWithSeparator,
    RHSLimitedRefEntry,
    RHSLimitedRefOptionalEntry,
    RHSLimitedRefListEntry,
    RHSLimitedRefListWithSeparator,
    RHSListGroup,
    RHSPrimListGroup,
} from "./grammarModel";

export class ConceptMaker {
    // generatedParseRules: string[] = [];
    // generatedSyntaxAnalyserMethods: string[] = [];
    // branchNames: string[] = [];
    imports: PiClassifier[] = [];

    generateClassifiers(editUnit: PiEditUnit, conceptsUsed: PiClassifier[]): GrammarRule[] {
        let rules: GrammarRule[] = [];
        for (const piConcept of conceptsUsed) {
            // find editDef for this concept
            const conceptDef: PiEditConcept = editUnit.findConceptEditor(piConcept);

            let rule: ConceptRule = new ConceptRule(piConcept);
            for (const l of conceptDef.projection.lines) {
                rule.ruleParts.push(...this.doLine(l, false));
            }
            rules.push(rule);
        }
        return rules;
    }

    private doLine(line: PiEditProjectionLine, inOptionalGroup: boolean): RightHandSideEntry[] {
        const subs = this.addItems(line.items, inOptionalGroup);
        if (!!subs && !!subs[subs.length - 1] ) {
            // to manage the layout of the grammar, we set 'addNewLineToGrammar' of the last entry in the line
            subs[subs.length - 1].addNewLineToGrammar = true;
        }
        return subs;
    }

    private addItems(list: PiEditProjectionItem[], inOptionalGroup: boolean): RightHandSideEntry[] {
        let parts: RightHandSideEntry[] = [];
        if (!!list && list.length > 0) {
            list.forEach((item) => {
                if (item instanceof PiEditSubProjection) {
                    // TODO check: I expect exactly one property projection in a sub projection
                    // things go wrong if this is not the case!!!
                    // hack: item should be optional but it is not ????
                    // TODO find out why
                    // if (item.optional) {
                    parts.push(new RHSOptionalGroup(item.optionalProperty().expression.findRefOfLastAppliedFeature(), this.addItems(item.items, true)));
                    // } else {
                    //     parts.push(new RHSGroup(this.addItems(item.items)));
                    // }
                } else if (item instanceof PiEditPropertyProjection) {
                    const propPart = this.makePropPart(item, inOptionalGroup);
                    if (!!propPart) parts.push(propPart);
                } else if (item instanceof PiEditProjectionText) {
                    parts.push(...this.makeTextPart(item));
                }
            });
        }
        return parts;
    }

    private makePropPart(item: PiEditPropertyProjection, inOptionalGroup: boolean): RHSPropEntry {
        // TODO adjust this when the default for joinType is properly set in the .edit parser
        const prop: PiProperty = item.expression.findRefOfLastAppliedFeature();
        if (!!prop) {
            const propType: PiClassifier = prop.type.referred; // more efficient to determine referred only once
            this.imports.push(propType);
            if (prop instanceof PiPrimitiveProperty) {
                if (propType === PiPrimitiveType.boolean && !!item.keyword) {
                    // TODO list???
                    return new RHSBooleanWithKeyWord(prop, item.keyword);
                } else if (!prop.isList) {
                    if (!prop.isOptional || inOptionalGroup) {
                        return new RHSPrimEntry(prop);
                    } else {
                        return new RHSPrimOptionalEntry(prop);
                    }
                } else {
                    if (!!item.tableInfo) {
                        // TODO adjust for tables
                    } else {
                        let joinText = this.makeListJoinText(item.listInfo?.joinText);
                        if (joinText.length == 0 || item.listInfo?.joinType === ListInfoType.NONE) {
                            return new RHSPrimListEntry(prop); // propTypeName*
                        } else if (item.listInfo?.joinType === ListInfoType.Separator) {
                            return new RHSPrimListEntryWithSeparator(prop, joinText); // [ propTypeName / "joinText" ]
                        } else if (item.listInfo?.joinType === ListInfoType.Terminator) {
                            const sub1 = new RHSPrimEntry(prop);
                            return new RHSPrimListGroup(prop, sub1, joinText); // `(${propTypeName} '${joinText}' )* /* option C */`
                        } else {
                            console.log("ERROR 12 in ConceptMaker");
                            return null;
                        }
                    }
                }
            } else if (propType instanceof PiLimitedConcept) {
                if (!prop.isList) {
                    if (!prop.isOptional || inOptionalGroup) {
                        return new RHSLimitedRefEntry(prop);
                    } else {
                        return new RHSLimitedRefOptionalEntry(prop);
                    }
                } else {
                    if (!!item.tableInfo) {
                        // TODO adjust for tables
                    } else {
                        let joinText = this.makeListJoinText(item.listInfo?.joinText);
                        if (joinText.length == 0 || item.listInfo?.joinType === ListInfoType.NONE) {
                            return new RHSLimitedRefListEntry(prop); // propTypeName*
                        } else if (item.listInfo?.joinType === ListInfoType.Separator) {
                            return new RHSLimitedRefListWithSeparator(prop, joinText); // [ propTypeName / "joinText" ]
                        } else if (item.listInfo?.joinType === ListInfoType.Terminator) {
                            const sub1 = new RHSLimitedRefEntry(prop);
                            return new RHSListGroup(prop, sub1, joinText); // `(${propTypeName} '${joinText}' )* /* option C */`
                        }
                    }
                }
            } else if (propType instanceof PiBinaryExpressionConcept) {
                console.log("asking for a binary: " + propType.name);
                // TODO
            } else if (!prop.isList && prop.isPart && (!prop.isOptional || inOptionalGroup)) {
                // (non-list, part, non-optional)
                return new RHSPartEntry(prop); //`${propTypeName} /* option E */`;
            } else if (!prop.isList && prop.isPart && prop.isOptional && !inOptionalGroup) {
                // (non-list, part, optional)
                return new RHSPartOptionalEntry(prop); //`${propTypeName} /* option E */`;
            } else if (!prop.isList && !prop.isPart && (!prop.isOptional || inOptionalGroup)) {
                // (non-list, reference, non-optional)
                return new RHSRefEntry(prop); //`${propTypeName} /* option E */`;
            } else if (!prop.isList && !prop.isPart && prop.isOptional && !inOptionalGroup) {
                // (non-list, reference, optional)
                return new RHSRefOptionalEntry(prop); //`${propTypeName} /* option E */`;
            } else if (prop.isList && prop.isPart) {
                // (list, part, optionality not relevant)
                if (!!item.tableInfo) {
                    // TODO adjust for tables
                } else {
                    let joinText = this.makeListJoinText(item.listInfo?.joinText);
                    if (joinText.length == 0 || item.listInfo?.joinType === ListInfoType.NONE) {
                        return new RHSPartListEntry(prop); // propTypeName*
                    } else if (item.listInfo?.joinType === ListInfoType.Separator) {
                        return new RHSPartListEntryWithSeparator(prop, joinText); // [ propTypeName / "joinText" ]
                    } else if (item.listInfo?.joinType === ListInfoType.Terminator) {
                        const sub1 = new RHSPartEntry(prop);
                        return new RHSListGroup(prop, sub1, joinText); // `(${propTypeName} '${joinText}' )* /* option C */`
                    }
                }
            } else if (prop.isList && !prop.isPart) {
                // (list, reference, optionality not relevant)
                if (!!item.tableInfo) {
                    // TODO adjust for tables
                } else {
                    let joinText = this.makeListJoinText(item.listInfo?.joinText);
                    if (joinText.length == 0 || item.listInfo?.joinType === ListInfoType.NONE) {
                        return new RHSRefListEntry(prop); // propTypeName*
                    } else if (item.listInfo?.joinType === ListInfoType.Separator) {
                        return new RHSRefListWithSeparator(prop, joinText); // [ propTypeName / "joinText" ]
                    } else if (item.listInfo?.joinType === ListInfoType.Terminator) {
                        const sub1 = new RHSRefEntry(prop);
                        return new RHSListGroup(prop, sub1, joinText); // `(${propTypeName} '${joinText}' )* /* option C */`
                    }
                }
            }
        }
        return null;
    }

    private makeTextPart(item: PiEditProjectionText): RHSText[] {
        let result: RHSText[] = [];
        const trimmed = item.text.trim();
        let splitted: string[];
        if (trimmed.includes(" ")) {
            // we need to add a series of texts with whitespace between them
            splitted = trimmed.split(" ");
            splitted.forEach((str) => {
                if (str.length > 0) {
                    result.push(new RHSText(`\'${ParserGenUtil.escapeRelevantChars(str)}\' `));
                }
            });
            return result;
        } else {
            if (trimmed.length > 0) {
                result.push(new RHSText(`\'${ParserGenUtil.escapeRelevantChars(trimmed)}\' `));
            }
        }
        return result;
    }

    private makeListJoinText(joinText: string): string {
        let result: string = "";
        if (!!joinText) {
            result = joinText.trimEnd();
        }
        // TODO should test on all manners of whitespace
        result = result.replace(new RegExp("\\\\n", "g"), "");
        result = result.replace(new RegExp("\\\\t", "g"), "");
        result = result.replace(new RegExp("\\\\r", "g"), "");
        result = result.trimEnd();
        return result;
    }
}
