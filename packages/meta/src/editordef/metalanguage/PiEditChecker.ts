import {
    PiClassifier,
    PiInstanceExp,
    PiLangExpressionChecker,
    PiLangSelfExp,
    PiLanguage,
    PiLimitedConcept,
    PiPrimitiveProperty, PiProperty
} from "../../languagedef/metalanguage";
import { Checker } from "../../utils";
import {
    ListInfo,
    ListInfoType,
    PiEditConcept,
    PiEditInstanceProjection,
    PiEditProjection,
    PiEditPropertyProjection,
    PiEditSubProjection, PiEditTableProjection,
    PiEditUnit
} from "./PiEditDefLang";
import { MetaLogger } from "../../utils/MetaLogger";
import { PiPrimitiveType } from "../../languagedef/metalanguage/PiLanguage";

const LOGGER = new MetaLogger("DefEditorChecker"); // .mute();

export class PiEditChecker extends Checker<PiEditUnit> {
    myExpressionChecker: PiLangExpressionChecker;
    propsWithTableProjection: PiEditPropertyProjection[] = [];

    constructor(language: PiLanguage) {
        super(language);
        this.myExpressionChecker = new PiLangExpressionChecker(this.language);
    }

    /**
     * Checks the editor definition, resolving references on the fly.
     *
     * @param editor
     */
    public check(editor: PiEditUnit): void {
        if (this.language === null || this.language === undefined) {
            throw new Error(`Editor definition checker does not known the language.`);
        }
        editor.language = this.language;
        this.propsWithTableProjection = [];
        this.nestedCheck(
            {
                check: this.language.name === editor.languageName,
                error: `Language reference ('${editor.languageName}') in editor definition '${editor.name}' ` +
                    `does not match language '${this.language.name}' ${this.location(editor)}.`,
                whenOk: () => {
                    this.resolveReferences(editor);
                    this.nestedCheck(
                        {
                            check: !!editor.name,
                            error: `Editor should have a name, it is empty ${this.location(editor)}.`
                        });
                    for (const conceptEditor of editor.conceptEditors) {
                        this.checkConceptEditor(conceptEditor);
                    }
                    this.checkEditor(editor);
                    this.checkPropsWithTableProjection(editor);
                    this.errors = this.errors.concat(this.myExpressionChecker.errors);
                }
            });
    }

    private checkConceptEditor(conceptEditor: PiEditConcept) {
        // TODO maybe use this.myExpressionChecker.checkClassifierReference(conceptEditor.concept);
        this.nestedCheck({
            check: !!conceptEditor.concept.referred,
            error: `Concept ${conceptEditor.concept.name} is unknown ${this.location(conceptEditor)}.`,
            whenOk: () => {
                this.checkProjection(conceptEditor.projection, conceptEditor.concept.referred);
                conceptEditor.tableProjections.forEach(proj => {
                    this.checkTableProjection(proj, conceptEditor.concept.referred);
                });
                this.checkReferenceShortcut(conceptEditor);
            }
        });
    }

    private checkReferenceShortcut(conceptEditor: PiEditConcept) {
        if (!!(conceptEditor.referenceShortcut)) {
            this.myExpressionChecker.checkLangExp(conceptEditor.referenceShortcut, conceptEditor.concept.referred);
            this.nestedCheck( {
                check: conceptEditor.referenceShortcut instanceof PiLangSelfExp,
                error: `referenceShortcut for concept ${conceptEditor.concept.name} should start with "self" ${this.location(conceptEditor)}.`,
            })
        }
    }

    private checkEditor(editor: PiEditUnit) {
        const conceptEditorsDoubles = this.unique(editor.conceptEditors);
        conceptEditorsDoubles.forEach(ced => {
                this.errors.push(`Editor definition for concept ${ced.concept.name} is already defined earlier ${this.location(ced)}.`);
            }
        );
    }

    private checkTableProjection(projection: PiEditTableProjection, cls: PiClassifier) {
        // TODO see which checks are actually useful
        if (!!projection) {
            this.nestedCheck( {
                check: projection.cells.length > 0,
                error: `Table projection '${projection.name}' should contain one or more properties as cells ${this.location(projection)}`,
                whenOk: () => {
                    this.simpleCheck(projection.headers.length > 0 ? projection.cells.length === projection.headers.length : true,
                        `The number of headers should match the number of cells in table projection '${projection.name}' ${this.location(projection)}`
                    );
                    for (const prop of projection.cells) {
                        this.checkPropertyProjection(prop, cls, false);
                    }
                }
            })

        }
    }

    private checkProjection(projection: PiEditProjection, cls: PiClassifier) {
        if (!!projection) {
            projection.lines.forEach(line => {
                const toBeReplaced: number[] = [];
                line.items.forEach((item, index) => {
                    if (item instanceof PiEditPropertyProjection) {
                        if (cls instanceof PiLimitedConcept && item.expression.sourceName !== "self") {
                            this.checkLimitedProjection(item, cls);
                            toBeReplaced.push(index);
                        } else {
                            this.checkPropertyProjection(item, cls, false);
                        }
                    } else if (item instanceof PiEditSubProjection) {
                        this.checkSubProjection(item, cls);
                    }
                });
                // the projection for an instance of a limited concept has been parsed as PiEditPropertyProjection
                // but it should be a PiEditInstanceProjection
                // TODO LimitedConcepts can never be created in a model (they are all predefined).
                //      Therefore this is never used, until we start showing the predefined elements in the editor.
                for (const i of toBeReplaced) {
                    const propProjection: PiEditPropertyProjection = line.items[i] as PiEditPropertyProjection;
                    const instanceProjection = new PiEditInstanceProjection();
                    instanceProjection.keyword = propProjection.keyword;
                    instanceProjection.expression = new PiInstanceExp();
                    instanceProjection.expression.sourceName = cls.name;
                    instanceProjection.expression.instanceName = propProjection.expression.sourceName;
                    instanceProjection.expression.language = this.language;
                    // TODO find out why the following statement is needed. otherwise instanceProjection.expression.referredElement results in undefined
                    this.myExpressionChecker.checkInstanceExpression(instanceProjection.expression, cls);
                    line.items[i] = instanceProjection;
                }
            });
        }
    }

    private checkPropertyProjection(projection: PiEditPropertyProjection, cls: PiClassifier, optional: boolean) {
        if (cls instanceof PiLimitedConcept && projection.expression.sourceName !== "self") {
            this.checkLimitedProjection(projection, cls);
        } else {
            this.myExpressionChecker.checkLangExp(projection.expression, cls);
            const myprop = projection.expression.findRefOfLastAppliedFeature();
            if (!!myprop) {
                if (!myprop.isList) {
                    this.simpleCheck(!(!!projection.listInfo),
                        `A terminator or separator may not be used in a non-list property '${myprop.name}' ${this.location(projection)}`);
                    if (!!projection.keyword) {
                        this.simpleCheck(myprop instanceof PiPrimitiveProperty && myprop.type.referred === PiPrimitiveType.boolean,
                            `Property '${myprop.name}' may not have a keyword projection, because it is not of boolean type ${this.location(projection)}`);
                        this.simpleCheck(!this.includesWhitespace(projection.keyword), `The text for a keyword projection should not include any whitespace ${this.location(projection)}`);
                    }
                    // if (optional) {
                    //     // TODO this error should be a warning only
                    //     // TODO think through this error message
                    //     this.simpleCheck(myprop.isOptional,
                    //         `Property '${myprop.name}' is not optional, therefore it should not have an optional projection ${this.location(projection)}`)
                    // }
                } else {
                    const listInfoPresent = !!projection.listInfo;
                    const tabelInfoPresent = !!projection.tableInfo;
                    this.simpleCheck( !(listInfoPresent && tabelInfoPresent),
                        `Property '${myprop.name}' can be projected either as list or table, not both ${this.location(projection)}`);

                    // create default listInfo if neither listInfo nor tableInfo are present
                    if (!listInfoPresent && !tabelInfoPresent) {
                        projection.listInfo = new ListInfo();
                    } else if (listInfoPresent && projection.listInfo.joinType !== ListInfoType.NONE) {
                        const text = projection.listInfo.joinType === ListInfoType.Separator ? `@separator` : `@terminator`;
                        this.simpleCheck(!!projection.listInfo.joinText, `${text} should be followed by a string between '[' and ']' ${this.location(projection)}`);
                    } else if (tabelInfoPresent) {
                        // remember this property - there should be a table projection for it - to be checked later
                        this.propsWithTableProjection.push(projection);
                    }
                }
            }
        }
    }

    private resolveReferences(editorDef: PiEditUnit) {
        for (const conceptEditor of editorDef.conceptEditors) {
            conceptEditor.languageEditor = editorDef;
            conceptEditor.concept.owner = this.language;
        }
    }

    private unique(array: PiEditConcept[]): PiEditConcept[] {
        const seen = new Set();
        return array.filter(function(item) {
            if (!seen.has(item.concept.referred)) {
                seen.add(item.concept.referred);
                return false;
            } else {
                return true;
            }
        });
    }

    private checkSubProjection(item: PiEditSubProjection, cls: PiClassifier) {
        // TODO check whether item.optional is being used correctly
        item.items.forEach(sub => {
            if (sub instanceof PiEditPropertyProjection) {
                this.checkPropertyProjection(sub, cls, item.optional);
            } else if (sub instanceof PiEditSubProjection) {
                this.checkSubProjection(sub, cls);
            }
        });
    }

    private checkLimitedProjection(projection: PiEditPropertyProjection, cls: PiLimitedConcept) {
        // a limited concept can have an alternative projection: "${INSTANCE @keyword [text]}"
        // this alternative is being checked in this method
        const myinstance = cls.findInstance(projection.expression.sourceName);
        this.nestedCheck({
            check: !!myinstance,
            error: `Cannot find instance ${projection.expression.sourceName} of limited concept ${cls.name} ${this.location(projection)}`,
            whenOk: () => {
                // should have a '@keyword'
                this.simpleCheck(!!projection.keyword, `Instance '${myinstance.name}' of a limited concept should be projected using a keyword ${this.location(projection)}`);
                this.simpleCheck(!this.includesWhitespace(projection.keyword), `The text for a keyword projection should not include any whitespace ${this.location(projection)}`);
            }
        });
    }

    private includesWhitespace(keyword: string) {
        return keyword.includes(" ") || keyword.includes("\n") || keyword.includes("\r");
    }

    private checkPropsWithTableProjection(editor: PiEditUnit) {
        for (const projection of this.propsWithTableProjection) {
            const myprop = projection.expression.findRefOfLastAppliedFeature();
            const propEditor = editor.findConceptEditor(myprop.type.referred);
            if (!(!!propEditor.tableProjections) || propEditor.tableProjections.length == 0) {
                // create default listInfo if not present
                if (!(!!projection.listInfo)) {
                    projection.listInfo = new ListInfo();
                }
                // TODO this should be a warning
                this.simpleCheck(false,
                    `No table projection defined for '${myprop.name}', it will be shown as a horizontal list ${this.location(projection)}`);
            }
        }
    }
}
