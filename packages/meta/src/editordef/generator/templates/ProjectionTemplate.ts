import { PiLangConceptProperty, PiLangEnumProperty, PiLangPrimitiveProperty, PiLangProperty, PiLangSelfExp } from "../../../languagedef/metalanguage";
import { Names, PathProvider, PROJECTITCORE, ENVIRONMENT_GEN_FOLDER, LANGUAGE_GEN_FOLDER, EDITORSTYLES } from "../../../utils";
import { PiLangClass, PiLanguageUnit } from "../../../languagedef/metalanguage/PiLanguage";
import {
    DefEditorConcept,
    DefEditorLanguage,
    MetaEditorProjection,
    DefEditorProjectionExpression,
    DefEditorProjectionText,
    DefEditorSubProjection, Direction, DefEditorProjectionIndent
} from "../../metalanguage";
import has = Reflect.has;
import * as os from 'os';

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
        const binaryConceptsWithDefaultProjection = language.classes.filter(c => c.binaryExpression()).filter(c => {
            const editor = editorDef.findConceptEditor(c);
            return editor === undefined || editor.projection === null;
        });
        const nonBinaryConceptsWithDefaultProjection = language.classes.filter(c => !c.binaryExpression() && !c.isExpressionPlaceholder()).filter(c => {
            const editor = editorDef.findConceptEditor(c);
            return editor === undefined || editor.projection === null;
        });
        const nonBinaryConceptsWithProjection = language.classes.filter(c => !c.binaryExpression() && !c.isExpressionPlaceholder()).filter(c => {
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
                    if( exp === null ) {
                        return null;
                    }

                    switch( exp.piLanguageConcept() ) { 
                        ${language.classes.map(c => `
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
                `).join(os.EOL)}    
                
                ${ language.expressionPlaceholder() !== null ? `
                private get${language.expressionPlaceholder().name}Box(element: ${Names.concept(language.expressionPlaceholder())}) {
                    return new AliasBox(element, EXPRESSION_PLACEHOLDER, "[exp]");
                }`
                :"" }
      

                ${nonBinaryConceptsWithProjection.map(c => this.generateUserProjection(language, c, editorDef.findConceptEditor(c))).join(os.EOL)}
                
                ${nonBinaryConceptsWithDefaultProjection.map(c => `
                public get${c.name}Box(element: ${Names.concept(c)}): Box {
                    ${c.expression() ? `return createDefaultExpressionBox(element, "getDemoFunctionCallExpressionBox", [` : 
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
                        c.enumProperties.map(p => `
                            new HorizontalListBox(element, "element-${p.name}-list", [
                                new LabelBox(element, "element-${p.name}-label", "${p.name}", {
                                    style: ${Names.styles}.propertykeyword,
                                    selectable: false
                                }),
                                ${this.enumPropertyProjection(p)},
                            ], { selectable: false })`
                        )).concat(
//  Map all parts
                        c.allParts().map(part => `
                        ${ part.isList ? `
                            new LabelBox(element, "element-${part.name}-label", "${part.name}", { 
                                style: ${Names.styles}.keyword,
                                selectable: false
                            }),
                            ( element.${part.name}.length === 0 ? null : 
                                new IndentBox(element, "indent-part-${part.name}", 4, 
                                    ${this.conceptPartListProjection("Vertical", part)}
                                )
                            ),
                            new AliasBox(element, "new-${part.name}", "add ${part.name}", {
                                style: ${Names.styles}.indentedplaceholdertext
                            })
                        ` :
                            `new LabelBox(element, "element-${part.name}-label", "${part.name}", {
                                style: ${Names.styles}.propertykeyword,
                                selectable: false
                             }),
                            this.rootProjection.getBox(element.${part.name})
                        ` }`  )).concat(
// Map all references
                        c.allPReferences().map(ref => `
                        ${ ref.isList ? `
                            new LabelBox(element, "element-${ref.name}-label", "${ref.name}", { 
                                style: ${Names.styles}.keyword,
                                selectable: false
                            }),
                            ( element.${ref.name}.length === 0 ? null : 
                                ${this.conceptReferenceListProjection("Vertical", ref)}
                            ),
                            new AliasBox(element, "new-${ref.name}", "add ${ref.name}", {
                                style: ${Names.styles}.indentedplaceholdertext
                            })
                        ` :
                            (this.conceptReferenceProjection(ref) + ", ")
                        }`  )
                ).join(",")}
                    ])
                ${c.expression() ? `])`: ""}
                }                
                `).join(os.EOL)}          
                  
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

    private generateUserProjection(language: PiLanguageUnit, c: PiLangClass, editor: DefEditorConcept) {
        let result: string = "";
        const projection: MetaEditorProjection = editor.projection;
        const multiLine = projection.lines.length > 1;
        if(multiLine){
            result += `new VerticalListBox(element, "${c.name}-overall", [
            `;
        }

        let indentNr = 0;
        projection.lines.forEach( (line, index) => {
            // let hasIndent = false;
            // const firstItem = line.items[0];
            // if( firstItem instanceof DefEditorProjectionIndent  && firstItem.amount > 0) {
            //     result += ` // INDENT should be ${firstItem.amount}
            //                     new IndentBox(element, "indent", ${firstItem.amount}, `
            //     hasIndent = true;
            // }
            if( line.indent > 0) {
                result += ` // INDENT should be ${line.indent}
                                new IndentBox(element, "${"indent-" + indentNr++}", ${line.indent}, `
                // hasIndent = true;
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
                    const appliedFeature: PiLangProperty = item.expression.appliedfeature.referedElement;
                    if( appliedFeature instanceof PiLangPrimitiveProperty){
                        result += this.primitivePropertyProjection(appliedFeature) + ", ";
                    } else if( appliedFeature instanceof PiLangEnumProperty) {
                        result += this.enumPropertyProjection(appliedFeature) + ", ";
                    } else if( appliedFeature instanceof PiLangConceptProperty) {
                        if( appliedFeature.isPartOf()) {
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
                                result += this.conceptReferenceProjection(appliedFeature) + ", ";
                            }
                        }
                    } else {
                        result += `// ERROR unknown property box here for ${appliedFeature.name}
                        `;
                    }
                }
            });
            if( line.items.length > 1) {
                result += ` ], { selectable: false } ) `
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
        return `public get${c.name}Box(element: ${Names.concept(c)}): Box {
                    return ${result};
                }`;
    }

    enumPropertyProjection(p: PiLangEnumProperty) {
        return `
            this.helpers.enumSelectFor${p.type.name}(element, 
                "${p.name}-type",
                () => { return { id: element.${p.name}.name, label: element.${p.name}.name} },
                (o: SelectOption) => element.${p.name} = ${Names.enumeration(p.type.referedElement())}.fromString(o.id)
            )
        `;
    }
    conceptPartListProjection(direction: string, propertyConcept: PiLangConceptProperty) {
        return `
            new ${direction}ListBox(element, "element-${propertyConcept.name}-list", 
                element.${propertyConcept.name}.map(feature => {
                    return this.rootProjection.getBox(feature);
                })
            )`;
    }

    conceptReferenceProjection(appliedFeature: PiLangConceptProperty) {
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
                        element.${appliedFeature.name} = new PiElementReference<${featureType}>(${Names.environment(appliedFeature.owningConcept.language)}.getInstance().scoper.getFromVisibleElements(
                            element,
                            option.label,
                            "${featureType}"
                        ) as ${featureType}, "${featureType}");
                    }
                )
            `
    }

    conceptReferenceProjectionInList(appliedFeature: PiLangConceptProperty) {
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


    conceptReferenceListProjection(direction: string, reference: PiLangConceptProperty) {
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

    primitivePropertyProjection(appliedFeature: PiLangPrimitiveProperty) {
        // TODO This now only works for strings
        return `new TextBox(element, "element-${appliedFeature.name}-text", () => element.${appliedFeature.name}, (c: string) => (element.${appliedFeature.name} = c as ${"string"}),
                {
                    placeHolder: "text",
                    style: ${Names.styles}.placeholdertext
                })`
    }

}
