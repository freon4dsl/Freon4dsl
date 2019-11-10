import { Names } from "./Names";
import { PiLanguage } from "../PiLanguage";

export class ProjectionTemplate {
    constructor() {
    }

    generateProjection(language: PiLanguage): string {
        return `
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
            import { WithType } from "../language/WithType";
            ${language.concepts.map(c => `import { ${Names.concept(c)} } from "../language/${Names.concept(c)}";`).join("")}
            ${language.enumerations.map(e => `import { ${Names.enumeration(e)} } from "../language/${Names.enumeration(e)}";`).join("")}

            export class ${Names.projection(language)} implements PiProjection {
                private editor: PiEditor;
                @observable showBrackets: boolean = false;
            
                constructor() {}
            
                setEditor(e: PiEditor) {
                    this.editor = e;
                }
            
                getBox(exp: WithType): Box {
                    switch( exp.get$Type() ) {
                        ${language.concepts.map(c => `
                        case "${c.name}" : return this.get${c.name}Box(exp as ${Names.concept(c)});`
                        ).join("  ")}
                    }
                    // nothing fits
                    throw new Error("No box defined for this expression:" + exp.piId());
                }

                ${language.concepts.filter(c => c.binaryExpression()).map(c => `
                private get${c.name}Box(element: ${Names.concept(c)}) {
                     return this.createBinaryBox(this, element);
                }                
                `).join("\n")}          

                ${language.concepts.filter(c => !c.binaryExpression()).map(c => `
                private get${c.name}Box(element: ${Names.concept(c)}) {
                    return new VerticalListBox(element, "element", [
                        ${c.properties.map(p => `
                        new HorizontalListBox(element, "element-${p.name}-list", [
                            new LabelBox(element, "element-${p.name}-label", "${p.name}", {
                            }),
                            new TextBox(element, "element-${p.name}-text", () => element.${p.name}, (c: string) => (element.${p.name} = c as ${p.type}))
                        ])`
                        ).concat(c.allParts().map(part => `
                        ${ part.isList ? `
                            new LabelBox(element, "element-${part.name}-label", "${part.name}", {}),
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
                  
                private createBinaryBox(projection: ${Names.projection(language)}, exp: PiBinaryExpression): Box {
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
    }
}
