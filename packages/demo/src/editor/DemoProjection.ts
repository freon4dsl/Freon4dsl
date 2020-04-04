import { observable } from "mobx";
import {
    AliasBox,
    Box,
    GridBox,
    GridCell,
    GridUtil,
    HorizontalListBox,
    SelectOption,
    SvgBox,
    SelectBox,
    KeyPressAction,
    LabelBox,
    PiEditor,
    PiElement,
    PiProjection,
    TextBox,
    VerticalListBox,
    VerticalPiElementListBox,
    PiUtils,
    EXPRESSION_PLACEHOLDER,
    createDefaultBinaryBox,
    createDefaultExpressionBox,
    PiLogger,
    STYLES,
    isPiBinaryExpression,
    PiBinaryExpression
} from "@projectit/core";
import { sumIcon } from "../editor/Icons";
import { DemoSumExpression } from "../model/expressions/DemoSumExpression";
import { projectitStyles } from "../styles/styles";
require("flatted");

import { DemoModel } from "../model/DemoModel";
import { DemoAttribute } from "../model/domain/DemoAttribute";
import { DemoEntity } from "../model/domain/DemoEntity";
import { DemoFunction } from "../model/domain/DemoFunction";
import {
    DemoAndExpression,
    DemoComparisonExpression,
    DemoDivideExpression,
    DemoMultiplyExpression,
    DemoNumberLiteralExpression,
    DemoOrExpression,
    DemoPlaceholderExpression,
    DemoPlusExpression,
    DemoStringLiteralExpression
} from "../model/index";
// tslint:disable-next-line:no-unused-import
import * as expressionExtensions from "./DemoExpression";

const LOGGER = new PiLogger("DemoProjection").mute();
const OPERATOR_COLUMN = 1;
const OPERAND_COLUM = 2;
export type MetaProjectionType = "text" | "orboxed" | "tree";

var TMP: Object = {};

export class DemoProjection implements PiProjection {
    private editor: PiEditor;
    rootProjection: PiProjection;
    @observable projectionType: MetaProjectionType = "text";
    @observable showBrackets: boolean = false;

    constructor() {}

    setEditor(e: PiEditor) {
        this.editor = e;
    }

    getBox(exp: PiElement): Box {
        if (exp instanceof DemoStringLiteralExpression) {
            return this.createStringLiteralBox(exp);
        } else if (exp instanceof DemoNumberLiteralExpression) {
            return this.createNumberLiteralBox(exp);
        } else if (exp instanceof DemoPlusExpression) {
            return this.createPlusBox(exp);
        } else if (exp instanceof DemoMultiplyExpression) {
            return this.createMultiplyBox(exp);
        } else if (exp instanceof DemoAndExpression) {
            return this.createAndBox(exp);
        } else if (exp instanceof DemoOrExpression) {
            return this.createOrBox(exp);
        } else if (exp instanceof DemoDivideExpression) {
            return this.createDivideBox(exp);
        } else if (exp instanceof DemoComparisonExpression) {
            return this.createComparisonBox(exp);
        } else if (exp instanceof DemoPlaceholderExpression) {
            return this.createPlaceholderBox(exp);
        } else if (exp instanceof DemoFunction) {
            return this.createFunctionBox(exp);
        } else if (exp instanceof DemoEntity) {
            return this.createEntityBox(exp);
        } else if (exp instanceof DemoModel) {
            return this.createModelBox(exp);
        } else if (exp instanceof DemoEntity) {
            return this.createEntityBox(exp);
        } else if (exp instanceof DemoSumExpression) {
            return this.createSumBox(exp);
        } else if (isPiBinaryExpression(exp)) {
            return this.createBinaryBox(this, exp);
        }

        throw new Error("No box defined for this expression:" + exp.piId());
    }

    private createBinaryBox(projection: DemoProjection, exp: PiBinaryExpression): Box {
        if (this.projectionType === "tree") {
            return this.createBinaryBoxTree(projection, exp);
        } else {
            let binBox = createDefaultBinaryBox(this, exp);
            if (
                this.showBrackets &&
                !!exp.piContainer().container &&
                isPiBinaryExpression(exp.piContainer().container)
            ) {
                return new HorizontalListBox(exp, "brackets", [
                    new LabelBox(exp, "open-bracket", "("),
                    binBox,
                    new LabelBox(exp, "close-bracket", ")")
                ]);
            } else {
                return binBox;
            }
        }
    }

    private createBinaryBoxTree(projection: DemoProjection, exp: PiBinaryExpression): Box {
        let result = new HorizontalListBox(
            exp,
            "binary1",
            [
                new LabelBox(exp, "symbol", exp.piSymbol()),
                new VerticalListBox(exp, "args", [projection.getBox(exp.piLeft()), projection.getBox(exp.piRight())])
            ],
            {
                style: projectitStyles.tree
            }
        );
        return result;
    }

    private createEntityBox(entity: DemoEntity): Box {
        LOGGER.info(this, "createEntityBox: ");
        let cells: GridCell[] = [];
        cells.push({
            row: 1,
            column: 1,
            box: new TextBox(entity, "entity-name", () => entity.name, (s: string) => (entity.name = s), {
                deleteWhenEmpty: true,
                placeHolder: "<enter entity name>",
                keyPressAction: (currentText: string, key: string, index: number) => {
                    return isName(currentText, key, index);
                }
            })
        });
        cells.push({
            row: 2,
            column: 1,
            box: this.createAttributeGrid(entity)
        });
        return new GridBox(entity, "entity-all", cells);
    }

    private createEntityBoxGrid(entity: DemoEntity): Box {
        LOGGER.info(this, "createEntityBox: ");
        let cells: GridCell[] = [
            {
                row: 1,
                column: 1,
                columnSpan: 2,
                box: new TextBox(entity, "entity-name", () => entity.name, (v: string) => (entity.name = v))
            }
        ];
        let row = 2;
        entity.attributes.forEach(a => {
            cells.push({
                row: row,
                column: 1,
                box: new TextBox(a, "attr-name-" + row, () => a.name, (v: string) => (a.name = v))
            });
            cells.push({
                row: row,
                column: 2,
                box: new TextBox(a, "attr-type-" + row, () => a.type.asString(), (v: string) => {})
            });
            row++;
        });
        return new GridBox(entity, "entity", cells);
    }

    // TODO Refactor roww and column based collections into one generic function.
    private createAttributeGrid(entity: DemoEntity): Box {
        return GridUtil.createCollectionRowGrid<DemoAttribute>(
            entity,
            "attr-grid",
            "attributes",
            entity.attributes,
            ["name", "type"],
            [
                (att: DemoAttribute): Box => {
                    return new TextBox(att, "attr-name", () => att.name, (s: string) => (att.name = s), {
                        deleteWhenEmpty: true,
                        keyPressAction: (currentText: string, key: string, index: number) => {
                            return isName(currentText, key, index);
                        },
                        placeHolder: "<name>"
                    });
                },
                (attr: DemoAttribute): Box => {
                    return new TextBox(attr, "attr-type", () => attr.type.asString(), (v: string) => {});
                }
            ],
            (box: Box, editor: PiEditor) => {
                return new DemoAttribute();
            },
            this.editor
        );
    }

    private createSumBox(sum: DemoSumExpression) {
        let cells: GridCell[] = [
            {
                row: 3,
                column: 1,
                columnSpan: 2,
                box: this.getBox(sum.from),
                style: projectitStyles.mycell
            },
            {
                row: 2,
                column: 1,
                box: new SvgBox(sum, "sum-icon", sumIcon, {
                    width: 50,
                    height: 50,
                    selectable: false
                }),
                style: projectitStyles.mycell
            },
            {
                row: 1,
                column: 1,
                columnSpan: 2,
                box: this.getBox(sum.to),
                style: projectitStyles.mycell
            },
            {
                row: 2,
                column: 2,
                box: new HorizontalListBox(sum, "sum-body", [
                    new LabelBox(sum, "sum-body-open", "(", { style: STYLES.bracket }),
                    this.getBox(sum.body),
                    new LabelBox(sum, "sum-body-close", ")", { style: STYLES.bracket })
                ]),
                style: projectitStyles.mycell
            }
        ];
        let result = new GridBox(sum, "sum-all", cells, {
            style: projectitStyles.mygrid
        });
        return createDefaultExpressionBox(sum, "sum-exp", [result]);
    }

    private textbox(element: PiElement, property: string): TextBox {
        // TEst
        let result: TextBox = null;
        const value = element[property];
        if (value !== undefined && value != null && typeof value === "string") {
            result = new TextBox(element, "property", () => element[property], (v: string) => (element[property] = v));
        } else {
            PiUtils.CHECK(false, "Property " + property + " does not exist or is not a string");
        }
        return result;
    }

    private createModelBox(model: DemoModel): Box {
        LOGGER.info(this, "createModelBox");

        return new VerticalListBox(model, "model", [
            new HorizontalListBox(model, "model-keyword", [
                new LabelBox(model, "model-label", "model", {
                    style: projectitStyles.keyword
                }),
                new TextBox(model, "textC", () => model.name, (c: string) => (model.name = c))
                // SHORTHAND: this.textbox(model, "name"),
            ]),
            // this.textbox(model, "name"),
            // new SelectBox(model, "test-selest", "<select>",
            //     () => [
            //         {
            //             label: "option1-label1",
            //             description: "description",
            //             id: "1"
            //         },
            //         {
            //             label: "option2-label2",
            //             description: "description",
            //             id: "2"
            //         }
            //     ],
            //     () => null,
            //     (option: SelectOption) => {
            //         model.name = "new: " + option.label;
            //     },
            // ),

            // new LabelBox(model, "entity-list", "entities", {
            //     style: projectitStyles.keyword
            // }),
            // new VerticalPiElementListBox(model, "entities", model.entities,"entities", () => new DemoEntity(), this.editor,
            //     { roleToSelectAfterCreation: "entity-name" }),
            new LabelBox(model, "entityexpression", "expression", {
                style: projectitStyles.keyword
            }),
            this.getBox(model.functions[0].expression)
            //     ,
            // new LineBox(model, "line", {
            //     start: modelLabel,
            //     end: expressionLabel
            // } )
            //     ,
            // this.createFunctionBox(model.functions[0])
        ]);
    }

    private createStringLiteralBox(literal: DemoStringLiteralExpression): Box {
        LOGGER.info(this, "createStringLiteralBox: " + literal.value);
        return createDefaultExpressionBox(literal, "string-literal-exp", [
            new HorizontalListBox(literal, "string-literal", [
                new LabelBox(literal, "start-quote", '"', { selectable: false}),
                new TextBox(literal, "string-value", () => literal.value, (v: string) => (literal.value = v), {
                    style: projectitStyles.stringLiteral,
                    deleteWhenEmptyAndErase: true
                }),
                new LabelBox(literal, "end-quote", '"', { selectable: false })
            ])
        ]);
    }

    private createStringLiteralBox1(literal: DemoStringLiteralExpression): Box {
        return createDefaultExpressionBox(literal, "string-literal-exp", [
            new HorizontalListBox(literal, "string-literal", [
                new LabelBox(literal, "start-quote", '"'),
                new TextBox(literal, "string-value", () => literal.value, (v: string) => (literal.value = v)),
                new LabelBox(literal, "end-quote", '"')
            ])
        ]);
    }
    // PiProjectionUtil.textbox(literal, "value")

    private createStringLiteralBoxSimple(literal: DemoStringLiteralExpression): Box {
        return createDefaultExpressionBox(literal, "string-literal-exp", [
            // tag::StringLiteral[]
            new HorizontalListBox(literal, "string-literal", [
                //<1>
                new LabelBox(literal, "start-quote", '"'), //<2>
                new TextBox(
                    literal,
                    "string-value", //<3>
                    () => literal.value,
                    (v: string) => (literal.value = v)
                ),
                new LabelBox(literal, "end-quote", '"') //<4>
            ])
            // end::StringLiteral[]
        ]);
    }

    private createPlusBox(exp: DemoPlusExpression): Box {
        LOGGER.info(this, "createPlusBox: ");
        return this.createBinaryBox(this, exp);
    }

    private createComparisonBox(exp: DemoComparisonExpression): Box {
        LOGGER.info(this, "createComparisonBox: ");
        return this.createBinaryBox(this, exp);
    }

    private createMultiplyBox(exp: DemoMultiplyExpression): Box {
        LOGGER.info(this, "createMultiplyBox: ");
        return this.createBinaryBox(this, exp);
    }

    private createDivideBox(exp: DemoDivideExpression): Box {
        LOGGER.info(this, "createDivideBox: ");
        return this.createBinaryBox(this, exp);
    }

    private createAndBox(exp: DemoAndExpression): Box {
        LOGGER.info(this, "createAndBox: ");
        return this.createBinaryBox(this, exp);
    }

    private createOrBox(exp: DemoOrExpression): Box {
        LOGGER.info(this, "createOrBox: ");
        switch (this.projectionType) {
            case "text":
                return this.createBinaryBox(this, exp);
            case "orboxed":
                return this.createOrBoxGrid(exp);
            default:
                return this.createBinaryBox(this, exp);
        }
    }

    private createNumberLiteralBox(exp: DemoNumberLiteralExpression): Box {
        LOGGER.info(this, "createNumberLiteralBox: ");
        return createDefaultExpressionBox(exp, "number-literal", [
            new TextBox(exp, "num-literal-value", () => exp.value, (v: string) => (exp.value = v), {
                deleteWhenEmpty: true,
                style: projectitStyles.stringLiteral,
                keyPressAction: (currentText: string, key: string, index: number) => {
                    return isNumber(currentText, key, index);
                }
            })
        ]);
    }

    // private createNumberLiteralBox1(exp: DemoNumberLiteralExpression): Box {
    //     return createDefaultExpressionBox(exp, "number-literal", [
    //         new HorizontalListBox(exp, "sw", [
    //             new LabelBox(exp, "hdhd", "@"),
    //             new TextBox(exp, "num-literal-value", () => exp.value, (v: string) => exp.value = v,
    //                 {
    //                     style: projectitStyles.stringLiteral,
    //                     keyPressAction: (currentText: string, key: string, index: number) => {
    //                         return isNumber(currentText, key, index);
    //                     }
    //                 })
    //
    //         ])
    //     ]);
    // }

    private createFunctionBox(fun: DemoFunction): Box {
        LOGGER.info(this, "createFunctionBox: ");
        let cells: GridCell[] = [
            {
                row: 1,
                column: 1,
                box: new LabelBox(fun, "fun-keyword", "function")
            },
            {
                row: 1,
                column: 2,
                box: new TextBox(fun, "fun-name", () => fun.name, (v: string) => (fun.name = v))
            },
            {
                row: 1,
                column: 3,
                box: new TextBox(
                    fun,
                    "fun-par1",
                    () => fun.parameters[0].name,
                    (v: string) => (fun.parameters[0].name = v)
                )
            },
            {
                row: 2,
                column: 2,
                box: this.getBox(fun.expression)
            }
        ];
        let result = new GridBox(fun, "function", cells);
        return result;
    }

    private createOrBoxGrid(exp: DemoOrExpression): Box {
        const gridCells: GridCell[] = [];
        [
            {
                row: 1,
                column: 2,
                box: new LabelBox(exp, "or-Box", () => "OR"),
                style: STYLES.gridcellOr,
                rowSpan: 2
            }
        ];
        if (exp.left instanceof DemoOrExpression) {
            gridCells.push(
                {
                    row: 1,
                    column: OPERATOR_COLUMN,
                    box: new LabelBox(exp, "or-Box", () => "or"),
                    style: STYLES.gridcellOr,
                    rowSpan: 3
                },
                {
                    row: 1,
                    column: OPERAND_COLUM,
                    // box: createDefaultExpressionBox(exp.left.left, "left-left-or", [this.getBox(exp.left.left)]),
                    box: this.getBox(exp.left.left),
                    style: STYLES.gridcellFirst
                },
                {
                    row: 2,
                    column: OPERAND_COLUM,
                    // box: createDefaultExpressionBox(exp.left.right, "left-right-or", [this.getBox(exp.left.right)]),
                    box: this.getBox(exp.left.right),
                    style: STYLES.gridcell
                },
                {
                    row: 3,
                    column: OPERAND_COLUM,
                    // box: createDefaultExpressionBox(exp.right, "right-or", [this.getBox(exp.right)]),
                    box: this.getBox(exp.right),
                    style: STYLES.gridcellLast
                }
            );
        } else {
            gridCells.push(
                {
                    row: 1,
                    column: OPERATOR_COLUMN,
                    box: new LabelBox(exp, "or-Box", () => "or"),
                    style: STYLES.gridcellOr,
                    rowSpan: 2
                },
                {
                    row: 1,
                    column: OPERAND_COLUM,
                    // box: createDefaultExpressionBox(exp.left, "left-or", [this.getBox(exp.left)]),
                    box: this.getBox(exp.left),
                    style: STYLES.gridcellFirst
                },
                {
                    row: 2,
                    column: OPERAND_COLUM,
                    // box: createDefaultExpressionBox(exp.right, "right-or", [this.getBox(exp.right)]),
                    box: this.getBox(exp.right),
                    style: STYLES.gridcellLast
                }
            );
        }
        // return createExpressionBox(exp, "variable-ref-expression", [
        //     new GridBox(exp, "grid-varref", gridCells, { style: styles.grid })
        // ]);
        return new GridBox(exp, "grid-or", gridCells, { style: STYLES.grid });
    }

    private createPlaceholderBox(exp: DemoPlaceholderExpression): Box {
        LOGGER.info(this, "createPlaceholderBox: ");
        return new AliasBox(exp, EXPRESSION_PLACEHOLDER, "<exp>");
    }
}

function isNumber(currentText: string, key: string, index: number): KeyPressAction {
    if (isNaN(Number(key))) {
        if (index === currentText.length) {
            return KeyPressAction.GOTO_NEXT;
        } else {
            return KeyPressAction.NOT_OK;
        }
    } else {
        return KeyPressAction.OK;
    }
}

function isName(currentText: string, key: string, index: number): KeyPressAction {
    LOGGER.log("IsName key[" + key + "]");
    if (key === "Enter") {
        if (index === currentText.length) {
            return KeyPressAction.GOTO_NEXT;
        } else {
            return KeyPressAction.NOT_OK;
        }
    } else {
        return KeyPressAction.OK;
    }
}
