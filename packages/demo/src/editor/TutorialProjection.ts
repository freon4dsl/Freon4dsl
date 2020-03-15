import { observable } from "mobx";
import {
    AliasBox,
    Box,
    GridBox,
    GridCell,
    GridUtil,
    HorizontalListBox,
    SvgBox,
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
import { demoStyles } from "../styles/styles";

require("flatted");

import { DemoModel } from "../model/DemoModel";
import { DemoAttribute } from "../model/domain/DemoAttribute";
import { DemoEntity } from "../model/domain/DemoEntity";
import { DemoFunction } from "../model/domain/DemoFunction";
import {
    DemoAndExpression,
    DemoAttributeType,
    DemoComparisonExpression,
    DemoDivideExpression,
    DemoMultiplyExpression,
    DemoNumberLiteralExpression,
    DemoOrExpression,
    DemoPlaceholderExpression,
    DemoPlusExpression,
    DemoStringLiteralExpression, DemoVariable
} from "../model/index";
// tslint:disable-next-line:no-unused-import
import * as expressionExtensions from "./DemoExpression";

const LOGGER = new PiLogger("DemoProjection");//.mute();
const OPERATOR_COLUMN = 1;
const OPERAND_COLUM = 2;
export type MetaProjectionType1 = "text" | "orboxed" | "tree";

var TMP: Object = {};

export class TutorialProjection implements PiProjection {
    private editor: PiEditor;
    rootProjection: PiProjection;
    @observable projectionType: MetaProjectionType1 = "text";
    @observable showBrackets: boolean = false;

    constructor() {
    }

    setEditor(e: PiEditor) {
        this.editor = e;
    }

    getBox(exp: PiElement): Box {
        LOGGER.log("TutorialProjection.getBox [" + exp + "]");
        if (exp === null || exp === undefined) {
            console.log("BOX OF NULL/UNDEFINED element [" + exp + "]");
            return null;
        }
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
            // return this.createModelBox1(exp);
            // return this.createModelBox2(exp);
            // return this.createModelBox3(exp);
            LOGGER.log("Calling projection for DemoModel");
            return this.createModelBox4(exp);
        } else if (exp instanceof DemoAttribute) {
            return this.createAttributeBox(exp);
        } else if (exp instanceof DemoSumExpression) {
            return this.createSumBox(exp);
        } else if (isPiBinaryExpression(exp)) {
            return this.createBinaryBox(exp);
        }

        throw new Error("No box defined for this expression:" + exp.piId());
    }

    // Most simple model box
    // tag::ModelBox1[]
    private createModelBox(model: DemoModel): Box {
        return new HorizontalListBox(model, "model", [
            new LabelBox(model, "model-label", "DemoModel"),
            new TextBox(model, "model-name", () => model.name, (c: string) => (model.name = c))
        ]);
    }

    // end::ModelBox1[]

    // Modelbox with style and placeholder added
    // tag::ModelBox2[]
    private createModelBox2(model: DemoModel): Box {
        return new HorizontalListBox(model, "model", [
            new LabelBox(model, "model-label", "Model", {
                style: demoStyles.keyword
            }),
            new TextBox(model, "model-name", () => model.name, (c: string) => (model.name = c), {
                placeHolder: "<name>"
            })
        ]);
    }

    // end::ModelBox2[]

    // ModelBox with placeholder for the name and a list of entities
    // tag::ModelBox3[]
    private createModelBox3(model: DemoModel): Box {
        return new VerticalListBox(model, "model", [
            // end::ModelBox3[]
            new HorizontalListBox(model, "model-info", [
                new LabelBox(model, "model-keyword", "Model", {
                    style: demoStyles.keyword
                }),
                new TextBox(model, "model-name", () => model.name, (c: string) => (model.name = c), {
                    placeHolder: "<name>"
                })
            ]),
            // tag::ModelBox3[]
            new LabelBox(model, "entity-keyword", "Entities", {
                style: demoStyles.keyword
            }),
            new VerticalListBox(
                model,
                "entity-list",
                model.entities.map(ent => {
                    return this.createEntityBox(ent);
                })
            )
        ]);
    }

    // end::ModelBox3[]

    // ModelBox with placeholder for the name and a list of entities
    // tag::ModelBox4[]
    private createModelBox4(model: DemoModel): Box {
        LOGGER.log("createModelBox4 [" + model + "]");
        return new VerticalListBox(model, "model", [
            new HorizontalListBox(model, "model-info", [
                new LabelBox(model, "model-keyword", "DemoModel", {
                    style: demoStyles.keyword
                }),
                new TextBox(model, "model-name", () => model.name, (c: string) => (model.name = c), {
                    placeHolder: "<name>"
                })
            ]),
            new LabelBox(model, "entity-list", "Entities", {
                style: demoStyles.keyword
            }),
            new VerticalListBox(
                model,
                "entities",
                model.entities.map(ent => {
                    return this.createEntityBox3(ent);
                })

            ).addChild(new AliasBox(model, "end-of-entity-list",
                "add entity", { style: demoStyles.indent })),        // <1>
            new LabelBox(model, "functions-list", "Functions", {
                style: demoStyles.keyword
            }),
            // tag::CreateFunctionAction[]
            new VerticalListBox(
                model,
                "functions",
                model.functions.map(fun => {
                    return this.createFunctionBox(fun);
                })

            )
                // .addChild(new AliasBox(model, "end-of-function-list",
                // "add function", { style: demoStyles.indent }))
            // end::CreateFunctionAction[]
        ]);
    }

    // end::ModelBox4[]

    private createBinaryBox(exp: PiBinaryExpression): Box {
        if (this.projectionType === "tree") {
            return this.createBinaryBoxTree(exp);
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

    private createBinaryBoxTree(exp: PiBinaryExpression): Box {
        let result = new HorizontalListBox(
            exp,
            "binary1",
            [
                new LabelBox(exp, "symbol", exp.piSymbol()),
                new VerticalListBox(exp, "args", [this.getBox(exp.piLeft()), this.getBox(exp.piRight())])
            ],
            {
                style: demoStyles.tree
            }
        );
        return result;
    }

    // tag::AttributeBox[]
    private createAttributeBox(att: DemoAttribute): Box {
        return new HorizontalListBox(
            att,
            "attribute",
            [
                new TextBox(att, "attribute-name",
                    () => {
                        return att.name;
                    },
                    (v: string) => {
                        att.name = v;
                    }
                ),
                new LabelBox(att, "colon", ":"),
                new TextBox(att, "attribute-type",
                    () => {
                        return att.type.asString();
                    },
                    (v: string) => {
                        att.type = DemoAttributeType.fromString(v);
                    }
                )
            ],
            { style: demoStyles.indent }
        );
    }
    // end::AttributeBox[]

    private createParameterBox(parameter: DemoVariable): Box {
        return new HorizontalListBox(
            parameter,
            "parameter",
            [
                new TextBox(parameter, "parameter-name",
                    () => {
                        return parameter.name;
                    },
                    (v: string) => {
                        parameter.name = v;
                    }
                ),
                new LabelBox(parameter, "colon", ":"),
                new TextBox(parameter, "parameter-type",
                    () => {
                        return parameter.type.asString();
                    },
                    (v: string) => {
                        // parameter.type = DemoAttributeType.fromString(v);
                    }
                )
            ],
            { style: demoStyles.indent }
        );
    }

    private createEntityBox1(entity: DemoEntity): Box {
        // tag::EntityBox1[]
        return new VerticalListBox(entity, "entity", [
            new HorizontalListBox(entity, "entity-keyword", [
                new LabelBox(entity, "entity-label", "entity", {
                    style: demoStyles.keyword
                }),
                new TextBox(entity, "entity-name", () => entity.name, (c: string) => (entity.name = c))
            ]),
            new VerticalListBox(
                entity,
                "attributes",
                entity.attributes.map(att => {
                    return this.createAttributeBox(att);
                })
            )
        ]);
        // end::EntityBox1[]
    }

    // EntityBox with attributes, but no AliasBox
    // tag::EntityBox[]
    private createEntityBox(entity: DemoEntity): Box {
        return new VerticalListBox(entity, "entity",
            [
                new HorizontalListBox(entity, "entity-info", [
                    new LabelBox(entity, "entity-keyword", "Entity", {
                        style: demoStyles.keyword
                    }),
                    new TextBox(entity, "entity-name", () => entity.name, (c: string) => (entity.name = c), {
                        placeHolder: "<name>"
                    })
                ]),
                new VerticalListBox(entity, "attribute-list",
                    entity.attributes.map(att => {
                        return this.createAttributeBox(att);
                    })
                )
            ],
            { style: demoStyles.indent }
        );
    }

    // end::EntityBox[]

    // EntityBox with AliasBox added for adding new attributes
    private createEntityBox3(entity: DemoEntity): Box {
        return new VerticalListBox(
            entity,
            "entity",
            [
                new HorizontalListBox(entity, "entity-keyword", [
                    new LabelBox(entity, "entity-label", "entity", {
                        style: demoStyles.keyword
                    }),
                    new TextBox(entity, "entity-name", () => entity.name, (c: string) => (entity.name = c))
                ]),
                // tag::CreateAttributeAction[]
                new VerticalListBox(entity, "attributes",
                    entity.attributes.map(att => {
                        return this.createAttributeBox(att);
                    })
                ).addChild(new AliasBox(entity, "end-of-attribute-list",
                    "add attribute", { style: demoStyles.indent }))
                // end::CreateAttributeAction[]
            ],
            {
                style: demoStyles.indent
            }
        );
    }

    private createSumBox(sum: DemoSumExpression) {
        let cells: GridCell[] = [
            {
                row: 3,
                column: 1,
                columnSpan: 2,
                box: this.getBox(sum.from),
                style: demoStyles.mycell
            },
            {
                row: 2,
                column: 1,
                box: new SvgBox(sum, "sum-icon", sumIcon, {
                    width: 50,
                    height: 50,
                    selectable: false
                }),
                style: demoStyles.mycell
            },
            {
                row: 1,
                column: 1,
                columnSpan: 2,
                box: this.getBox(sum.to),
                style: demoStyles.mycell
            },
            {
                row: 2,
                column: 2,
                box: new HorizontalListBox(sum, "sum-body", [
                    new LabelBox(sum, "sum-body-open", "(", { style: STYLES.bracket }),
                    this.getBox(sum.body),
                    new LabelBox(sum, "sum-body-close", ")", { style: STYLES.bracket })
                ]),
                style: demoStyles.mycell
            }
        ];
        let result = new GridBox(sum, "sum-all", cells, {
            style: demoStyles.mygrid
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

    private createStringLiteralBox(literal: DemoStringLiteralExpression): Box {
        LOGGER.info(this, "createStringLiteralBox: " + literal.value);
        return createDefaultExpressionBox(literal, "string-literal-exp", [
            new HorizontalListBox(literal, "string-literal", [
                new LabelBox(literal, "start-quote", "\"", { selectable: false }),
                new TextBox(literal, "string-value", () => literal.value, (v: string) => (literal.value = v), {
                    style: demoStyles.stringLiteral,
                    deleteWhenEmptyAndErase: true
                }),
                new LabelBox(literal, "end-quote", "\"", { selectable: false })
            ])
        ]);
    }

    private createStringLiteralBox1(literal: DemoStringLiteralExpression): Box {
        return createDefaultExpressionBox(literal, "string-literal-exp", [
            new HorizontalListBox(literal, "string-literal", [
                new LabelBox(literal, "start-quote", "\""),
                new TextBox(literal, "string-value", () => literal.value, (v: string) => (literal.value = v)),
                new LabelBox(literal, "end-quote", "\"")
            ])
        ]);
    }

    // PiProjectionUtil.textbox(literal, "value")

    private createStringLiteralBoxSimple(literal: DemoStringLiteralExpression): Box {
        return createDefaultExpressionBox(literal, "string-literal-exp", [
            // tag::StringLiteral[]
            new HorizontalListBox(literal, "string-literal", [
                //<1>
                new LabelBox(literal, "start-quote", "\""), //<2>
                new TextBox(
                    literal,
                    "string-value", //<3>
                    () => literal.value,
                    (v: string) => (literal.value = v)
                ),
                new LabelBox(literal, "end-quote", "\"") //<4>
            ])
            // end::StringLiteral[]
        ]);
    }

    private createPlusBox(exp: DemoPlusExpression): Box {
        LOGGER.info(this, "createPlusBox: ");
        return this.createBinaryBox(exp);
    }

    private createComparisonBox(exp: DemoComparisonExpression): Box {
        LOGGER.info(this, "createComparisonBox: ");
        return this.createBinaryBox(exp);
    }

    private createMultiplyBox(exp: DemoMultiplyExpression): Box {
        LOGGER.info(this, "createMultiplyBox: ");
        return this.createBinaryBox(exp);
    }

    private createDivideBox(exp: DemoDivideExpression): Box {
        LOGGER.info(this, "createDivideBox: ");
        return this.createBinaryBox(exp);
    }

    private createAndBox(exp: DemoAndExpression): Box {
        LOGGER.info(this, "createAndBox: ");
        return this.createBinaryBox(exp);
    }

    private createOrBox(exp: DemoOrExpression): Box {
        LOGGER.info(this, "createOrBox: ");
        switch (this.projectionType) {
            case "text":
                return this.createBinaryBox(exp);
            case "orboxed":
                return this.createOrBoxGrid(exp);
            default:
                return this.createBinaryBox(exp);
        }
    }

    private createNumberLiteralBox(exp: DemoNumberLiteralExpression): Box {
        LOGGER.info(this, "createNumberLiteralBox: ");
        return createDefaultExpressionBox(exp, "number-literal", [
            new TextBox(exp, "num-literal-value", () => exp.value, (v: string) => (exp.value = v), {
                deleteWhenEmpty: true,
                style: demoStyles.stringLiteral,
                keyPressAction: (currentText: string, key: string, index: number) => {
                    return isNumber(currentText, key, index);
                }
            })
        ]);
    }

    private createFunctionBox(fun: DemoFunction): Box {
        return new VerticalListBox(
            fun,
            "function",
            [
                new HorizontalListBox(fun, "fun-keyword", [
                    new LabelBox(fun, "fun-label", "function", {
                        style: demoStyles.keyword
                    }),
                    new TextBox(fun, "fun-name", () => fun.name, (c: string) => (fun.name = c))
                ]),
                // tag::CreateAttributeAction[]
                new VerticalListBox(fun, "parameters",
                    fun.parameters.map(att => {
                        return this.createParameterBox(att);
                    })
                ).addChild(new AliasBox(fun, "end-of-parameter-list",
                    "add parameter", { style: demoStyles.indent }))
                // end::CreateAttributeAction[]
            ],
            {
                style: demoStyles.indent
            }
        );
    }
    private createFunctionBoxGrid(fun: DemoFunction): Box {
        // TODO Is stuk.
        LOGGER.info(this, "createFunctionBox: ");
        let cells: GridCell[] = [
            // {
            //     row: 1,
            //     column: 1,
            //     box: new LabelBox(fun, "fun-keyword", "function")
            // },
            // {
            //     row: 1,
            //     column: 2,
            //     box: new TextBox(fun, "fun-name", () => fun.name, (v: string) => (fun.name = v))
            // },
            // {
            //     row: 1,
            //     column: 3,
            //     box: new TextBox(
            //         fun,
            //         "fun-par1",
            //         () => ("NONE"),
            //         (v: string) => (v)
            //     )
            // },
            // {
            //     row: 2,
            //     column: 2,
            //     box: this.getBox(fun.expression)
            // }
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

export function createEntity(box: Box, editor: PiEditor) {
    return new DemoEntity();
}
