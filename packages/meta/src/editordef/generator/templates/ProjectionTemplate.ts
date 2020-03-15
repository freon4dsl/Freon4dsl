import { Names } from "../../../utils/Names";
import { PiLangEnumerationProperty, PiLanguage } from "../../../languagedef/metalanguage/PiLanguage";

export class ProjectionTemplate {
    constructor() {
    }

    generateProjection(language: PiLanguage): string {
        return `
            import { PiProjection, PiElement, Box } from "@projectit/core";
        
            export class ${Names.projection(language)} implements PiProjection {
                rootProjection: PiProjection;
                
                getBox(element: PiElement) : Box {
                    // Add any handmade projections of your own before next statement 
                    return null;
                }            
            }
        `
    }

    generateProjectionDefault(language: PiLanguage): string {
        return `
            import { observable } from "mobx";

            import { demoStyles } from "../../styles/styles"
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
            
            ${language.concepts.map(c => `import { ${Names.concept(c)} } from "../../language/${Names.concept(c)}";`).join("")}
            ${language.enumerations.map(e => `import { ${Names.enumeration(e)} } from "../../language/${Names.enumeration(e)}";`).join("")}
            import { ${language.name}EnumerationProjections } from "./${language.name}EnumerationProjections";

            export class ${Names.projectionDefault(language)} implements PiProjection {
                private enumSelectBox: ${language.name}EnumerationProjections = new ${language.name}EnumerationProjections();
                private editor: PiEditor;
                rootProjection: PiProjection;
                @observable showBrackets: boolean = false;
            
                constructor() {}
            
                setEditor(e: PiEditor) {
                    this.editor = e;
                }
            
                getBox(exp: PiElement): Box {
                    switch( exp.piLanguageConcept() ) {
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
                
                ${ language.expressionPlaceholder() !== null ? `
                private get${language.expressionPlaceholder().name}Box(element: ${Names.concept(language.expressionPlaceholder())}) {
                    return new AliasBox(element, EXPRESSION_PLACEHOLDER, "[exp]");
                }`
                :"" }
      

                ${language.concepts.filter(c => !c.binaryExpression() && !c.isExpressionPlaceHolder).map(c => `
                public get${c.name}Box(element: ${Names.concept(c)}): Box {
                    return new VerticalListBox(element, "element", [
                        ${c.properties.map(p => `
                            new HorizontalListBox(element, "element-${p.name}-list", [
                                new LabelBox(element, "element-${p.name}-label", "${p.name}", {
                                    style: demoStyles.propertykeyword
                                }),
                                new TextBox(element, "element-${p.name}-text", () => element.${p.name}, (c: string) => (element.${p.name} = c as ${p.type}),
                                {
                                    placeHolder: "text",
                                    style: demoStyles.placeholdertext
                                })
                            ])`
                        ).concat(
                        c.enumProperties.map(p => `
                            new HorizontalListBox(element, "element-${p.name}-list", [
                            new LabelBox(element, "element-${p.name}-label", "${p.name}", {
                            style: demoStyles.propertykeyword
                            }),
                            this.enumSelectBox.enumSelectFor${p.type.name}(element, "${p.name}-type",
                                () => { return { id: element.${p.name}.name, label: element.${p.name}.name} },
                                (o: SelectOption) => element.${p.name} = ${Names.enumeration(p.type.enumeration())}.fromString(o.id)),
                            ])`
                        )).concat(
                        c.allParts().map(part => `
                        ${ part.isList ? `
                            new LabelBox(element, "element-${part.name}-label", "${part.name}", { 
                                style: demoStyles.keyword
                            }),
                            ( element.${part.name}.length === 0 ? null : 
                                new VerticalListBox(
                                    element,
                                    "${part.name}-list",
                                    element.${part.name}.map(ent => {
                                        return this.rootProjection.getBox(ent);
                                    }),
                                    {
                                        style: demoStyles.indent
                                    }
                                )
                            ),
                            new AliasBox(element, "new-${part.name}", "add ${part.name}", {
                                style: demoStyles.indentedplaceholdertext
                            })
                        ` :
                            `new LabelBox(element, "element-${part.name}-label", "${part.name}", {}),
                            this.rootProjection.getBox(element.${part.name})
                        ` }`  )).join(",")}
                    ]);
                }                
                `).join("\n")}          
                  
                private createBinaryBox(projection: ${Names.projectionDefault(language)}, exp: PiBinaryExpression): Box {
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
