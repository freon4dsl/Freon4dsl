import {
    AliasBox, BehaviorExecutionResult,
    GridBox,
    GridCell,
    HorizontalListBox,
    IndentBox,
    LabelBox, PiEditor, SelectBox, SelectOption,
    SvgBox,
    TextBox,
    VerticalListBox
} from "@projectit/core";
import type { Box, PiElement, PiProjection } from "@projectit/core";
import { SvelteAttribute } from "./SvelteAttribute";
import { SvelteEntity } from "./SvelteEntity";
import { SvelteModel } from "./SvelteModel";
import { SvelteModelUnit } from "./SvelteModelUnit";

export const sumIcon = "M 6 5 L 6.406531 20.35309 L 194.7323 255.1056 L 4.31761 481.6469 L 3.767654 495.9135 L 373 494 C 376.606 448.306 386.512 401.054 395 356 L 383 353 C 371.817 378.228 363.867 405.207 340 421.958 C 313.834 440.322 279.304 438 249 438 L 79 438 L 252.2885 228.6811 L 96.04328 33.3622 L 187 32.99999 C 245.309 32.99999 328.257 18.91731 351.329 89.00002 C 355.273 100.98 358.007 113.421 359 126 L 372 126 L 362 5 L 6 5 L 6 5 L 6 5 L 6 5 L 6 5 z ";

export class SvelteProjection implements PiProjection {
    name: string;
    rootProjection: PiProjection;

    getBox(element: PiElement): Box {
        console.log("SvelteProjection Projection for " + (!!element ? element.piLanguageConcept() : null ));
        if (element instanceof SvelteModelUnit) {
            return this.svelteModelUnit(element);
        } else if (element instanceof SvelteModel) {
            return this.svelteModelUnit(element.modelUnits[0]);
        } else if (element instanceof SvelteEntity) {
            return this.svelteEntity(element);
        } else if (element instanceof SvelteAttribute) {
            return this.svelteAttribute(element);
        }
    }

    private svelteModelUnit(element: SvelteModelUnit): Box {
        // console.log("projection for model unit " + element.name + "  entities " + element.entities);

        const result: Box =  new VerticalListBox(element, "modelunit", [
            new HorizontalListBox(element, "keyword", [
                this.createSumBox(element),
                new LabelBox(element, "model-unit-label", "model unit"),
                new TextBox(element, "model-unit-name",
                    () => {
                    console.log("Getting text from mode ["+ element.name + "]")
                        return element.name
                    },
                    (value: string) => {
                        console.log("Setting text from model to ["+ value + "]")
                        element.name = value
                    }),
                new LabelBox(element, "postlabel","eionde unit")
            ]),
            // new IndentBox(element, "indent-entities", 3,
            new VerticalListBox(element, "ent-list",
                element.entities.map(ent => this.getBox(ent))
            )
            // )

        ]);
        return result;
    }

    private svelteEntity(entity: SvelteEntity): Box {
        // console.log("Projection for Entity " + entity.name)
        return new VerticalListBox(entity, "entity", [
            new HorizontalListBox(entity, "entity-name-list", [
                new LabelBox(entity, "entity-label", "entity"),
                new AliasBox(entity, "alias-1","<alias>"),
                new TextBox(entity, "entity-name",
                    () => {
                        return entity.name
                    },
                    (value: string) => {
                        entity.name = value
                    },
                    { style: "color: red; border: yellow; border-width: 3; border-style: dotted;"})
                ]),
                new IndentBox(entity, "indent-enttities", 25,
                    new VerticalListBox(entity, "attribute-list",
                        entity.attributes.map(att => this.getBox(att))
                    )
            )
        ]);
    }

    private svelteAttribute(attribute: SvelteAttribute): Box {
        // console.log("Projection for Attriubute " + entity.name)
        // return
        // new VerticalListBox(entity, "entity", [
        return    new HorizontalListBox(attribute, "attribute-name-list", [
            new LabelBox(attribute, "attribute-label", "attribute"),
            new TextBox(attribute, "attribute-name",
                () => {
                    return attribute.name
                },
                (value: string) => {
                console.log("Setting text to ["+ value + "]");
                    attribute.name = value
                },
                { deleteWhenEmptyAndErase: true,
                placeHolder: "<name>"}),
            new LabelBox(attribute, "attribute-seperator", ":"),
            new SelectBox(attribute, "attribute-type", "<select type>", (editor: PiEditor) => {
                return [ {id: "one", label: "one"}, {id: "two", label: "two"}, {id: "three", label: "three"}];
            },
                () => {
                    console.log("Projection.getsSSenecteOption called")
                    return { id: attribute.type, label: attribute.type };},
                async (editor: PiEditor, option: SelectOption): Promise<BehaviorExecutionResult> => {
                console.log("!!Selected option "+ option.id);
                attribute.type = option.id;
                return BehaviorExecutionResult.EXECUTED;
                })
        ]);
        // ])
    }

    public createSumBox(sum: SvelteModelUnit): Box {
        const cells: GridCell[] = [
            {
                row: 3,
                column: 1,
                columnSpan: 2,
                box: new HorizontalListBox(sum, "Sum-from-part", [
                    new LabelBox(sum, "sum-from-equals", "from"),
                ]),
            },
            {
                row: 2,
                column: 1,
                box: new SvgBox(sum, "sum-icon", sumIcon, {
                    width: 50,
                    height: 50,
                    selectable: false
                })
            },
            {
                row: 1,
                column: 1,
                columnSpan: 2,
                box: new TextBox(sum, "SumExpression-to", () => "to", (v: string) => {}),
            },
            {
                row: 2,
                column: 2,
                box:
                    new TextBox(sum, "SumExpression-body", () => "<BODY>", (v: string) => {}),
                //     new HorizontalListBox(sum, "sum-body", [
                //     new LabelBox(sum, "sum-body-open", "("),
                //     new LabelBox(sum, "sum-body-close", ")")
                // ]),
            }
        ];
        const result = new GridBox(sum, "sum-all", cells, {
        });
        return result;
    }

}
