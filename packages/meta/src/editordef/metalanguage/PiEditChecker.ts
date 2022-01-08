import {
    PiClassifier, PiInstance, PiLangElement,
    PiLangExpressionChecker,
    PiLanguage,
    PiLimitedConcept,
    PiPrimitiveProperty,
    PiPrimitiveType, PiProperty
} from "../../languagedef/metalanguage";
import { Checker } from "../../utils";
import {
    ListInfo,
    PiEditClassifierProjection,
    PiEditProjection,
    PiEditProjectionGroup,
    PiEditProjectionText,
    PiEditPropertyProjection,
    PiEditSuperProjection,
    PiEditTableProjection,
    PiEditUnit,
    PiOptionalPropertyProjection,
    ExtraClassifierInfo,
    PiEditProjectionLine,
    ListJoinType,
    PiEditLimitedProjection,
    PiEditInstanceProjection
} from "./PiEditDefLang";
import { MetaLogger } from "../../utils/MetaLogger";
import { PiElementReference } from "../../languagedef/metalanguage/PiElementReference";

const LOGGER = new MetaLogger("PiEditChecker"); // .mute();

export class PiEditChecker extends Checker<PiEditUnit> {
    myExpressionChecker: PiLangExpressionChecker;
    propsWithTableProjection: PiEditPropertyProjection[] = [];
    projectionsForLimitedType: PiEditClassifierProjection[] = []; // to be removed after checking !!

    constructor(language: PiLanguage) {
        super(language);
        this.myExpressionChecker = new PiLangExpressionChecker(this.language);
    }

    /**
     * Checks the editor definition, resolving references on the fly.
     *
     * @param editUnit
     */
    public check(editUnit: PiEditUnit): void {
        if (this.language === null || this.language === undefined) {
            throw new Error(`Editor definition checker does not known the language.`);
        }
        editUnit.language = this.language;

        this.propsWithTableProjection = [];
        this.resolveReferences(editUnit);

        for (const group of editUnit.projectiongroups) {
            this.checkProjectionGroup(group);
            this.removeLimitedProjections(group);
        }
        this.checkPropsWithTableProjection(editUnit);
        // TODO there should be a 'default' projectionGroup
        // TODO only 'default' projectionGroup may define standardBooleanProjection and referenceSeparator
        // TODO table projection may not be used for limited concept
        // TODO projection for limited concept may have 1 keyword, not 2
        // TODO optional projection may have just one property
        // TODO set property filed of optional projection
        this.errors = this.errors.concat(this.myExpressionChecker.errors);
    }

    private checkProjectionGroup(projectionGroup: PiEditProjectionGroup) {
        this.simpleCheck(!!projectionGroup.name, `Editor should have a name, it is empty ${this.location(projectionGroup)}.`);
        for (const projection of projectionGroup.projections) {
            this.checkProjection(projection, projectionGroup);
            projection.name = projectionGroup.name;
        }
        for (const other of projectionGroup.extras) {
            this.checkExtras(other);
        }
    }

    private checkProjection(projection: PiEditClassifierProjection, group: PiEditProjectionGroup) {
        const myClassifier: PiClassifier = projection.classifier?.referred;
        this.nestedCheck({
            check: !!myClassifier,
            error: `Classifier ${projection.classifier.name} is unknown ${this.location(projection)}.`,
            whenOk: () => {
                if (myClassifier instanceof PiLimitedConcept) {
                    if (projection instanceof PiEditProjection) {
                        // create another type of projection, which could not be parsed directly
                        // and replace the parsed projection with the new one
                        let myLim: PiEditLimitedProjection = this.createAndCheckLimitedProjection(projection, myClassifier);
                        this.projectionsForLimitedType.push(projection);
                        group.projections.push(myLim);
                    } else {
                        this.simpleCheck(false,
                            `A limited concept cannot be projected as a table ${this.location(projection)}`);
                    }
                }
                if (projection instanceof PiEditProjection) {
                    this.checkNormalProjection(projection, myClassifier);
                } else if (projection instanceof PiEditTableProjection) {
                    this.checkTableProjection(projection, myClassifier);
                }
            }
        });
    }

    private checkNormalProjection(projection: PiEditProjection, cls: PiClassifier) {
        if (!!projection) {
            projection.lines.forEach(line => {
                this.checkLine(line, cls);
            });
        }
    }

    private checkLine(line: PiEditProjectionLine, cls: PiClassifier) {
        line.items.forEach((item, index) => {
            if (item instanceof PiEditProjectionText) {
                // TODO ???
            } else if (item instanceof PiEditPropertyProjection) {
                this.checkPropProjection(item, cls);
            } else if (item instanceof PiEditSuperProjection) {
                this.checkSuperProjection(item, cls, false);
            }
        });
    }

    private checkTableProjection(projection: PiEditTableProjection, cls: PiClassifier) {
        // TODO see which checks are actually useful
        if (!!projection) {
            this.nestedCheck({
                check: projection.cells.length > 0,
                error: `Table projection '${projection.name}' should contain one or more properties as cells ${this.location(projection)}`,
                whenOk: () => {
                    this.simpleCheck(projection.headers.length > 0 ? projection.cells.length === projection.headers.length : true,
                        `The number of headers should match the number of cells in table projection '${projection.name}' ${this.location(projection)}`
                    );
                    for (const prop of projection.cells) {
                        this.checkPropProjection(prop, cls);
                    }
                }
            });
        }
    }

    private createLimitedPropertyProjection(projection: PiEditPropertyProjection, cls: PiLimitedConcept): PiEditInstanceProjection {
        // an instance of a limited concept can (!) have an alternative projection: "${INSTANCE [text]}"
        // this alternative is being checked in this method
        let myProj: PiEditInstanceProjection = new PiEditInstanceProjection();
        this.myExpressionChecker.checkLangExp(projection.expression, cls);
        // console.log("expression 1: " + projection.expression.toPiString() + ", app feat: " + projection.expression.appliedfeature?.toPiString());
        // console.log("prop 1: " + projection.expression.findRefOfLastAppliedFeature().name);

        const myinstance = cls.findInstance(projection.expression.appliedfeature.sourceName);
        this.nestedCheck({
            check: !!myinstance,
            error: `Cannot find instance ${projection.expression.sourceName} of limited concept ${cls.name} ${this.location(projection)}`,
            whenOk: () => {
                this.simpleCheck(
                    !this.includesWhitespace(projection.boolInfo.trueKeyword),
                    `The text for a keyword projection should not include any whitespace ${this.location(projection)}`);
            }
        });
        myProj.instance = PiElementReference.create<PiInstance>(myinstance, "PiInstance");
        myProj.instance.owner = cls.language;
        myProj.keyword = projection.boolInfo;
        return myProj;
    }

    private checkBooleanPropertyProjection(item: PiEditPropertyProjection, myProp: PiProperty, cls: PiClassifier) {
        this.simpleCheck(myProp instanceof PiPrimitiveProperty && myProp.type.referred === PiPrimitiveType.boolean,
            `Property '${myProp.name}' may not have a keyword projection, because it is not of boolean type ${this.location(item)}`);
        this.simpleCheck(!this.includesWhitespace(item.boolInfo.trueKeyword), `The text for a keyword projection should not include any whitespace ${this.location(item)}`);
    }

    private checkListProperty(item: PiEditPropertyProjection, myprop: PiProperty, cls: PiClassifier) {
        if (!!item.listInfo) {
            this.simpleCheck(!(myprop instanceof PiPrimitiveProperty),
                `Only properties that are lists can be displayed as list or table ${this.location(item)}`);
            //
            const listInfoPresent: boolean = !(item.listInfo.joinType === ListJoinType.NONE);
            const tabelInfoPresent: boolean = item.listInfo.isTable;
            this.simpleCheck(!(listInfoPresent && tabelInfoPresent),
                `Property '${myprop.name}' can be projected either as list or table, not both ${this.location(item)}`);
            // create default listInfo if neither listInfo nor tableInfo are present
            if (!listInfoPresent && !tabelInfoPresent) {
                item.listInfo = new ListInfo();
            } else if (listInfoPresent && item.listInfo.joinType !== ListJoinType.NONE) {
                let joinTypeName: string = '';
                switch (item.listInfo.joinType) {
                    case ListJoinType.Separator: joinTypeName = `separator`; break;
                    case ListJoinType.Terminator: joinTypeName = `terminator`; break;
                    case ListJoinType.Initiator: joinTypeName = `initiator`; break;
                }
                this.simpleCheck(!!item.listInfo.joinText, `${joinTypeName} should be followed by a string between '[' and ']' ${this.location(item)}`);
            } else if (tabelInfoPresent) {
                // remember this property - there should be a table projection for it - to be checked later
                this.propsWithTableProjection.push(item);
            }
        } else {
            //create default
            item.listInfo = new ListInfo();
        }
    }

    private checkSingleProperty(item: PiEditPropertyProjection, myProp: PiProperty, cls: PiClassifier) {
        if (!(myProp instanceof PiPrimitiveProperty) && myProp.isList) {
            // TODO replace item by PiListPropertyProjection
        }
    }

    private checkSuperProjection(item: PiEditSuperProjection, cls: PiClassifier, b: boolean) {
        const myParent = item.superRef.referred;
        this.nestedCheck({
            check: !!myParent,
            error: `Cannot find "${item.superRef.name}" ${this.location(item)}`,
            whenOk: () => {
                // see if myParent is indeed one of the implemented interfaces or a super concept
                // TODO
            }
        });
    }

    private checkOptionalProjection(item: PiOptionalPropertyProjection, cls: PiClassifier) {
        const propProjections: PiEditPropertyProjection[] = [];
        item.lines.forEach(line => {
            this.checkLine(line, cls);
            propProjections.push(...line.items.filter(item => item instanceof PiEditPropertyProjection) as PiEditPropertyProjection[]);
        });
        this.nestedCheck({check: propProjections.length === 1,
            error: `There should be only one property within an optional projection, found ${propProjections.length} ${this.location(item)}`,
            whenOk: () => {
                // find the optional property and set item.property
                const myprop = propProjections[0].property.referred;
                this.simpleWarning(myprop.isOptional,
                    `Property '${myprop.name}' is not optional, therefore it should not be within an optional projection ${this.location(propProjections[0])}`)
                item.property = this.copyReference(propProjections[0].property);
            }
        });
    }

    private checkExtras(other: ExtraClassifierInfo) {
        // check the reference shortcut and change the expression into a reference to a property
        if (!!other.referenceShortcutExp) {
            this.myExpressionChecker.checkLangExp(other.referenceShortcutExp, other.classifier.referred);
            const xx: PiProperty = other.referenceShortcutExp.findRefOfLastAppliedFeature();
            // checking is done by 'myExpressionChecker', still, to be sure, we surround this with an if-stat
            if (!!xx) {
                other.referenceShortCut = PiElementReference.create<PiProperty>(xx as PiProperty, "PiProperty");
                other.referenceShortCut.owner = this.language;
            }
        }
        // TODO check the trigger
        // TODO check the symbol
    }

    private resolveReferences(editorDef: PiEditUnit) {
        for (const group of editorDef.projectiongroups) {
            for (const proj of group.projections) {
                proj.classifier.owner = this.language;
            }
            for (const proj of group.extras) {
                proj.classifier.owner = this.language;
            }
        }
    }

    private checkPropsWithTableProjection(editor: PiEditUnit) {
        const tabelProjections: PiEditTableProjection[] = editor.allTableProjections();
        for (const projection of this.propsWithTableProjection) {
            const myprop = projection.property.referred;
            const propEditor = editor.findTableProjectionForType(myprop.type.referred);
            if (propEditor === null || propEditor === undefined) {
                // create default listInfo if not present
                if (!(!!projection.listInfo)) {
                    projection.listInfo = new ListInfo();
                }
                this.simpleWarning(false,
                    `No table projection defined for '${myprop.name}', it will be shown as a horizontal list ${this.location(projection)}`);
            }
        }
    }

    private checkPropProjection(item: PiEditPropertyProjection, cls: PiClassifier) {
        if (item instanceof PiOptionalPropertyProjection) {
            this.checkOptionalProjection(item, cls);
        // } else if (cls instanceof PiLimitedConcept && !!item.boolInfo) {
        //     this.checkLimitedPropertyProjection(item, cls);
        } else {
            this.myExpressionChecker.checkLangExp(item.expression, cls);
            // console.log("expression 2: " + item.expression.toPiString() + ", app feat: " + item.expression.appliedfeature?.toPiString());
            // console.log("prop 2: " + item.expression.findRefOfLastAppliedFeature()?.name);
            const myProp = cls.allProperties().find(prop => prop.name === item.expression.appliedfeature?.sourceName);
            this.nestedCheck({
                check: !!myProp,
                error: `Cannot find property "${item.expression.toPiString()}" ${this.location(item)}`,
                whenOk: () => {
                    // set the 'property' attribute of the projection
                    item.property = PiElementReference.create<PiProperty>(myProp, "PiProperty");
                    item.property.owner = this.language;
                    item.expression = null;
                    // check the rest
                    if (!!item.boolInfo) {
                        // check whether the boolInfo is appropriate
                        this.checkBooleanPropertyProjection(item, myProp, cls);
                    } else if (myProp.isList) {
                        // either create a default list projection or check the user defined one
                        this.checkListProperty(item, myProp, cls);
                    } else {
                        // check all other issues
                        this.checkSingleProperty(item, myProp, cls);
                    }
                }
            });
        }
    }

    private includesWhitespace(keyword: string) {
        return keyword.includes(" ") || keyword.includes("\n") || keyword.includes("\r") || keyword.includes("\t");
    }
    ///

    // private checkReferenceShortcut(conceptEditor: PiEditConcept) {
    //     if (!!(conceptEditor.referenceShortcut)) {
    //         this.myExpressionChecker.checkLangExp(conceptEditor.referenceShortcut, conceptEditor.concept.referred);
    //         this.nestedCheck({
    //             check: conceptEditor.referenceShortcut instanceof PiLangSelfExp,
    //             error: `referenceShortcut for concept ${conceptEditor.concept.name} should start with "self" ${this.location(conceptEditor)}.`
    //         });
    //     }
    // }

    private createAndCheckLimitedProjection(projection: PiEditProjection, myClassifier: PiLimitedConcept): PiEditLimitedProjection {
        let myLim: PiEditLimitedProjection = new PiEditLimitedProjection();
        projection.lines.forEach(line => {
            line.items.forEach((item, index) => {
                if (item instanceof PiEditPropertyProjection) {
                    myLim.instanceProjections.push(this.createLimitedPropertyProjection(item, myClassifier));
                }
            })
        });
        // TODO all instances should be projected by a keyword or none at all
        return myLim;
    }

    private removeLimitedProjections(group: PiEditProjectionGroup) {
        // TODO
        this.projectionsForLimitedType = [];
    }

    private copyReference(reference: PiElementReference<PiProperty>): PiElementReference<PiProperty> {
        const result: PiElementReference<PiProperty> = PiElementReference.create<PiProperty>(reference.referred, "PiProperty");
        result.owner = this.language;
        return result;
    }
}
