import { PiLanguage } from "packages/meta/src/language2/PiLanguage";

export class ProjectionTemplate {
    constructor() {
    }

    generateProjection(language: PiLanguage): string {
        const result = `
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
            require("flatted");
            import { WithType } from "./WithType";
            ${language.concepts.map(c => `import { ${c.name} } from "./${c.name}";`).join("")}

            export class ${language.name}Projection implements PiProjection {
                private editor: PiEditor;
                @observable showBrackets: boolean = false;
            
                constructor() {}
            
                setEditor(e: PiEditor) {
                    this.editor = e;
                }
            
                getBox(exp: WithType): Box {
                    switch( exp.get$Type() ) {
                        ${language.concepts.map(c => `
                        case "${c.name}" : return this.get${c.name}Box(exp as ${c.name});`
                        ).join("  ")}
                    }
                    // nothing fits
                    throw new Error("No box defined for this expression:" + exp.piId());
                }

                ${language.concepts.filter(c => c.binaryExpression()).map(c => `
                private get${c.name}Box(element: ${c.name}) {
                     return this.createBinaryBox(this, element);
                }                
                `).join("\n")}          

                ${language.concepts.filter(c => !c.binaryExpression()).map(c => `
                private get${c.name}Box(element: ${c.name}) {
                    return new VerticalListBox(element, "element", [
                        ${c.properties.map(p => `
                        new HorizontalListBox(element, "element-${p.name}-list", [
                            new LabelBox(element, "element-${p.name}-label", "${p.name}", {
                            }),
                            new TextBox(element, "element-${p.name}-text", () => element.${p.name}, (c: string) => (element.${p.name} = c))
                        ])`
                        ).concat(c.allParts().map(part => `
                        ${ part.isList ? `
                            new VerticalListBox(
                                element,
                                "${part.name}-list",
                                element.${part.name}.map(ent => {
                                    return this.get${part.type.concept().name}Box(ent);
                                })
                            )
                        ` :
                            `new LabelBox(element, "element-${part.name}-label", "${part.name}", {}),
                            this.getBox(element.${part.name})
                        ` }`  )).join(",")}
                    ]);
                }                
                `).join("\n")}          
                  
                private createBinaryBox(projection: ${language.name}Projection, exp: PiBinaryExpression): Box {
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
        `;
        return result;
    }

}
