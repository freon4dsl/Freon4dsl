import {
    PiBinaryExpressionConcept, PiConcept,
    PiConceptProperty,
    PiExpressionConcept,
    PiPrimitiveProperty,
    PiProperty
} from "../../../languagedef/metalanguage";
import { Names, PROJECTITCORE, ENVIRONMENT_GEN_FOLDER, LANGUAGE_GEN_FOLDER, EDITORSTYLES } from "../../../utils";
import { PiLanguageUnit } from "../../../languagedef/metalanguage/PiLanguage";
import {
    DefEditorConcept,
    DefEditorLanguage,
    MetaEditorProjection,
    DefEditorProjectionExpression,
    DefEditorProjectionText,
    DefEditorSubProjection, Direction, DefEditorProjectionIndent
} from "../../metalanguage";

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
        const binaryConceptsWithDefaultProjection = language.concepts.filter(c => (c instanceof PiBinaryExpressionConcept))
            .filter(c => {
            const editor = editorDef.findConceptEditor(c);
            return editor === undefined || editor.projection === null;
        })
        ;
        const nonBinaryConceptsWithDefaultProjection = language.concepts.filter(c => !(c instanceof PiBinaryExpressionConcept) && !(c instanceof PiExpressionConcept && c.isExpressionPlaceholder())).filter(c => {
            const editor = editorDef.findConceptEditor(c);
            return editor === undefined || editor.projection === null;
        });
        const nonBinaryConceptsWithProjection = language.concepts.filter(c => !(c instanceof PiBinaryExpressionConcept) && !(c instanceof PiExpressionConcept && c.isExpressionPlaceholder())).filter(c => {
            const editor = editorDef.findConceptEditor(c);
            return !!editor && !!editor.projection;
        });

        return `
            import { observable } from "mobx";

            import { ${Names.styles} } from "${relativePath}${EDITORSTYLES}";
            import {
                AliasBox,
                Box,
                GridBox,
                IndentBox,
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
            import { ${language.concepts.map(c => `${Names.concept(c)}`).join(", ") } } from "${relativePath}${LANGUAGE_GEN_FOLDER }";
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
                    if( exp === null ) {
                        return null;
                    }

                    switch( exp.piLanguageConcept() ) { 
                        ${language.concepts.map(c => `
                        case "${c.name}" : return this.get${c.name}Box(exp as ${Names.concept(c)});`
                        ).join("  ")}
                    }
                    // nothing fits
                    throw new Error("No box defined for this expression:" + exp.piId());
                }

                ${binaryConceptsWithDefaultProjection.map(c => `
                private get${c.name}Box(element: ${Names.concept(c)}) {
                     return this.createBinaryBox(this, element, "${editorDef.findConceptEditor(c).symbol}");
                }                
                `).join("\n")}    
                
                ${ !!language.expressionPlaceHolder ? `
                private get${language.expressionPlaceHolder.name}Box(element: ${Names.concept(language.expressionPlaceHolder)}) {
                    return new AliasBox(element, EXPRESSION_PLACEHOLDER, "[exp]");
                }`
                :"" }
      
                ${nonBinaryConceptsWithProjection.map(c => this.generateUserProjection(language, c, editorDef.findConceptEditor(c))).join("\n")}
                
                ${nonBinaryConceptsWithDefaultProjection.map(c => `
                public get${c.name}Box(element: ${Names.concept(c)}): Box {
                    ${c instanceof PiExpressionConcept ? `return createDefaultExpressionBox(element, "getDemoFunctionCallExpressionBox", [` : 
                    `return `} new VerticalListBox(element, "element", [
                        ${c.primProperties.map(p => `
                            new HorizontalListBox(element, "element-${p.name}-list", [
                                new LabelBox(element, "element-${p.name}-label", "${p.name}", {
                                    style: ${Names.styles}.propertykeyword,
                                    selectable: false
                                }),
                                ${this.primitivePropertyProjection(p)},
                            ], { selectable: false })`
                        ).concat(
//  Map all parts
                        c.allParts().map(part => `
                        ${ part.isList ? `
                            new LabelBox(element, "element-${part.name}-label", "${part.name}", { 
                                style: ${Names.styles}.keyword,
                                selectable: false
                            }),
                            new IndentBox(element, "indent-part-${part.name}", 4, 
                                ${this.conceptPartListProjection("Vertical", part)}
                            ),
                        ` :
                            `new HorizontalListBox(element, "element-${part.name}", [
                            new LabelBox(element, "element-${part.name}-label", "${part.name}", {
                                style: ${Names.styles}.propertykeyword,
                                selectable: false
                             }),
                            ((!!element.${part.name}) ? this.rootProjection.getBox(element.${part.name}) : new AliasBox(element, "${part.name}", "${part.name}" ))
                            ], { selectable: false })                            
                        ` }`  )).concat(
// Map all references
                        c.allReferences().map(ref => `
                        ${ ref.isList ? `
                            new LabelBox(element, "element-${ref.name}-label", "${ref.name}", { 
                                style: ${Names.styles}.keyword,
                                selectable: false
                            }),
                            ${this.conceptReferenceListProjection("Vertical", ref)},
                            new AliasBox(element, "new-${ref.name}", "add ${ref.name}", {
                                style: ${Names.styles}.indentedplaceholdertext
                            })
                        ` :
                            `new HorizontalListBox(element, "element-${ref.name}-list", [
                                new LabelBox(element, "element-${ref.name}-label", "${ref.name}", {
                                    style: ${Names.styles}.propertykeyword,
                                    selectable: false
                                }),
                                ${this.conceptReferenceProjection(language, ref)},
                            ], { selectable: false })`
                        }`  )
                ).join(",")}
                    ])
                ${(c instanceof PiExpressionConcept) ? `])`: ""}
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

    private generateUserProjection(language: PiLanguageUnit, c: PiConcept, editor: DefEditorConcept) {
        let result: string = "";
        const projection: MetaEditorProjection = editor.projection;
        const multiLine = projection.lines.length > 1;
        if(multiLine){
            result += `new VerticalListBox(element, "${c.name}-overall", [
            `;
        }

        let indentNr = 0;
        projection.lines.forEach( (line, index) => {
            if( line.indent > 0) {
                result += `new IndentBox(element, "${"indent-" + indentNr++}", ${line.indent}, `
            }
            if( line.items.length > 1) {
                result += `new HorizontalListBox(element, "${c.name}-line-${index}", [ `;
            }
            line.items.forEach((item, itemIndex) => {
                if ( item instanceof DefEditorProjectionText ){
                    result += `
                        new LabelBox(element, "${c.name}-name-${index}-${itemIndex}", "${item.text}", {
                            style: projectitStyles.propertykeyword,
                            selectable: false
                        }),`
                } else if( item instanceof DefEditorSubProjection){
                    const appliedFeature: PiProperty = item.expression.appliedfeature.referedElement.referred;
                    if (appliedFeature instanceof PiPrimitiveProperty){
                        result += this.primitivePropertyProjection(appliedFeature) + ", ";
                    // } else if( appliedFeature instanceof PiLangEnumProperty) {
                    //     result += this.enumPropertyProjection(appliedFeature) + ", ";
                    } else if( appliedFeature instanceof PiConceptProperty) {
                        if (appliedFeature.isPart) {
                            if (appliedFeature.isList) {
                                const direction = (!!item.listJoin ? item.listJoin.direction.toString() : Direction.Horizontal.toString());
                                result += this.conceptPartListProjection(direction, appliedFeature)+ ",";

                            } else {
                                result += `this.rootProjection.getBox(element.${appliedFeature.name}),`
                            }
                        } else { // reference
                            if( appliedFeature.isList){
                                const direction = (!!item.listJoin ? item.listJoin.direction.toString() : Direction.Horizontal.toString());
                                result += this.conceptReferenceListProjection(direction, appliedFeature) + ",";
                            }else {
                                result += this.conceptReferenceProjection(language, appliedFeature) + ", ";
                            }
                        }
                    } else {
                        result += `// ERROR unknown property box here for ${appliedFeature.name}
                        `;
                    }
                }
            });
            if( line.items.length > 1) {
                // TODO Too many thigs are now selectable, but if fasle, you cannot select e.g. an attribute
                result += ` ], { selectable: true } ) `
            }
            if( line.indent > 0 ){
                // end of line, finish indent when applicable
                result += ` )`;
            }
            if( index !== projection.lines.length -1) {
              result += ",";
            }
        });
        if( multiLine){
            result += ` 
                ]);
            `;
        }
        if( result === "" ){ result = "null"}
        return `public get${c.name}Box(element: ${Names.concept(c)}): Box {
                    return ${result};
                }`;
    }

    // TODO change this to be used with PiLimitedConcept
    // enumPropertyProjection(p: PiLangEnumProperty) {
    //     return `
    //         this.helpers.enumSelectFor${p.type.name}(element,
    //             "${p.name}-type",
    //             () => { return { id: element.${p.name}.name, label: element.${p.name}.name} },
    //             (o: SelectOption) => element.${p.name} = ${Names.enumeration(p.type.referedElement())}.fromString(o.id)
    //         )
    //     `;
    // }
    conceptPartListProjection(direction: string, propertyConcept: PiConceptProperty) {
        return `
            new ${direction}ListBox(element, "element-${propertyConcept.name}-list", 
                element.${propertyConcept.name}.map(feature => {
                    return this.rootProjection.getBox(feature);
                }).concat(
                    new AliasBox(element, "new-${propertyConcept.name}", "ADD ${propertyConcept.name}", {
                        style: ${Names.styles}.placeholdertext
                    })
                )
            )`;
    }

    conceptReferenceProjection(language: PiLanguageUnit, appliedFeature: PiConceptProperty) {
        const featureType = appliedFeature.type.name;
        return ` this.helpers.getReferenceBox(element, "${appliedFeature.name}", "< select ${appliedFeature.name}>", "${featureType}",
                    () => {
                        if (!!element.${appliedFeature.name}) {
                            return { id: element.${appliedFeature.name}.name, label: element.${appliedFeature.name}.name };
                        } else {
                            return null;
                        }
                    },
                    (option: SelectOption) => {
                        element.${appliedFeature.name} = new PiElementReference<${featureType}>(${Names.environment(language)}.getInstance().scoper.getFromVisibleElements(
                            element,
                            option.label,
                            "${featureType}"
                        ) as ${featureType}, "${featureType}");
                    }
                )
            `
    }

    conceptReferenceProjectionInList(appliedFeature: PiConceptProperty) {
        const featureType = appliedFeature.type.name;
        return ` this.helpers.getReferenceBox(element, "${appliedFeature.name}-" + index, "< select ${appliedFeature.name}>", "${featureType}",
                    () => {
                        if (!!element.${appliedFeature.name}) {
                            return { id: ent.name, label: ent.name };
                        } else {
                            return null;
                        }
                    },
                    (option: SelectOption) => {
                        ent.name = option.label;
                    }
                )
            `
    }


    conceptReferenceListProjection(direction: string, reference: PiConceptProperty) {
        return `new ${direction}ListBox(
                    element,
                    "${reference.name}-list",
                    element.${reference.name}.map((ent, index) => {
                        return ${this.conceptReferenceProjectionInList(reference) }
                    }), //  this one?
                    {
                        style: ${Names.styles}.indent
                    }
                )
            `
    }

    primitivePropertyProjection(appliedFeature: PiPrimitiveProperty) {
        // TODO This now only works for strings
        return `new TextBox(element, "element-${appliedFeature.name}-text", () => element.${appliedFeature.name}, (c: string) => (element.${appliedFeature.name} = c as ${"string"}),
                {
                    placeHolder: "text",
                    style: ${Names.styles}.placeholdertext
                })`
    }

}
