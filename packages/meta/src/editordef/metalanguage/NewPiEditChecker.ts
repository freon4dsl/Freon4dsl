import {
    PiClassifier,
    PiLangExpressionChecker,
    PiLanguage,
    PiLimitedConcept,
    PiPrimitiveProperty,
    PiPrimitiveType, PiProperty
} from "../../languagedef/metalanguage";
import { Checker } from "../../utils";
import {
    ListInfo, PiEditClassifierProjection,
    PiEditProjection, PiEditProjectionGroup, PiEditProjectionText,
    PiEditPropertyProjection, PiEditSuperProjection,
    PiEditTableProjection,
    PiEditUnit, PiOptionalPropertyProjection, ExtraClassifierInfo, PiEditProjectionLine
} from "./NewPiEditDefLang";
import { MetaLogger } from "../../utils/MetaLogger";
import { PiElementReference } from "../../languagedef/metalanguage/PiElementReference";

const LOGGER = new MetaLogger("PiEditChecker"); // .mute();

export class NewPiEditChecker extends Checker<PiEditUnit> {
    myExpressionChecker: PiLangExpressionChecker;
    propsWithTableProjection: PiEditPropertyProjection[] = [];

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
        }
        this.checkPropsWithTableProjection(editUnit);
        this.errors = this.errors.concat(this.myExpressionChecker.errors);
    }

    private checkProjectionGroup(projectionGroup: PiEditProjectionGroup) {
        this.simpleCheck(!!projectionGroup.name, `Editor should have a name, it is empty ${this.location(projectionGroup)}.`);
        for (const projection of projectionGroup.projections) {
            this.checkProjection(projection);
        }
        for (const other of projectionGroup.extras) {
            this.checkExtras(other);
        }
    }

    private checkProjection(projection: PiEditClassifierProjection) {
        const myClassifier: PiClassifier = projection.classifier?.referred;
        this.nestedCheck({
            check: !!myClassifier,
            error: `Classifier ${projection.classifier.name} is unknown ${this.location(projection)}.`,
            whenOk: () => {
                this.nestedCheck({
                    check: !(myClassifier instanceof PiLimitedConcept),
                    error: `Limited concepts cannot have a projection, they can only be referred to ${this.location(projection)}`,
                    whenOk: () => {
                        if (projection instanceof PiEditProjection) {
                            this.checkNormalProjection(projection, myClassifier);
                        } else if (projection instanceof PiEditTableProjection) {
                            this.checkTableProjection(projection, myClassifier);
                        }
                    }
                });
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
                // TODO
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

    private checkBooleanPropertyProjection(item: PiEditPropertyProjection, myProp: PiProperty, cls: PiClassifier) {
        this.simpleCheck(myProp instanceof PiPrimitiveProperty && myProp.type.referred === PiPrimitiveType.boolean,
            `Property '${myProp.name}' may not have a keyword projection, because it is not of boolean type ${this.location(item)}`);
        this.simpleCheck(!this.includesWhitespace(item.boolInfo.trueKeyword), `The text for a keyword projection should not include any whitespace ${this.location(item)}`);
    }

    private checkListProperty(item: PiEditPropertyProjection, myprop: PiProperty, cls: PiClassifier) {
        if (!!item.listInfo) {
            this.simpleCheck(!(myprop instanceof PiPrimitiveProperty),
                `Only properties that are lists can be displayed as list or table ${this.location(item)}`);
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
        item.lines.forEach(line => {
            this.checkLine(line, cls);
        });
        // TODO find the optional property and set item.property
        let myProp: PiProperty = null;

        // if (optional) {
        //     // TODO this error should be a warning only
        //     // TODO think through this error message
        //     this.simpleCheck(myprop.isOptional,
        //         `Property '${myprop.name}' is not optional, therefore it should not have an optional projection ${this.location(projection)}`)
        // }
    }

    private checkExtras(other: ExtraClassifierInfo) {

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
            const myprop = projection.expression.findRefOfLastAppliedFeature();
            const propEditor = editor.findTableProjectionForType(myprop.type.referred);
            if (propEditor !== null && propEditor !== undefined) {
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
        } else {
            const myProp = cls.allProperties().find(prop => prop.name === item.expression.appliedfeature.sourceName);
            this.nestedCheck({
                check: !!myProp,
                error: `Cannot find property "${item.expression.toPiString()}" ${this.location(item)}`,
                whenOk: () => {
                    // set the 'property' attribute of the projection
                    item.property = PiElementReference.create<PiProperty>(myProp, "PiProperty");
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
    // private checkPropertyProjection(projection: PiEditPropertyProjection, cls: PiClassifier, optional: boolean) {
    //     if (cls instanceof PiLimitedConcept && projection.expression.sourceName !== "self") {
    //         this.checkLimitedProjection(projection, cls);
    //     } else {
    //         this.myExpressionChecker.checkLangExp(projection.expression, cls);
    //         const myprop = projection.expression.findRefOfLastAppliedFeature();
    //         if (!!myprop) {
    //             if (!myprop.isList) {
    //
    //             } else {
    //                 const listInfoPresent = !!projection.listInfo;
    //                 const tabelInfoPresent = !!projection.tableInfo;
    //                 this.simpleCheck(!(listInfoPresent && tabelInfoPresent),
    //                     `Property '${myprop.name}' can be projected either as list or table, not both ${this.location(projection)}`);
    //
    //                 // create default listInfo if neither listInfo nor tableInfo are present
    //                 if (!listInfoPresent && !tabelInfoPresent) {
    //                     projection.listInfo = new ListInfo();
    //                 } else if (listInfoPresent && projection.listInfo.joinType !== ListInfoType.NONE) {
    //                     const text = projection.listInfo.joinType === ListInfoType.Separator ? `@separator` : `@terminator`;
    //                     this.simpleCheck(!!projection.listInfo.joinText, `${text} should be followed by a string between '[' and ']' ${this.location(projection)}`);
    //                 } else if (tabelInfoPresent) {
    //                     // remember this property - there should be a table projection for it - to be checked later
    //                     this.propsWithTableProjection.push(projection);
    //                 }
    //             }
    //         }
    //     }
    // }

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

    //
    // private unique(array: PiEditConcept[]): PiEditConcept[] {
    //     const seen = new Set();
    //     return array.filter(function(item) {
    //         if (!seen.has(item.concept.referred)) {
    //             seen.add(item.concept.referred);
    //             return false;
    //         } else {
    //             return true;
    //         }
    //     });
    // }
    //


}
