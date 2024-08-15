import {
    FreMetaClassifier,
    FreMetaConcept,
    FreMetaInterface,
    FreMetaLanguage,
    FreMetaLimitedConcept,
    FreMetaPrimitiveProperty,
    FreMetaPrimitiveType,
    FreMetaProperty,
    MetaElementReference
} from "../../languagedef/metalanguage/index.js";
import {
    Checker,
    CheckRunner,
    FreMetaDefinitionElement,
    LangUtil,
    MetaLogger,
    Names,
    ParseLocationUtil
} from "../../utils/index.js";
import {FreEditParseUtil} from "../parser/FreEditParseUtil.js";
import {
    DisplayType,
    FreEditExtraClassifierInfo,
    ForType,
    FreEditClassifierProjection,
    FreEditSimpleExternal,
    FreEditFragmentDefinition,
    FreEditGlobalProjection,
    FreEditNormalProjection,
    FreEditProjectionGroup,
    FreEditProjectionItem,
    FreEditProjectionLine,
    FreEditProjectionText,
    FreEditPropertyProjection,
    FreEditSuperProjection,
    FreEditTableProjection,
    FreEditUnit,
    FreOptionalPropertyProjection,
    FreEditListInfo,
    ListJoinType,
    FreEditFragmentProjection
} from "./editlanguage/index.js";
import {EditorDefaults} from "./EditorDefaults.js";
import {FreLangExpressionChecker} from "../../languagedef/checking/index.js";

const LOGGER: MetaLogger = new MetaLogger("FreEditChecker"); // .mute();

export class FreEditChecker extends Checker<FreEditUnit> {

    private static includesWhitespace(keyword: string) {
        return keyword.includes(" ") || keyword.includes("\n") || keyword.includes("\r") || keyword.includes("\t");
    }

    // @ts-ignore runner gets its value in the 'check' method
    runner: CheckRunner;
    private readonly myExpressionChecker: FreLangExpressionChecker | undefined;
    private propsWithTableProjection: FreEditPropertyProjection[] = [];

    constructor(language: FreMetaLanguage) {
        super(language);
        if (!!this.language) {
            this.myExpressionChecker = new FreLangExpressionChecker(this.language);
        }
    }

    /**
     * Checks the editor definition, resolving references, and adds the defaults.
     *
     * @param editUnit
     */
    public check(editUnit: FreEditUnit): void {
        LOGGER.log("checking editUnit");
        if ( this.language === null || this.language === undefined ) {
            throw new Error(`Editor definition checker does not known the language, exiting ` +
                `${ParseLocationUtil.location(editUnit)}.`);
        }
        // create a check runner
        this.runner = new CheckRunner(this.errors, this.warnings);
        // reset global(s)
        this.propsWithTableProjection = [];

        // get the language against which this editor definition should be checked and resolve all references
        editUnit.language = this.language;
        this.resolveReferences(editUnit);

        // do a 'normal' check of all projections groups
        for (const group of editUnit.projectiongroups) {
            this.checkProjectionGroup(group, editUnit);
        }

        // check whether all properties that need a table projection can find it
        this.checkPropsWithTableProjection(editUnit);

        // check uniqueness of names and precedence
        LOGGER.log("checking uniqueness of names and precedence");
        const names: string[] = [];
        const precedences: number[] = [0]; // 0 is the number for the default group, which is always present
        editUnit.projectiongroups.forEach(group => {
            this.checkUniqueNameOfProjectionGroup(names, group);
            this.checkUniquePrecedenceOfProjectionGroup(precedences, group);
            group.owningDefinition = editUnit;
        });

        LOGGER.log("finalize checking");
        // warning in case there is no 'default' editor
        this.runner.simpleWarning(!!editUnit.getDefaultProjectiongroup(),
            `No editor with name 'default' found, a default editor will be generated.`);

        // add any messages found by the expression checker
        if (!!this.myExpressionChecker) {
            this.errors = this.errors.concat(this.myExpressionChecker.errors);
            this.warnings = this.warnings.concat(this.myExpressionChecker.warnings);
        }
    }

    private checkUniqueNameOfProjectionGroup(names: string[], group: FreEditProjectionGroup) {
        // check unique names, disregarding upper/lower case of first character
        if (names.includes(group.name)) {
            this.runner.simpleCheck(false,
                `Projection group with name '${group.name}' already exists ${ParseLocationUtil.location(group)}.`);
        } else {
            names.push(Names.startWithUpperCase(group.name));
            names.push(group.name);
        }
    }

    private checkUniquePrecedenceOfProjectionGroup(precedences: number[], group: FreEditProjectionGroup) {
        // check unique precedence
        if (group.precedence !== null && group.precedence !== undefined) { // precedence may be 0, "!!group.precedence" would return false
            if (group.name !== Names.defaultProjectionName && precedences.includes(group.precedence)) {
                this.runner.simpleCheck(false,
                    `Projection group with precedence '${group.precedence}' already exists ${ParseLocationUtil.location(group)}.`);
            } else {
                precedences.push(group.precedence);
            }
        } else {
            // add a generated precedence, if it is not present
            if (group.name === Names.defaultProjectionName ) {
                group.precedence = 0;
            } else {
                group.precedence = Math.max(...precedences) + 1;
                precedences.push(group.precedence);
            }
        }
    }

    private checkProjectionGroup(group: FreEditProjectionGroup, editor: FreEditUnit) {
        LOGGER.log("checking projectionGroup " + group?.name);
        this.runner.simpleCheck(!!group.name, `Editor should have a name, it is empty ${ParseLocationUtil.location(group)}.`);
        for (const projection of group.projections) {
            if (projection instanceof FreEditTableProjection) {
                projection.name = "tableRowFor_" + group.name;
            } else {
                projection.name = group.name;
            }
            this.checkProjection(projection, editor);
        }
        if (!!group.extras) {
            group.extras = this.checkAndMergeExtras(group.extras);
        }
        // special requirements for the 'default' projectionGroup
        if (group.name !== Names.defaultProjectionName) {
            this.runner.simpleCheck(!!group.globalProjections,
                `Only the 'default' projectionGroup may define global projections ${ParseLocationUtil.location(group.globalProjections[0])}.`);
            if (group.precedence !== null && group.precedence !== undefined) {
                this.runner.simpleCheck(group.precedence !== 0,
                    `Only the 'default' projectionGroup may have precedence 0 ${ParseLocationUtil.location(group)}.`);
            }
        } else {
            this.checkGlobalProjections(group.globalProjections);
            if (group.precedence !== null && group.precedence !== undefined) { // precedence may be 0, "!!group.precedence" would return false
                this.runner.simpleCheck(group.precedence === 0, `The 'default' projectionGroup must have precedence 0 ${ParseLocationUtil.location(group)}.`);
            }
        }
        const classifiersWithNormalProj: FreMetaClassifier[] = [];
        const classifiersWithTableProj: FreMetaClassifier[] = [];
        // every classifier may have only one 'normal' projection in a group
        // every classifier may have only one 'table' projection in a group
        group.projections.forEach(proj => {
            const myCls: FreMetaClassifier | undefined = proj.classifier?.referred;
            if (!!myCls) {
                if (proj instanceof FreEditTableProjection) {
                    this.runner.simpleCheck(!classifiersWithTableProj.includes(myCls),
                        `There may be only one table projection for ${myCls.name} in a projection group ${ParseLocationUtil.location(proj)}.`);
                    classifiersWithTableProj.push(myCls);
                } else if (proj instanceof FreEditNormalProjection) {
                    this.runner.simpleCheck(!classifiersWithNormalProj.includes(myCls),
                        `There may be only one 'normal' (non-table) projection for ${myCls.name} in a projection group ${ParseLocationUtil.location(proj)}.`);
                    classifiersWithNormalProj.push(myCls);
                }
            } // else: error message produced elsewhere
        });
    }

    private checkAndMergeExtras(extras: FreEditExtraClassifierInfo[]): FreEditExtraClassifierInfo[] {
        const allExtras: FreEditExtraClassifierInfo[] = [];
        for (const extra of extras) {
            if (extra.classifier !== undefined && extra.classifier !== null) {
                // first merge the extras for the same classifier
                const knownOne: FreEditExtraClassifierInfo | undefined = allExtras.find(ex => ex.classifier?.referred === extra.classifier!.referred);
                // if already present, then merge the extra info
                if (!!knownOne) {
                    if (!!extra.symbol) {
                        if (!!knownOne.symbol) {
                            this.errors.push(`symbol for classifier ${extra.classifier.name} is already defined: ${ParseLocationUtil.location(extra)} and ${ParseLocationUtil.location(knownOne)}.`);
                        } else {
                            knownOne.symbol = extra.symbol;
                        }
                    }
                    if (!!extra.trigger) {
                        if (!!knownOne.trigger) {
                            this.errors.push(`trigger for classifier ${extra.classifier.name} is already defined: ${ParseLocationUtil.location(extra)} and ${ParseLocationUtil.location(knownOne)}.`);
                        } else {
                            knownOne.trigger = extra.trigger;
                        }
                    }
                    if (!!extra.referenceShortCut) {
                        if (!!knownOne.referenceShortCut) {
                            this.errors.push(`reference shortcut for classifier ${extra.classifier.name} is already defined: ${ParseLocationUtil.location(extra)} and ${ParseLocationUtil.location(knownOne)}.`);
                        } else {
                            knownOne.referenceShortCut = extra.referenceShortCut;
                        }
                    }
                } else {
                    // this is a new extra, add it to allExtras
                    allExtras.push(extra);
                }
            }
        }

        // Check the extra info for each classifier, and
        // check whether all triggers are unique over all classifiers.
        for (const ext of allExtras) {
            this.checkExtras(ext);
            if (!!ext.trigger && !!ext.classifier) {
                const matchingExtras = allExtras.filter(xx => xx !== ext && xx.trigger === ext.trigger);
                this.runner.nestedCheck({
                    check: matchingExtras.length === 0,
                    error: `Trigger ${ext.trigger} of ${ext.classifier.name} is not unique (found ${matchingExtras.length} similar ones) ${ParseLocationUtil.location(ext)}.`,
                    whenOk: () => {
                        // allTriggers.push(other.trigger);
                    }
                });
            }
        }
        // Because missing triggers are based on the symbols, all symbols must be
        // different from the triggers, unless there is a trigger for that classifier
        // Note that this check must be done after the merging of the extras.
        for (const ext of allExtras) {
            if (!!ext.symbol && !!ext.classifier && !ext.trigger) {
                const matchingTriggers = allExtras.filter(xx => xx !== ext && xx.trigger === ext.symbol);
                const matchingSymbols = allExtras.filter(xx => xx !== ext && !xx.trigger && xx.symbol === ext.symbol);
                this.runner.nestedCheck({
                    check: matchingTriggers.length === 0 && matchingSymbols.length === 0,
                    error: `Symbol ${ext.symbol} (and therefore trigger) of ${ext.classifier.name} is equal to ${matchingTriggers.length
                    + matchingSymbols.length} other trigger(s) ${ParseLocationUtil.location(ext)}.`,
                    whenOk: () => {
                        // allSymbols.push(ext.symbol);
                    }
                });
            }
        }
        return allExtras;
    }

    private checkProjection(projection: FreEditClassifierProjection, editor: FreEditUnit) {
        LOGGER.log("checking projection for " + projection.classifier?.name);
        const myClassifier: FreMetaClassifier | undefined = projection.classifier?.referred;
        this.runner.nestedCheck({
            check: !!myClassifier,
            error: `Classifier ${projection.classifier?.name} is unknown ${ParseLocationUtil.location(projection)}`,
            whenOk: () => {
                if (myClassifier instanceof FreMetaLimitedConcept) {
                    this.runner.simpleCheck(false,
                        `A limited concept cannot have a projection, it can only be used as reference ${ParseLocationUtil.location(projection)}.`);
                } else {
                    if (projection instanceof FreEditNormalProjection) {
                        const knownFragments: string[] = projection.fragmentDefinitions.map(fr => fr.name);
                        this.checkNormalProjection(projection, myClassifier!, editor, knownFragments);
                    } else if (projection instanceof FreEditTableProjection) {
                        this.checkTableProjection(projection, myClassifier!, editor);
                    }
                    if (!!projection.fragmentDefinitions && projection.fragmentDefinitions.length > 0) {
                        projection.fragmentDefinitions.forEach(childDef => {
                            this.checkFragmentDefinition(childDef, projection, myClassifier!, editor);
                            // Note that we finalize the edit unit model with the next statement
                            childDef.belongsTo = projection;
                        });
                        // check complex fragment recursion, e.g. f1 uses f2 and f2 uses f1
                        projection.fragmentDefinitions.forEach(fragmentDef => {
                            let namesInPath: string[] = [];
                            namesInPath.push(fragmentDef.name);
                            this.checkRecursionInFragments(fragmentDef, namesInPath, projection);
                        });
                    }
                }
            }
        });
    }

    private checkRecursionInFragments(fragmentDef: FreEditFragmentDefinition, namesInPath: string[], projection: FreEditClassifierProjection) {
        fragmentDef.childProjection.getUsedFragmentNames().forEach(usedInnerInnerFragment => {
            this.runner.nestedCheck({
                check: !namesInPath.includes(usedInnerInnerFragment),
                error: `Fragment '${fragmentDef.name}' may not be recursively defined ${ParseLocationUtil.location(projection)}.`,
                whenOk: () => {
                    namesInPath.push(usedInnerInnerFragment);
                    let innerFragment: FreEditFragmentDefinition | undefined =
                        projection.fragmentDefinitions.find(fragmentDef => fragmentDef.name === usedInnerInnerFragment);
                    if (!!innerFragment) {
                        this.checkRecursionInFragments(innerFragment, namesInPath, projection);
                    }
                }
            })
        })
    }

    /**
     * Checks a part of a projection definition that defines the child of an external component, like:
     *     external SMUI_Card:First [
     *         is still under construction: ${self.isUnderConstruction switch}
     *         is approved level1: ${self.isApprovedLevel1 radio}
     *         is approved level2: ${self.isApprovedLevel2 inner-switch}
     *         is approved level3: ${self.isApprovedLevel3 checkbox}
     *     ]
     * @param fragment
     * @param projection
     * @param cls
     * @param editor
     * @private
     */
    private checkFragmentDefinition(fragment: FreEditFragmentDefinition, projection: FreEditClassifierProjection, cls: FreMetaClassifier, editor: FreEditUnit) {
        LOGGER.log("checkFragmentDefinition")
        // check unique names
        let knownFragments: string[] = [];
        projection.fragmentDefinitions.forEach(fr => {
            this.runner.nestedCheck({
                check: !knownFragments.includes(fr.name),
                error: `Fragment named ${fragment.name} is already defined, please rename one of these ${ParseLocationUtil.location(fragment)}.`,
                whenOk: () => {
                    knownFragments.push(fr.name);
                }
            })
        });
        // check the child projection
        this.checkNormalProjection(fragment.childProjection, cls, editor, knownFragments);
        // check if fragment is used in top projection, give warning
        let usedFragments: string[] = projection.findMainFragmentProjections().map(frProj => frProj.name);
        this.runner.simpleWarning(usedFragments.includes(fragment.name),
            `Fragment ${fragment.name} is defined, but not used ${ParseLocationUtil.location(projection)}.`);
    }

    private checkNormalProjection(projection: FreEditNormalProjection, cls: FreMetaClassifier, editor: FreEditUnit, knownFragments: string[]) {
        LOGGER.log("checking normal projection ");
        if (!!projection) {
            if (projection.lines.length > 1) {
                // multi-line projection, the first and last line should be empty, and
                // both will be ignored
                this.runner.nestedCheck({
                    check: projection.lines[0].isEmpty(),
                    error: `In a multi-line projection the first line should be empty (white space only) to enable indenting ${ParseLocationUtil.location(projection)}.`,
                    whenOk: () => {
                        projection.lines.splice(0, 1);
                    }
                });
                this.runner.nestedCheck({
                    check: projection.lines[projection.lines.length - 1].isEmpty(),
                    error: `In a multi-line projection the last line should be empty (white space only) to enable indenting ${ParseLocationUtil.location(projection.lines[projection.lines.length - 1])}.`,
                    whenOk: () => {
                        projection.lines.splice(projection.lines.length - 1, 1);
                    }
                });
            }
            this.runner.nestedCheck({ check: projection.lines.length > 0,
                error: `No empty projections allowed ${ParseLocationUtil.location(projection)}.`,
                whenOk: () => {
                    // a projection can also be empty when all lines are empty
                    let isEmpty: boolean = true;
                    projection.lines.forEach(line => {
                        if (!line.isEmpty()) {
                            isEmpty = false;
                        }
                    });
                    this.runner.simpleCheck(!isEmpty,
                        `No empty projections allowed ${ParseLocationUtil.location(projection)}.`);
                    projection.lines.forEach(line => {
                        this.checkLine(line, cls, editor, knownFragments, projection);
                    });
                    const first: FreEditProjectionItem = projection.lines[0]?.items[0];
                    if (first instanceof FreEditProjectionText) {
                        this.runner.simpleWarning(first.text.trimEnd() !== "?",
                            `The main projection may never be optional ${ParseLocationUtil.location(projection)}.`);
                    }
                }
            });
            FreEditParseUtil.normalize(projection);
        }
    }

    private checkLine(line: FreEditProjectionLine, cls: FreMetaClassifier, editor: FreEditUnit, knownFragments: string[], mainProjection: FreEditClassifierProjection) {
        LOGGER.log("checking line ");
        line.items.forEach(item => {
            if (item instanceof FreEditPropertyProjection) {
                this.checkPropProjection(item, cls, editor, knownFragments, mainProjection);
            } else if (item instanceof FreEditSuperProjection) {
                this.checkSuperProjection(editor, item, cls);
            } else if (item instanceof FreEditSimpleExternal) {
                this.checkExternalComponentName(editor, item.name!, ParseLocationUtil.location(item));
            } else if (item instanceof FreEditFragmentProjection) {
                this.checkFragmentProjection(item, knownFragments, editor);
                // we complete the edit model here
                item.belongsTo = mainProjection;
            }
        });
    }

    private checkFragmentProjection(item: FreEditFragmentProjection, knownFragments: string[], editor: FreEditUnit) {
        LOGGER.log("checking FreEditFragmentProjection")
        this.runner.nestedCheck({
            check: knownFragments.includes(item.name),
            error: `Fragment '${item.name}' has no definition in this projection ${ParseLocationUtil.location(item)}.`,
            whenOk: () => {
                if (!!item.wrapperInfo) {
                    this.runner.nestedCheck({
                        check: !!item.wrapperInfo?.wrapBy && item.wrapperInfo?.wrapBy.length > 0,
                        error: `A fragment projection may not be replaced, only wrapped ${ParseLocationUtil.location(item.wrapperInfo)}.`,
                        whenOk: () => {
                            this.checkExternalComponentName(editor, item.wrapperInfo!.wrapBy!, ParseLocationUtil.location(item));
                        }
                    });
                }
            }
        });
    }

    private checkTableProjection(projection: FreEditTableProjection, cls: FreMetaClassifier, editor: FreEditUnit) {
        LOGGER.log("checking table projection for " + cls?.name);
        if (!!projection) {
            this.runner.nestedCheck({
                check: projection.cells.length > 0,
                error: `Table projection '${projection.name}' should contain one or more properties as cells ${ParseLocationUtil.location(projection)}`,
                whenOk: () => {
                    this.runner.simpleCheck(projection.headers.length > 0 ? projection.cells.length === projection.headers.length : true,
                        `The number of headers should match the number of cells in table projection '${projection.name}' ${ParseLocationUtil.location(projection)}`
                    );
                    const knownFragments: string[] = projection.fragmentDefinitions.map(fr => fr.name);
                    for (const prop of projection.cells) {
                        this.checkPropProjection(prop, cls, editor, knownFragments, projection);
                    }
                }
            });
        }
    }

    private checkBooleanPropertyProjection(item: FreEditPropertyProjection, myProp: FreMetaProperty) {
        LOGGER.log("checking boolean property projection: " + myProp?.name);
        this.runner.nestedCheck({
            check: myProp instanceof FreMetaPrimitiveProperty && myProp.type === FreMetaPrimitiveType.boolean,
            error: `Property '${myProp.name}' may not have a keyword projection, because it is not of boolean type ${ParseLocationUtil.location(item)}.`,
            whenOk: () => {
                this.runner.nestedCheck({check: !myProp.isList,
                    error: `Property '${myProp.name}' may not have a keyword projection, because it is a list ${ParseLocationUtil.location(item)}.`,
                    whenOk: () => {
                        this.runner.simpleCheck(
                            !FreEditChecker.includesWhitespace(item.boolKeywords? item.boolKeywords.trueKeyword : ''),
                            `The text for a keyword projection should not include any whitespace ${ParseLocationUtil.location(item)}.`);
                    }
                });
            }
        });
    }

    private checkListProperty(item: FreEditPropertyProjection, myProp: FreMetaProperty) {
        LOGGER.log("checking list property projection: " + myProp?.name);
        if (!!item.listInfo) {
            if (item.listInfo.isTable) {
                if (myProp.isPart) {
                    // remember this property - there should be a table projection for it - to be checked later
                    this.propsWithTableProjection.push(item);
                } else {
                    this.runner.simpleWarning(false,
                        `References cannot be shown as table, property '${myProp.name}' will be shown as list instead ${ParseLocationUtil.location(item)}.`);
                    item.listInfo.isTable = false;
                }
            } else if (item.listInfo.joinType !== ListJoinType.NONE) { // the user has entered something
                let joinTypeName: string = "";
                switch (item.listInfo.joinType) {
                    case ListJoinType.Separator: joinTypeName = `Separator`; break;
                    case ListJoinType.Terminator: joinTypeName = `Terminator`; break;
                    case ListJoinType.Initiator: joinTypeName = `Initiator`; break;
                }
                this.runner.simpleCheck(!!item.listInfo.joinText, `${joinTypeName} should be followed by a string between '[' and ']' (no whitespace allowed) ${ParseLocationUtil.location(item)}.`);
            } else { // the user has only entered 'vertical' or 'horizontal'
                // create default join type
                item.listInfo.joinType = EditorDefaults.listJoinType;
                item.listInfo.joinText = EditorDefaults.listJoinText;
            }
        } else {
            // create default
            item.listInfo = new FreEditListInfo();
            // the following are set upon creation of ListInfo
            // item.listInfo.isTable = false;
            // item.listInfo.direction = FreEditProjectionDirection.Vertical;
            item.listInfo.joinType = EditorDefaults.listJoinType;
            item.listInfo.joinText = EditorDefaults.listJoinText;
        }
    }

    private checkSuperProjection(editor: FreEditUnit, item: FreEditSuperProjection, cls: FreMetaClassifier) {
        if (item.superRef === null || item.superRef === undefined) {
            return;
        }
        LOGGER.log("checking super projection: " + cls?.name);
        const myParent = item.superRef.referred;
        this.runner.nestedCheck({
            check: !!myParent,
            error: `Cannot find '${item.superRef.name}' ${ParseLocationUtil.location(item)}`,
            whenOk: () => {
                // see if myParent is indeed one of the implemented interfaces or a super concept
                if (myParent instanceof FreMetaConcept) {
                    const mySupers = LangUtil.superConcepts(cls);
                    this.runner.simpleCheck(!!mySupers.find(superCl => superCl === myParent),
                        `Concept ${myParent.name} is not a base concept of ${cls.name} ${ParseLocationUtil.location(item.superRef)}.`);
                } else if (myParent instanceof FreMetaInterface) {
                    const mySupers = LangUtil.superInterfaces(cls);
                    this.runner.simpleCheck(!!mySupers.find(superCl => superCl === myParent),
                        `Interface ${myParent.name} is not implemented by ${cls.name} ${ParseLocationUtil.location(item.superRef)}.`);
                }
                if (!!item.projectionName && item.projectionName.length > 0 ) {
                    this.checkProjectionName(item.projectionName, myParent, item, editor);
                }
            }
        });
    }

    private checkOptionalProjection(item: FreOptionalPropertyProjection, cls: FreMetaClassifier, editor: FreEditUnit, knownFragments: string[], mainProjection: FreEditClassifierProjection) {
        LOGGER.log("checking optional projection for " + cls?.name);

        const propProjections: FreEditPropertyProjection[] = [];
        let nrOfItems: number = 0;
        this.runner.nestedCheck({ check: item.lines.length > 0,
            error: `No empty projections allowed ${ParseLocationUtil.location(item)}.`,
            whenOk: () => {
                item.lines.forEach(line => {
                    this.checkLine(line, cls, editor, knownFragments, mainProjection);
                    nrOfItems += line.items.length;
                    propProjections.push(...line.items.filter(innerItem => innerItem instanceof FreEditPropertyProjection) as FreEditPropertyProjection[]);
                });
                this.runner.nestedCheck({check: propProjections.length === 1,
                    error: `There should be (only) one property within an optional projection, found ${propProjections.length} ${ParseLocationUtil.location(item)}.`,
                    whenOk: () => {
                        if (!!propProjections[0].property) { // error message already done in checkPropProjection
                            // find the optional property and set item.property
                            const myProp: FreMetaProperty = propProjections[0].property.referred;
                            this.runner.simpleCheck(myProp.isOptional || myProp.isList || myProp.isPrimitive,
                                `Property '${myProp.name}' is not a list, nor optional or primitive, therefore it may not be within an optional projection ${ParseLocationUtil.location(propProjections[0])}.`);
                            if (myProp.isPrimitive && myProp.type === FreMetaPrimitiveType.boolean) {
                                // when a primitive property is in an optional group, it will not be shown when it has the default value for that property
                                // a property of boolean type with one keyword should not be within optional group
                                if (!!propProjections[0].boolKeywords) {
                                    this.runner.simpleCheck(!!propProjections[0].boolKeywords.falseKeyword,
                                        `An optional boolean property is not allowed within an optional projection ${ParseLocationUtil.location(propProjections[0])}.`);
                                }
                            }
                            item.property = this.copyReference(propProjections[0].property);
                        }
                    }
                });
            }
        });
    }

    private checkExtras(classifierInfo: FreEditExtraClassifierInfo) {
        LOGGER.log("checking extra info on classifier " + classifierInfo.classifier?.name);
        if (!!classifierInfo.classifier?.referred) { // error message done elsewhere
            // check the reference shortcut and change the expression into a reference to a property
            if (!!classifierInfo.referenceShortcutExp && !!this.myExpressionChecker) {
                this.myExpressionChecker.checkLangExp(classifierInfo.referenceShortcutExp, classifierInfo.classifier.referred);
                const xx: FreMetaProperty | undefined = classifierInfo.referenceShortcutExp.findRefOfLastAppliedFeature();
                // checking is done by 'myExpressionChecker', still, to be sure, we surround this with an if-stat
                if (!!xx) {
                    classifierInfo.referenceShortCut = MetaElementReference.create<FreMetaProperty>(xx as FreMetaProperty, "FreProperty");
                    classifierInfo.referenceShortCut.owner = this.language!;
                }
            }
        }
        if (!!classifierInfo.trigger) {
            if (classifierInfo.trigger === "ERROR") {
                this.runner.simpleCheck(false,
                    `A trigger may not be an empty string ${ParseLocationUtil.location(classifierInfo)}.`);
                classifierInfo.trigger = '';
            }
        }
        if (!!classifierInfo.symbol) {
            if (classifierInfo.symbol === "ERROR") {
                this.runner.simpleCheck(false,
                    `A symbol may not be an empty string ${ParseLocationUtil.location(classifierInfo)}.`);
                classifierInfo.symbol = '';
            }
        }
    }

    private resolveReferences(editorDef: FreEditUnit) {
        LOGGER.log("resolving references ");
        for (const group of editorDef.projectiongroups) {
            for (const proj of group.projections) {
                if (!!proj.classifier) {
                    proj.classifier.owner = this.language!;
                }
            }
            if (!!group.extras) {
                for (const proj of group.extras) {
                    if (!!proj.classifier) {
                        proj.classifier.owner = this.language!;
                    }
                }
            }
        }
    }

    private checkPropsWithTableProjection(editor: FreEditUnit) {
        LOGGER.log("checking properties that have a TableProjection");
        for (const projection of this.propsWithTableProjection) {
            const myProp: FreMetaProperty | undefined= projection.property?.referred;
            if (!!myProp) {
                const propEditor: FreEditTableProjection[] = editor.findTableProjectionsForType(myProp.type);
                this.runner.simpleWarning(propEditor !== null && propEditor !== undefined,
                    `No table projection defined for '${myProp.name}', it will be shown as a table with a single column ${ParseLocationUtil.location(projection)}.`);
            }
        }
    }

    private checkPropProjection(item: FreEditPropertyProjection, cls: FreMetaClassifier, editor: FreEditUnit, knownFragments: string[], mainProjection: FreEditClassifierProjection) {
        LOGGER.log("checking property projection for " + cls?.name);
        if (item instanceof FreOptionalPropertyProjection) {
            this.checkOptionalProjection(item, cls, editor, knownFragments, mainProjection);
        } else {
            if (item.expression !== null && item.expression !== undefined) {
                const myProp:FreMetaProperty | undefined = cls.allProperties().find(prop => prop.name === item.expression!.appliedfeature?.sourceName);
                this.runner.nestedCheck({
                    check: !!myProp,
                    error: `Cannot find property '${item.expression!.toFreString()}' ${ParseLocationUtil.location(item)}`,
                    whenOk: () => {
                        // set the 'property' attribute of the projection
                        item.property = MetaElementReference.create<FreMetaProperty>(myProp!, "FreProperty");
                        item.property.owner = this.language!;
                        item.expression = undefined;
                        // check the rest
                        if (!!item.externalInfo) { // Note that this check needs to be done first, because there is always a default listInfo
                            this.checkExternalInfo(item, editor);
                        }
                        if (!!item.boolKeywords) {
                            // check whether the boolInfo is appropriate
                            this.checkBooleanPropertyProjection(item, myProp!);
                        }
                        if (!!item.listInfo) {
                            this.runner.nestedCheck({check: myProp!.isList,
                                error: `Only properties that are lists can be displayed as list or table ${ParseLocationUtil.location(item)}.`,
                                whenOk: () => {
                                    // either create a default list projection or check the user defined one
                                    this.checkListProperty(item, myProp!);
                                }
                            });
                        } else {
                            if (myProp!.isList && !item.externalInfo) {
                                // either create a default list projection or check the user defined one
                                this.checkListProperty(item, myProp!);
                            }
                        }
                        if (!!item.projectionName && item.projectionName.length > 0) {
                            this.runner.nestedCheck({
                                check: !myProp!.isPrimitive && myProp!.isPart,
                                error: `Named projections are only allowed for non-primitive part properties ${ParseLocationUtil.location(item)}.`,
                                whenOk: () => {
                                    const propType: FreMetaClassifier = myProp!.type;
                                    this.checkProjectionName(item.projectionName, propType, item, editor);
                                }
                            });
                        }
                        this.checkDisplayType(item, myProp!);
                    }
                });
            }
        }
    }

    private checkExternalInfo(item: FreEditPropertyProjection, editor: FreEditUnit) {
        if (!!item.externalInfo!.wrapBy && item.externalInfo!.wrapBy.length > 0) {
            // console.log("3 " + item.externalInfo.wrapBy)
            this.checkExternalComponentName(editor, item.externalInfo!.wrapBy, ParseLocationUtil.location(item.externalInfo));
        } else if (!!item.externalInfo!.replaceBy && item.externalInfo!.replaceBy.length > 0) {
            // console.log("4 " + item.externalInfo.replaceBy)
            this.checkExternalComponentName(editor, item.externalInfo!.replaceBy, ParseLocationUtil.location(item.externalInfo));
            // make sure that checkListProperty is called after the following check,
            // because that method creates default list info
            this.runner.simpleWarning(!item.listInfo,
                `Native component is replaced by external one, list settings are ignored ${ParseLocationUtil.location(item)}.`);
            item.listInfo = undefined;
            this.runner.simpleWarning(!item.boolKeywords,
                `Native component is replaced by external one, boolean settings are ignored ${ParseLocationUtil.location(item)}.`);
            item.boolKeywords = undefined
            this.runner.simpleWarning(!item.displayType,
                `Native component is replaced by external one, display settings are ignored ${ParseLocationUtil.location(item)}.`);
            item.displayType = undefined;
        }
    }

    private checkProjectionName(projectionName: string, propType: FreMetaClassifier, item: FreMetaDefinitionElement, editor: FreEditUnit) {
        if (projectionName === Names.defaultProjectionName) {
            return;
        }
        const myGroup = editor.projectiongroups.find(group => group.name === projectionName);
        const found: FreEditClassifierProjection[] | undefined = myGroup?.findProjectionsForType(propType);
        this.runner.simpleCheck(
            !!myGroup && !!found && found.length > 0,
            `Cannot find a projection named '${projectionName}' for concept or interface '${propType.name}' ${ParseLocationUtil.location(item)}.`);
    }

    private copyReference(reference: MetaElementReference<FreMetaProperty>): MetaElementReference<FreMetaProperty> {
        const result: MetaElementReference<FreMetaProperty> = MetaElementReference.create<FreMetaProperty>(reference.referred, "FreProperty");
        result.owner = this.language!;
        return result;
    }

    private checkDisplayType(item: FreEditPropertyProjection, myProp: FreMetaProperty) {
        if (myProp.isList) {
            if (myProp.type instanceof FreMetaLimitedConcept) {
                this.checkLimitedListDisplayType(item.displayType, item);
            } else {
                this.runner.simpleCheck( !item.displayType || item.displayType.length === 0,
                    `A display type may only be defined for types 'boolean', 'number', 'limited', 'limited[]', found type '${myProp.type.name}[]' ${ParseLocationUtil.location(item)}.`)
            }
        } else {
            if (myProp instanceof FreMetaPrimitiveProperty && myProp.type === FreMetaPrimitiveType.boolean ) {
                this.checkBooleanDisplayType(item.displayType, item);
            } else if (myProp instanceof FreMetaPrimitiveProperty && myProp.type === FreMetaPrimitiveType.number) {
                this.checkNumberDisplayType(item.displayType, item);
            } else if (myProp.type instanceof FreMetaLimitedConcept ) {
                this.checkSingleLimitedDisplayType(item.displayType, item);
            } else {
                this.runner.simpleCheck(!item.displayType || item.displayType.length === 0,
                    `A display type may only be defined for types 'boolean', 'number', 'limited', 'limited[]' ${ParseLocationUtil.location(item)}.`)
            }
        }
    }

    private checkGlobalProjections(globalProjections: FreEditGlobalProjection[]) {
        // console.log("Found global projections: " + globalProjections.map(proj => proj.toString()))
        for(let proj of globalProjections) {
            // first check whether the string that represents the 'for' type is correct
            this.runner.nestedCheck({
                check:  proj.for === ForType.Boolean ||
                        proj.for === ForType.Number ||
                        proj.for === ForType.Limited ||
                        proj.for === ForType.LimitedList ||
                        proj.for === ForType.ReferenceSeparator ||
                        proj.for === ForType.Externals,
                error: `A global projection may only be defined for types 'boolean', 'number', 'limited', 'limited[]', or for 'referenceSeparator' or 'externals' ${proj.for}, ${ParseLocationUtil.location(proj)}.`,
                whenOk: () => {
                    if (proj.for === ForType.Boolean) { // boolean global projection
                        // check keywords
                        if (proj.keywords !== undefined && proj.keywords !== null) {
                            this.runner.simpleCheck(
                                !FreEditChecker.includesWhitespace(proj.keywords!.trueKeyword),
                                `The text for a keyword projection should not include any whitespace ${ParseLocationUtil.location(proj)}.`);
                        }
                        // check display type
                        this.checkBooleanDisplayType(proj.displayType, proj);
                    } else if (proj.for === ForType.Number) { // number global projection, check display type
                        this.checkNumberDisplayType(proj.displayType, proj);
                    } else if (proj.for === ForType.Limited) { // limited global projection, check display type
                        this.checkSingleLimitedDisplayType(proj.displayType, proj);
                    } else if (proj.for === ForType.LimitedList) { // limited-list global projection, check display type
                        this.checkLimitedListDisplayType(proj.displayType, proj);
                    } else if (proj.for === ForType.ReferenceSeparator) {
                        // reference separator global projection, check separator
                        this.runner.nestedCheck({
                            check: proj.separator !== undefined && proj.separator !== null && proj.separator.length > 0,
                            error: `A global projection for reference separator must include a separator ${ParseLocationUtil.location(proj)}.`,
                            whenOk: () => {
                                this.runner.simpleCheck(
                                    !FreEditChecker.includesWhitespace(proj.separator!),
                                    `The text for a separator should not include any whitespace ${ParseLocationUtil.location(proj)}.`);
                            }
                        });
                    }
                }
            });
        }
    }

    private checkLimitedListDisplayType(displayType: DisplayType | undefined, elem: FreMetaDefinitionElement) {
        if (!!displayType && displayType.length > 0) {
            this.runner.simpleCheck(
                displayType === DisplayType.Text ||
                displayType === DisplayType.Checkbox,
                `A list of limited (enum) values may only be displayed as 'text', or 'checkbox' ${ParseLocationUtil.location(elem)}.`
            );
        }
    }

    private checkSingleLimitedDisplayType(displayType: DisplayType | undefined, elem: FreMetaDefinitionElement) {
        if (!!displayType && displayType.length > 0) {
            this.runner.simpleCheck(
                displayType === DisplayType.Text ||
                displayType === DisplayType.Radio,
                `A limited (enum) value may only be displayed as 'text', or 'radio' ${ParseLocationUtil.location(elem)}.`
            );
        }
    }

    private checkNumberDisplayType(displayType: DisplayType | undefined, elem: FreMetaDefinitionElement) {
        if (!!displayType && displayType.length > 0) {
            this.runner.simpleCheck(
                displayType === DisplayType.Text || displayType === DisplayType.Slider,
                `A number value may only be displayed as 'text', or 'slider' ${ParseLocationUtil.location(elem)}.`
            );
        }
    }

    private checkBooleanDisplayType(displayType: DisplayType | undefined,  elem: FreMetaDefinitionElement) {
        if (!!displayType && displayType.length > 0) {
            this.runner.simpleCheck(
                displayType == DisplayType.Text ||
                displayType === DisplayType.Checkbox ||
                displayType === DisplayType.Radio ||
                displayType === DisplayType.InnerSwitch ||
                displayType === DisplayType.Switch,
                `A boolean value may only be displayed as 'text', 'checkbox', 'radio', 'switch', or 'inner-switch' ${ParseLocationUtil.location(elem)}.`
            );
        }
    }

    private checkExternalComponentName(editor: FreEditUnit, componentName: string, parseLocation: string) {
        const externalList: string[] | undefined = editor.getDefaultProjectiongroup()?.findGlobalProjFor(ForType.Externals)?.externals;
        this.runner.nestedCheck({
            check: !!externalList,
            error: `External projection '${componentName}' is not declared in globals ${parseLocation}.`,
            whenOk: () => {
                this.runner.simpleCheck(externalList!.includes(componentName!),
                    `External projection '${componentName}' is not declared in globals ${parseLocation}.`);
            }
        })
    }
}
