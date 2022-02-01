import {
    PiClassifier, PiConcept, PiInterface,
    PiLangExpressionChecker,
    PiLanguage,
    PiLimitedConcept,
    PiPrimitiveProperty,
    PiPrimitiveType, PiProperty
} from "../../languagedef/metalanguage";
import { Checker, LangUtil, Names, PiDefinitionElement } from "../../utils";
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
    ListJoinType
} from "./PiEditDefLang";
import { MetaLogger } from "../../utils";
import { PiElementReference } from "../../languagedef/metalanguage";
import { EditorDefaults } from "./EditorDefaults";

const LOGGER = new MetaLogger("PiEditChecker").mute();

export class PiEditChecker extends Checker<PiEditUnit> {
    myExpressionChecker: PiLangExpressionChecker;
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
        if (this.language === null || this.language === undefined) {
            throw new Error(`Editor definition checker does not known the language.`);
        }
        editUnit.language = this.language;

        this.propsWithTableProjection = [];
        this.resolveReferences(editUnit);

        for (const group of editUnit.projectiongroups) {
            this.checkProjectionGroup(group, editUnit);
        }
        this.checkPropsWithTableProjection(editUnit);
        let names: string[] = [];
        editUnit.projectiongroups.forEach(group => {
            this.checkUniqueNameOfProjectionGroup(names, group);
            group.owningDefinition = editUnit;
        })
        this.simpleCheck(true, ``);
        this.simpleWarning(!!editUnit.getDefaultProjectiongroup(),
            `No editor with name 'default' found, a default editor will be generated.`);

        this.errors = this.errors.concat(this.myExpressionChecker.errors);
    }

    private checkUniqueNameOfProjectionGroup(names: string[], group: PiEditProjectionGroup) {
        // check unique names, disregarding upper/lower case of first character
        if (names.includes(group.name)) {
            this.simpleCheck(false,
                `Projection group with name '${group.name}' already exists ${Checker.location(group)}.`);
        } else {
            names.push(Names.startWithUpperCase(group.name));
            names.push(group.name);
        }
    }

    private checkProjectionGroup(projectionGroup: PiEditProjectionGroup, editor: PiEditUnit) {
        LOGGER.log("checking projectionGroup " + projectionGroup?.name);
        this.simpleCheck(!!projectionGroup.name, `Editor should have a name, it is empty ${Checker.location(projectionGroup)}.`);
        for (const projection of projectionGroup.projections) {
            this.checkProjection(projection, editor);
            projection.name = projectionGroup.name;
        }
        if (!!projectionGroup.extras) {
            let allTriggers: string[] = [];
            let allSymbols: string[] = [];
            for (const other of projectionGroup.extras) {
                this.checkExtras(other);
                this.nestedCheck({
                    check: !other.trigger || !allTriggers.includes(other.trigger),
                    error: `Trigger ${other.trigger} is not unique ${Checker.location(other)}.`,
                    whenOk: () => {
                        allTriggers.push(other.trigger);
                    }
                });
                this.nestedCheck({
                    check: !other.symbol || !allSymbols.includes(other.symbol),
                    error: `Symbol ${other.symbol} is not unique ${Checker.location(other)}.`,
                    whenOk: () => {
                        allSymbols.push(other.symbol)
                    }
                });
            }
        }
        // only 'default' projectionGroup may define standardBooleanProjection, referenceSeparator, and extras
        if (projectionGroup.name !== Names.defaultProjectionName){
            this.simpleCheck(!projectionGroup.standardBooleanProjection,
                `Only the 'default' projectionGroup may define a standard Boolean projection ${Checker.location(projectionGroup)}.`);
            this.simpleCheck(!projectionGroup.standardReferenceSeparator,
                `Only the 'default' projectionGroup may define a standard reference separator ${Checker.location(projectionGroup)}.`);
            this.simpleCheck(!projectionGroup.extras,
                `Only the 'default' projectionGroup may define trigger, symbols, and reference shortcuts ${Checker.location(projectionGroup)}.`);
        }
    }

    private checkProjection(projection: PiEditClassifierProjection, editor: PiEditUnit) {
        LOGGER.log("checking projection for " + projection.classifier?.name);
        const myClassifier: PiClassifier = projection.classifier.referred;
        this.nestedCheck({
            check: !!myClassifier,
            error: `Classifier ${projection.classifier.name} is unknown ${Checker.location(projection)}`,
            whenOk: () => {
                if (myClassifier instanceof PiLimitedConcept) {
                    this.simpleCheck(false,
                        `A limited concept cannot have a projection, it can only be used as reference ${Checker.location(projection)}.`);
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
                this.nestedCheck({
                    check: projection.lines[0].isEmpty(),
                    error: `In a multi-line projection the first line should be empty (white space only) to enable indenting ${Checker.location(projection)}.`,
                    whenOk: () => {
                        projection.lines.splice(0, 1);
                    }
                });
                this.nestedCheck({
                    check: projection.lines[projection.lines.length -1].isEmpty(),
                    error: `In a multi-line projection the last line should be empty (white space only) to enable indenting ${Checker.location(projection.lines[projection.lines.length -1])}.`,
                    whenOk: () => {
                        projection.lines.splice(projection.lines.length -1, 1);
                    }
                });
            }
            projection.lines.forEach(line => {
                this.checkLine(line, cls, editor);
            });
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
            this.nestedCheck({
                check: projection.cells.length > 0,
                error: `Table projection '${projection.name}' should contain one or more properties as cells ${Checker.location(projection)}`,
                whenOk: () => {
                    this.simpleCheck(projection.headers.length > 0 ? projection.cells.length === projection.headers.length : true,
                        `The number of headers should match the number of cells in table projection '${projection.name}' ${Checker.location(projection)}`
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
        this.simpleCheck(myProp instanceof PiPrimitiveProperty && myProp.type.referred === PiPrimitiveType.boolean,
            `Property '${myProp.name}' may not have a keyword projection, because it is not of boolean type ${Checker.location(item)}.`);
        this.simpleCheck(!PiEditChecker.includesWhitespace(item.boolInfo.trueKeyword), `The text for a keyword projection should not include any whitespace ${Checker.location(item)}.`);
    }

    private checkListProperty(item: PiEditPropertyProjection, myProp: PiProperty) {
        LOGGER.log("checking list property projection: " + myProp?.name);
        if (!!item.listInfo) {
            if (item.listInfo.isTable) {
                if (myProp.isPart) {
                    // remember this property - there should be a table projection for it - to be checked later
                    this.propsWithTableProjection.push(item);
                } else {
                    this.simpleCheck(false,
                        `References cannot be shown as table, property '${myProp.name}' will be shown as list instead ${Checker.location(item)}.`);
                    item.listInfo.isTable = false;
                }
            } else if (item.listInfo.joinType !== ListJoinType.NONE) { // the user has entered something
                let joinTypeName: string = '';
                switch (item.listInfo.joinType) {
                    case ListJoinType.Separator: joinTypeName = `Separator`; break;
                    case ListJoinType.Terminator: joinTypeName = `Terminator`; break;
                    case ListJoinType.Initiator: joinTypeName = `Initiator`; break;
                }
                this.simpleCheck(!!item.listInfo.joinText, `${joinTypeName} should be followed by a string between '[' and ']' (no whitespace allowed) ${Checker.location(item)}.`);
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
        this.nestedCheck({
            check: !!myParent,
            error: `Cannot find "${item.superRef.name}" ${Checker.location(item)}`,
            whenOk: () => {
                // see if myParent is indeed one of the implemented interfaces or a super concept
                if (myParent instanceof PiConcept) {
                    const mySupers = LangUtil.superConcepts(cls);
                    this.simpleCheck(!!mySupers.find(superCl => superCl === myParent),
                        `Concept ${myParent.name} is not a base concept of ${cls.name} ${Checker.location(item.superRef)}.`);
                } else if (myParent instanceof PiInterface) {
                    const mySupers = LangUtil.superInterfaces(cls);
                    this.simpleCheck(!!mySupers.find(superCl => superCl === myParent),
                        `Interface ${myParent.name} is not implemented by ${cls.name} ${Checker.location(item.superRef)}.`);
                }
                if (!!item.projectionName && item.projectionName.length > 0 ) {
                    this.checkProjectionName(item.projectionName, myParent, item, editor);
                }
            }
        });
    }

    private checkOptionalProjection(item: PiOptionalPropertyProjection, cls: PiClassifier, editor: PiEditUnit) {
        LOGGER.log("checking optional projection for " + cls?.name);
        // TODO when a primitive property is in an optional group is will not be shown when it has the default value for that property
        // TODO add check on boolean prop with one keyword => should not be within optional group
        const propProjections: PiEditPropertyProjection[] = [];
        let nrOfItems = 0;
        item.lines.forEach(line => {
            this.checkLine(line, cls, editor);
            nrOfItems += line.items.length;
            propProjections.push(...line.items.filter(item => item instanceof PiEditPropertyProjection) as PiEditPropertyProjection[]);
        });
        this.nestedCheck({check: propProjections.length === 1,
            error: `There should be (only) one property within an optional projection, found ${propProjections.length} ${Checker.location(item)}.`,
            whenOk: () => {
                // find the optional property and set item.property
                const myprop = propProjections[0].property.referred;
                this.simpleCheck(myprop.isOptional || myprop.isList || myprop.isPrimitive,
                    `Property '${myprop.name}' is not optional, not a list or primitive, therefore it may not be within an optional projection ${Checker.location(propProjections[0])}.`)
                item.property = this.copyReference(propProjections[0].property);
            }
        });
    }

    private checkExtras(classifierInfo: ExtraClassifierInfo) {
        LOGGER.log("checking extra info on classifier " + classifierInfo.classifier?.name);
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
        if (!!classifierInfo.trigger) {
            if (classifierInfo.trigger === "ERROR") {
                this.simpleCheck(false,
                    `A trigger may not be an empty string ${Checker.location(classifierInfo)}`);
                classifierInfo.trigger = null;
            }
        }
        if (!!classifierInfo.symbol) {
            if (classifierInfo.symbol === "ERROR") {
                this.simpleCheck(false,
                    `A symbol may not be an empty string ${Checker.location(classifierInfo)}`);
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
            const propEditor = editor.findTableProjectionForType(myprop.type.referred);
            this.simpleWarning(propEditor !== null && propEditor !== undefined,
                `No table projection defined for '${myprop.name}', it will be shown as a table with a single column ${Checker.location(projection)}.`);
        }
    }

    private checkPropProjection(item: PiEditPropertyProjection, cls: PiClassifier, editor: PiEditUnit) {
        LOGGER.log("checking property projection for " + cls?.name);
        if (item instanceof PiOptionalPropertyProjection) {
            this.checkOptionalProjection(item, cls, editor);
        } else {
            if (!!item.expression) {
                const myProp = cls.allProperties().find(prop => prop.name === item.expression.appliedfeature?.sourceName);
                this.nestedCheck({
                    check: !!myProp,
                    error: `Cannot find property "${item.expression.toPiString()}" ${Checker.location(item)}`,
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
                            this.nestedCheck({check: myProp.isList,
                                error: `Only properties that are lists can be displayed as list or table ${Checker.location(item)}.`,
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
                            this.nestedCheck({
                                check: !myProp.isPrimitive && myProp.isPart,
                                error: `Named projections are only allowed for non-primitive part properties ${Checker.location(item)}.`,
                                whenOk: () => {
                                    const propType = myProp.type.referred;
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
        if (projectionName !== Names.defaultProjectionName) {
            const myGroup = editor.projectiongroups.find(group => group.name === projectionName);
            const found = myGroup?.findProjectionForType(propType);
            this.simpleCheck(
                !!myGroup && !!found,
                `Cannot find a projection named '${projectionName}' for concept or interface '${propType.name}' ${Checker.location(item)}.`);
        } else {
            this.simpleWarning(false,
                `No default projection defined, using generated default ${Checker.location(item)}.`);
        }
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
