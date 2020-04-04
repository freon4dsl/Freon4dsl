import { Names, PathProvider, PROJECTITCORE, ENVIRONMENT_GEN_FOLDER, LANGUAGE_GEN_FOLDER, EDITORSTYLES } from "../../../utils";
import { PiLanguageUnit } from "../../../languagedef/metalanguage/PiLanguage";
import { DefEditorLanguage } from "../../metalanguage";

export class ProjectionTemplate {
    constructor() {
    }

    generateProjection(language: PiLanguageUnit, editorDef: DefEditorLanguage, relativePath: string): string {
        return `
            import { ${Names.PiProjection}, ${Names.PiElement}, ${Names.Box} } from "${PROJECTITCORE}";
        
            export class ${Names.projection(language)} implements ${Names.PiProjection} {
                rootProjection: ${Names.PiProjection};
                
                getBox(element: ${Names.PiElement}) : Box {
                    // Add any handmade projections of your own before next statement 
                    return null;
                }            
            }
        `;
    }

    generateProjectionDefault(language: PiLanguageUnit,  editorDef: DefEditorLanguage, relativePath: string): string {
        return `
            import { observable } from "mobx";

            import { ${Names.styles} } from "${relativePath}${EDITORSTYLES}";
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
                ${Names.PiEditor},
                ${Names.PiElement},
                ${Names.PiProjection},
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
                ${Names.PiBinaryExpression}
            } from "${PROJECTITCORE}";
            
            import { ${Names.PiElementReference} } from "${relativePath}${LANGUAGE_GEN_FOLDER }/${Names.PiElementReference}";
            import { ${language.classes.map(c => `${Names.concept(c)}`).join(", ") } } from "${relativePath}${LANGUAGE_GEN_FOLDER }";
            import { ${language.enumerations.map(c => `${Names.enumeration(c)}`).join(", ") } } 
                    from "${relativePath}${LANGUAGE_GEN_FOLDER }";
            import { ${Names.selectionHelpers(language)} } from "./${Names.selectionHelpers(language)}";
            import { ${Names.environment(language)} } from "${relativePath}${ENVIRONMENT_GEN_FOLDER}/${Names.environment(language)}";

            export class ${Names.projectionDefault(language)} implements ${Names.PiProjection} {
                private helpers: ${Names.selectionHelpers(language)} = new ${Names.selectionHelpers(language)};
                private editor: ${Names.PiEditor};
                rootProjection: ${Names.PiProjection};
                @observable showBrackets: boolean = false;
            
                constructor() {}
            
                setEditor(e: ${Names.PiEditor}) {
                    this.editor = e;
                }
            
                getBox(exp: ${Names.PiElement}): Box {
                    switch( exp.piLanguageConcept() ) { 
                        ${language.classes.map(c => `
                        case "${c.name}" : return this.get${c.name}Box(exp as ${Names.concept(c)});`
                        ).join("  ")}
                    }
                    // nothing fits
                    throw new Error("No box defined for this expression:" + exp.piId());
                }

                ${language.classes.filter(c => c.binaryExpression()).map(c => `
                private get${c.name}Box(element: ${Names.concept(c)}) {
                     return this.createBinaryBox(this, element, "${editorDef.findConceptEditor(c).symbol}");
                }                
                `).join("\n")}    
                
                ${ language.expressionPlaceholder() !== null ? `
                private get${language.expressionPlaceholder().name}Box(element: ${Names.concept(language.expressionPlaceholder())}) {
                    return new AliasBox(element, EXPRESSION_PLACEHOLDER, "[exp]");
                }`
                :"" }
      

                ${language.classes.filter(c => !c.binaryExpression() && !c.isExpressionPlaceholder()).map(c => `
                public get${c.name}Box(element: ${Names.concept(c)}): Box {
                    ${c.expression() ? `return createDefaultExpressionBox(element, "getDemoFunctionCallExpressionBox", [` : 
                    `return `} new VerticalListBox(element, "element", [
                        ${c.primProperties.map(p => `
                            new HorizontalListBox(element, "element-${p.name}-list", [
                                new LabelBox(element, "element-${p.name}-label", "${p.name}", {
                                    style: ${Names.styles}.propertykeyword
                                }),
                                new TextBox(element, "element-${p.name}-text", () => element.${p.name}, (c: string) => (element.${p.name} = c as ${p.type.name}),
                                {
                                    placeHolder: "text",
                                    style: ${Names.styles}.placeholdertext
                                })
                            ])`
                        ).concat(
                        c.enumProperties.map(p => `
                            new HorizontalListBox(element, "element-${p.name}-list", [
                            new LabelBox(element, "element-${p.name}-label", "${p.name}", {
                            style: ${Names.styles}.propertykeyword
                            }),
                            this.helpers.enumSelectFor${p.type.name}(element, "${p.name}-type",
                                () => { return { id: element.${p.name}.name, label: element.${p.name}.name} },
                                (o: SelectOption) => element.${p.name} = ${Names.enumeration(p.type.referedElement())}.fromString(o.id)),
                            ])`
                        )).concat(
//  Map all parts
                        c.allParts().map(part => `
                        ${ part.isList ? `
                            new LabelBox(element, "element-${part.name}-label", "${part.name}", { 
                                style: ${Names.styles}.keyword
                            }),
                            ( element.${part.name}.length === 0 ? null : 
                                new VerticalListBox(
                                    element,
                                    "${part.name}-list",
                                    element.${part.name}.map(ent => {
                                        return this.rootProjection.getBox(ent);
                                    }),
                                    {
                                        style: ${Names.styles}.indent
                                    }
                                )
                            ),
                            new AliasBox(element, "new-${part.name}", "add ${part.name}", {
                                style: ${Names.styles}.indentedplaceholdertext
                            })
                        ` :
                            `new LabelBox(element, "element-${part.name}-label", "${part.name}", {}),
                            this.rootProjection.getBox(element.${part.name})
                        ` }`  )).concat(
// Map all references
                        c.allPReferences().map(ref => `
                        ${ ref.isList ? `
                            new LabelBox(element, "element-${ref.name}-label", "${ref.name}", { 
                                style: ${Names.styles}.keyword
                            }),
                            ( element.${ref.name}.length === 0 ? null : 
                                new VerticalListBox(
                                    element,
                                    "${ref.name}-list",
                                    element.${ref.name}.map(ent => {
                                        return this.rootProjection.getBox(ent);
                                    }),
                                    {
                                        style: ${Names.styles}.indent
                                    }
                                )
                            ),
                            new AliasBox(element, "new-${ref.name}", "add ${ref.name}", {
                                style: ${Names.styles}.indentedplaceholdertext
                            })
                        ` :
                            `
                            this.helpers.getReferenceBox(element, "${ref.name}-exp", "< select ${ref.name}>", "${ref.type.name}",
                                () => {
                                    if (!!element.${ref.name}) {
                                        return { id: element.${ref.name}.name, label: element.${ref.name}.name };
                                    } else {
                                        return null;
                                    }
                                },
                                (option: SelectOption) => {
                                    element.${ref.name} = new PiElementReference<${ref.type.name}>(
                                        ${language.name}Environment.getInstance().scoper.getFromVisibleElements(
                                        element,
                                        option.label,
                                        "${ref.type.name}"
                                    ) as ${ref.type.name}, "${ref.type.name}");
                                }
                            )
                        ` }`  )
                ).join(",")}
                    ])
                ${c.expression() ? `])`: ""}
                }                
                `).join("\n")}          
                  
                private createBinaryBox(projection: ${Names.projectionDefault(language)}, exp: PiBinaryExpression, symbol: string): Box {
                    let binBox = createDefaultBinaryBox(this, exp, symbol);
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
