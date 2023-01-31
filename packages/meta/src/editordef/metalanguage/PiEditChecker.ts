import {
    PiClassifier, PiConcept, PiInterface,
    PiLanguage,
    PiLimitedConcept,
    PiPrimitiveProperty,
    PiPrimitiveType, PiProperty
} from "../../languagedef/metalanguage";
import { Checker, CheckRunner, LangUtil, Names, PiDefinitionElement, ParseLocationUtil} from "../../utils";
import { PiEditParseUtil } from "../parser/PiEditParseUtil";
import {
    ListInfo,
    PiEditClassifierProjection,
    PiEditProjection,
    PiEditProjectionGroup,
    PiEditPropertyProjection,
    PiEditSuperProjection,
    PiEditTableProjection,
    PiEditUnit,
    PiOptionalPropertyProjection,
    ExtraClassifierInfo,
    PiEditProjectionLine,
    ListJoinType, PiEditProjectionText, PiEditProjectionItem
} from "./PiEditDefLang";
import { EditorDefaults } from "./EditorDefaults";
import { MetaLogger } from "../../utils";
import { PiElementReference } from "../../languagedef/metalanguage";
import { PiLangExpressionChecker } from "../../languagedef/checking";

const LOGGER = new MetaLogger("PiEditChecker").mute();

export class PiEditChecker extends Checker<PiEditUnit> {
    runner: CheckRunner;

    private myExpressionChecker: PiLangExpressionChecker;
    private propsWithTableProjection: PiEditPropertyProjection[] = [];

    constructor(language: PiLanguage) {
        super(language);
        this.myExpressionChecker = new PiLangExpressionChecker(this.language);
    }

    /**
     * Checks the editor definition, resolving references, and adds the defaults.
     *
     * @param editUnit
     */
    public check(editUnit: PiEditUnit): void {
        LOGGER.log("checking editUnit");
        // create a check runner
        this.runner = new CheckRunner(this.errors, this.warnings);
        // reset global(s)
        this.propsWithTableProjection = [];

        // get the language against which this editor definition should be checked and resolve all references
        if (this.language === null || this.language === undefined) {
            throw new Error(`Editor definition checker does not known the language.`);
        }
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
        let names: string[] = [];
        let precedences: number[] = [0]; // 0 is the number for the default group, which is always present
        editUnit.projectiongroups.forEach(group => {
            this.checkUniqueNameOfProjectionGroup(names, group);
            this.checkUniquePrecendenceOfProjectionGroup(precedences, group);
            group.owningDefinition = editUnit;
        });

        LOGGER.log("finalize checking");
        // warning in case there is no 'default'editor
        this.runner.simpleWarning(!!editUnit.getDefaultProjectiongroup(),
            `No editor with name 'default' found, a default editor will be generated.`);

        // add any messages found by the expression checker
        this.errors = this.errors.concat(this.myExpressionChecker.errors);
        this.warnings = this.warnings.concat(this.myExpressionChecker.warnings);
    }

    private checkUniqueNameOfProjectionGroup(names: string[], group: PiEditProjectionGroup) {
        // check unique names, disregarding upper/lower case of first character
        if (names.includes(group.name)) {
            this.runner.simpleCheck(false,
                `Projection group with name '${group.name}' already exists ${ParseLocationUtil.location(group)}.`);
        } else {
            names.push(Names.startWithUpperCase(group.name));
            names.push(group.name);
        }
    }

    private checkUniquePrecendenceOfProjectionGroup(precendences: number[], group: PiEditProjectionGroup) {
        // check unique precedence
        if (group.precedence !== null && group.precedence !== undefined) { // precedence may be 0, "!!group.precedence" would return false
            if (group.name !== Names.defaultProjectionName && precendences.includes(group.precedence)) {
                this.runner.simpleCheck(false,
                    `Projection group with precedence '${group.precedence}' already exists ${ParseLocationUtil.location(group)}.`);
            } else {
                precendences.push(group.precedence);
            }
        } else {
            // add a generated precedence, if it is not present
            if (group.name === Names.defaultProjectionName ) {
                group.precedence = 0;
            } else {
                group.precedence = Math.max(...precendences) + 1;
                precendences.push(group.precedence);
            }
        }
    }

    private checkProjectionGroup(group: PiEditProjectionGroup, editor: PiEditUnit) {
        LOGGER.log("checking projectionGroup " + group?.name);
        this.runner.simpleCheck(!!group.name, `Editor should have a name, it is empty ${ParseLocationUtil.location(group)}.`);
        for (const projection of group.projections) {
            if (projection instanceof PiEditTableProjection) {
                projection.name = 'tableRowFor_' + group.name;
            } else {
                projection.name = group.name;
            }
            this.checkProjection(projection, editor);
        }
        if (!!group.extras) {
            group.extras = this.checkAndMergeExtras(group.extras);
        }
        // special requirements for the 'default' projectionGroup
        if (group.name !== Names.defaultProjectionName){
            this.runner.simpleCheck(!group.standardBooleanProjection,
                `Only the 'default' projectionGroup may define a standard Boolean projection ${ParseLocationUtil.location(group.standardBooleanProjection)}.`);
            this.runner.simpleCheck(!group.standardReferenceSeparator,
                `Only the 'default' projectionGroup may define a standard reference separator ${ParseLocationUtil.location(group)}.`);
            if (group.precedence !== null && group.precedence !== undefined) {
                this.runner.simpleCheck(group.precedence !== 0, `Only the 'default' projectionGroup may have precedence 0 ${ParseLocationUtil.location(group)}.`);
            }
        } else {
            if (group.precedence !== null && group.precedence !== undefined) { // precedence may be 0, "!!group.precedence" would return false
                this.runner.simpleCheck(group.precedence === 0, `The 'default' projectionGroup must have precedence 0 ${ParseLocationUtil.location(group)}.`);
            }
        }
        const classifiersWithNormalProj: PiClassifier[] = [];
        const classifiersWithTableProj: PiClassifier[] = [];
        // every classifier may have only one 'normal' projection in a group
        // every classifier may have only one 'table' projection in a group
        group.projections.forEach(proj => {
            if (proj instanceof PiEditTableProjection) {
                const myCls = proj.classifier.referred;
                if (!!myCls) {
                    this.runner.simpleCheck(!classifiersWithTableProj.includes(myCls),
                        `There may be only one table projection for ${myCls.name} in a projection group ${ParseLocationUtil.location(proj)}.`);
                    classifiersWithTableProj.push(myCls);
                } // else: error message produced elsewhere
            } else if (proj instanceof PiEditProjection) {
                const myCls = proj.classifier.referred;
                if (!!myCls) {
                    this.runner.simpleCheck(!classifiersWithNormalProj.includes(myCls),
                        `There may be only one 'normal' (non-table) projection for ${myCls.name} in a projection group ${ParseLocationUtil.location(proj)}.`);
                    classifiersWithNormalProj.push(myCls);
                } // else: error message produced elsewhere
            }
        });
    }

    private checkAndMergeExtras(extras: ExtraClassifierInfo[]): ExtraClassifierInfo[] {
        const allExtras: ExtraClassifierInfo[] = [];
        for (const extra of extras) {
            // first merge the extras for the same classifier
            const knownOne = allExtras.find(ex => ex.classifier.referred === extra.classifier.referred);
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

        // Check the extra info for each classifier, and
        // check whether all triggers are unique over all classifiers.
        for (const ext of allExtras) {
            this.checkExtras(ext);
            if (!!ext.trigger) {
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
            if (!!ext.symbol && !ext.trigger) {
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

    private checkProjection(projection: PiEditClassifierProjection, editor: PiEditUnit) {
        LOGGER.log("checking projection for " + projection.classifier?.name);
        const myClassifier: PiClassifier = projection.classifier.referred;
        this.runner.nestedCheck({
            check: !!myClassifier,
            error: `Classifier ${projection.classifier.name} is unknown ${ParseLocationUtil.location(projection)}`,
            whenOk: () => {
                if (myClassifier instanceof PiLimitedConcept) {
                    this.runner.simpleCheck(false,
                        `A limited concept cannot have a projection, it can only be used as reference ${ParseLocationUtil.location(projection)}.`);
                } else {
                    if (projection instanceof PiEditProjection) {
                        this.checkNormalProjection(projection, myClassifier, editor);
                    } else if (projection instanceof PiEditTableProjection) {
                        this.checkTableProjection(projection, myClassifier, editor);
                    }
                }
            }
        });
    }

    private checkNormalProjection(projection: PiEditProjection, cls: PiClassifier, editor: PiEditUnit) {
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
                    check: projection.lines[projection.lines.length -1].isEmpty(),
                    error: `In a multi-line projection the last line should be empty (white space only) to enable indenting ${ParseLocationUtil.location(projection.lines[projection.lines.length -1])}.`,
                    whenOk: () => {
                        projection.lines.splice(projection.lines.length -1, 1);
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
                        this.checkLine(line, cls, editor);
                    });
                    const first: PiEditProjectionItem = projection.lines[0]?.items[0];
                    if (first instanceof PiEditProjectionText) {
                        this.runner.simpleWarning(first.text.trimEnd() !== "?",
                            `The main projection may never be optional ${ParseLocationUtil.location(projection)}.`);
                    }
                }
            });
            PiEditParseUtil.normalize(projection);
        }
    }

    private checkLine(line: PiEditProjectionLine, cls: PiClassifier, editor: PiEditUnit) {
        LOGGER.log("checking line ");
        line.items.forEach(item => {
            if (item instanceof PiEditPropertyProjection) {
                this.checkPropProjection(item, cls, editor);
            } else if (item instanceof PiEditSuperProjection) {
                this.checkSuperProjection(editor, item, cls);
            }
        });
    }

    private checkTableProjection(projection: PiEditTableProjection, cls: PiClassifier, editor: PiEditUnit) {
        LOGGER.log("checking table projection for " + cls?.name);
        if (!!projection) {
            this.runner.nestedCheck({
                check: projection.cells.length > 0,
                error: `Table projection '${projection.name}' should contain one or more properties as cells ${ParseLocationUtil.location(projection)}`,
                whenOk: () => {
                    this.runner.simpleCheck(projection.headers.length > 0 ? projection.cells.length === projection.headers.length : true,
                        `The number of headers should match the number of cells in table projection '${projection.name}' ${ParseLocationUtil.location(projection)}`
                    );
                    for (const prop of projection.cells) {
                        this.checkPropProjection(prop, cls, editor);
                    }
                }
            });
        }
    }

    private checkBooleanPropertyProjection(item: PiEditPropertyProjection, myProp: PiProperty) {
        LOGGER.log("checking boolean property projection: " + myProp?.name);
        this.runner.nestedCheck({
            check: myProp instanceof PiPrimitiveProperty && myProp.type === PiPrimitiveType.boolean,
            error: `Property '${myProp.name}' may not have a keyword projection, because it is not of boolean type ${ParseLocationUtil.location(item)}.`,
            whenOk: () => {
                this.runner.nestedCheck({check: !myProp.isList,
                    error: `Property '${myProp.name}' may not have a keyword projection, because it is a list ${ParseLocationUtil.location(item)}.`,
                    whenOk: () => {
                        this.runner.simpleCheck(
                            !PiEditChecker.includesWhitespace(item.boolInfo.trueKeyword),
                            `The text for a keyword projection should not include any whitespace ${ParseLocationUtil.location(item)}.`);
                    }
                });


            }
        });
    }

    private checkListProperty(item: PiEditPropertyProjection, myProp: PiProperty) {
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
                let joinTypeName: string = '';
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
            //create default
            item.listInfo = new ListInfo();
            // the following are set upon creation of ListInfo
            // item.listInfo.isTable = false;
            // item.listInfo.direction = PiEditProjectionDirection.Vertical;
            item.listInfo.joinType = EditorDefaults.listJoinType;
            item.listInfo.joinText = EditorDefaults.listJoinText;
        }
    }

    private checkSuperProjection(editor: PiEditUnit, item: PiEditSuperProjection, cls: PiClassifier) {
        LOGGER.log("checking super projection: " + cls?.name);
        const myParent = item.superRef.referred;
        this.runner.nestedCheck({
            check: !!myParent,
            error: `Cannot find "${item.superRef.name}" ${ParseLocationUtil.location(item)}`,
            whenOk: () => {
                // see if myParent is indeed one of the implemented interfaces or a super concept
                if (myParent instanceof PiConcept) {
                    const mySupers = LangUtil.superConcepts(cls);
                    this.runner.simpleCheck(!!mySupers.find(superCl => superCl === myParent),
                        `Concept ${myParent.name} is not a base concept of ${cls.name} ${ParseLocationUtil.location(item.superRef)}.`);
                } else if (myParent instanceof PiInterface) {
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

    private checkOptionalProjection(item: PiOptionalPropertyProjection, cls: PiClassifier, editor: PiEditUnit) {
        LOGGER.log("checking optional projection for " + cls?.name);

        const propProjections: PiEditPropertyProjection[] = [];
        let nrOfItems = 0;
        this.runner.nestedCheck({ check: item.lines.length > 0,
            error: `No empty projections allowed ${ParseLocationUtil.location(item)}.`,
            whenOk: () => {
                item.lines.forEach(line => {
                    this.checkLine(line, cls, editor);
                    nrOfItems += line.items.length;
                    propProjections.push(...line.items.filter(item => item instanceof PiEditPropertyProjection) as PiEditPropertyProjection[]);
                });
                this.runner.nestedCheck({check: propProjections.length === 1,
                    error: `There should be (only) one property within an optional projection, found ${propProjections.length} ${ParseLocationUtil.location(item)}.`,
                    whenOk: () => {
                        if (!!propProjections[0].property) { // error message already done in checkPropProjection
                            // find the optional property and set item.property
                            const myprop = propProjections[0].property.referred;
                            this.runner.simpleCheck(myprop.isOptional || myprop.isList || myprop.isPrimitive,
                                `Property '${myprop.name}' is not a list, nor optional or primitive, therefore it may not be within an optional projection ${ParseLocationUtil.location(propProjections[0])}.`);
                            if (myprop.isPrimitive && myprop.type === PiPrimitiveType.boolean) {
                                // when a primitive property is in an optional group, it will not be shown when it has the default value for that property
                                // a property of boolean type with one keyword should not be within optional group
                                if (!!propProjections[0].boolInfo) {
                                    this.runner.simpleCheck(!!propProjections[0].boolInfo.falseKeyword,
                                        `An optional boolean property is not allowed within an optional projection ${ParseLocationUtil.location(propProjections[0])}.`)
                                }
                            }
                            item.property = this.copyReference(propProjections[0].property);
                        }
                    }
                });
            }
        });
    }

    private checkExtras(classifierInfo: ExtraClassifierInfo) {
        LOGGER.log("checking extra info on classifier " + classifierInfo.classifier?.name);
        if (!!classifierInfo.classifier.referred) { // error message done elsewhere
            // check the reference shortcut and change the expression into a reference to a property
            if (!!classifierInfo.referenceShortcutExp) {
                this.myExpressionChecker.checkLangExp(classifierInfo.referenceShortcutExp, classifierInfo.classifier.referred);
                const xx: PiProperty = classifierInfo.referenceShortcutExp.findRefOfLastAppliedFeature();
                // checking is done by 'myExpressionChecker', still, to be sure, we surround this with an if-stat
                if (!!xx) {
                    classifierInfo.referenceShortCut = PiElementReference.create<PiProperty>(xx as PiProperty, "PiProperty");
                    classifierInfo.referenceShortCut.owner = this.language;
                }
            }
        }
        if (!!classifierInfo.trigger) {
            if (classifierInfo.trigger === "ERROR") {
                this.runner.simpleCheck(false,
                    `A trigger may not be an empty string ${ParseLocationUtil.location(classifierInfo)}.`);
                classifierInfo.trigger = null;
            }
        }
        if (!!classifierInfo.symbol) {
            if (classifierInfo.symbol === "ERROR") {
                this.runner.simpleCheck(false,
                    `A symbol may not be an empty string ${ParseLocationUtil.location(classifierInfo)}.`);
                classifierInfo.symbol = null;
            }
        }
    }

    private resolveReferences(editorDef: PiEditUnit) {
        LOGGER.log("resolving references ");
        for (const group of editorDef.projectiongroups) {
            for (const proj of group.projections) {
                proj.classifier.owner = this.language;
            }
            if (!!group.extras) {
                for (const proj of group.extras) {
                    proj.classifier.owner = this.language;
                }
            }
        }
    }

    private checkPropsWithTableProjection(editor: PiEditUnit) {
        LOGGER.log("checking properties that have a TableProjection");
        for (const projection of this.propsWithTableProjection) {
            const myprop = projection.property.referred;
            const propEditor = editor.findTableProjectionsForType(myprop.type);
            this.runner.simpleWarning(propEditor !== null && propEditor !== undefined,
                `No table projection defined for '${myprop.name}', it will be shown as a table with a single column ${ParseLocationUtil.location(projection)}.`);
        }
    }

    private checkPropProjection(item: PiEditPropertyProjection, cls: PiClassifier, editor: PiEditUnit) {
        LOGGER.log("checking property projection for " + cls?.name);
        if (item instanceof PiOptionalPropertyProjection) {
            this.checkOptionalProjection(item, cls, editor);
        } else {
            if (!!item.expression) {
                const myProp = cls.allProperties().find(prop => prop.name === item.expression.appliedfeature?.sourceName);
                this.runner.nestedCheck({
                    check: !!myProp,
                    error: `Cannot find property "${item.expression.toPiString()}" ${ParseLocationUtil.location(item)}`,
                    whenOk: () => {
                        // set the 'property' attribute of the projection
                        item.property = PiElementReference.create<PiProperty>(myProp, "PiProperty");
                        item.property.owner = this.language;
                        item.expression = null;
                        // check the rest
                        if (!!item.boolInfo) {
                            // check whether the boolInfo is appropriate
                            this.checkBooleanPropertyProjection(item, myProp);
                        } else if (!!item.listInfo) {
                            this.runner.nestedCheck({check: myProp.isList,
                                error: `Only properties that are lists can be displayed as list or table ${ParseLocationUtil.location(item)}.`,
                                whenOk: () => {
                                    // either create a default list projection or check the user defined one
                                    this.checkListProperty(item, myProp);
                                }
                            });
                        } else {
                            if (myProp.isList) {
                                this.checkListProperty(item, myProp);
                            }
                        }
                        if (!!item.projectionName && item.projectionName.length > 0) {
                            this.runner.nestedCheck({
                                check: !myProp.isPrimitive && myProp.isPart,
                                error: `Named projections are only allowed for non-primitive part properties ${ParseLocationUtil.location(item)}.`,
                                whenOk: () => {
                                    const propType = myProp.type;
                                    this.checkProjectionName(item.projectionName, propType, item, editor);
                                }
                            });
                        }
                    }
                });
            }
        }
    }

    private checkProjectionName(projectionName: string, propType: PiClassifier, item: PiDefinitionElement, editor: PiEditUnit) {
        if (projectionName === Names.defaultProjectionName) {
            return;
        }
        const myGroup = editor.projectiongroups.find(group => group.name === projectionName);
        let found: PiEditClassifierProjection[] = myGroup?.findProjectionsForType(propType);
        this.runner.simpleCheck(
            !!myGroup && !!found && found.length > 0,
            `Cannot find a projection named '${projectionName}' for concept or interface '${propType.name}' ${ParseLocationUtil.location(item)}.`);
    }

    private static includesWhitespace(keyword: string) {
        return keyword.includes(" ") || keyword.includes("\n") || keyword.includes("\r") || keyword.includes("\t");
    }

    private copyReference(reference: PiElementReference<PiProperty>): PiElementReference<PiProperty> {
        const result: PiElementReference<PiProperty> = PiElementReference.create<PiProperty>(reference.referred, "PiProperty");
        result.owner = this.language;
        return result;
    }
}
