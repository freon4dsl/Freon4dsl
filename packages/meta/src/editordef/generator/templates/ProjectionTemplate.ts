import {
    PiBinaryExpressionConcept,
    PiClassifier,
    PiConceptProperty,
    PiExpressionConcept,
    PiLanguage,
    PiLimitedConcept,
    PiPrimitiveProperty, PiPrimitiveType,
    PiProperty
} from "../../../languagedef/metalanguage";
import {
    ENVIRONMENT_GEN_FOLDER,
    LANGUAGE_GEN_FOLDER,
    Names,
    PROJECTITCORE,
    Roles,
    sortConceptsWithBase
} from "../../../utils";
import {
    ListInfo,
    ListJoinType,
    PiEditParsedProjectionIndent,
    PiEditProjection,
    PiEditProjectionDirection,
    PiEditProjectionText,
    PiEditPropertyProjection,
    PiOptionalPropertyProjection,
    PiEditUnit,
    PiEditTableProjection, PiEditClassifierProjection, PiEditProjectionItem
} from "../../metalanguage";
import { ParserGenUtil } from "../../../parsergen/parserTemplates/ParserGenUtil";

export class ProjectionTemplate {
    private tableProjections: PiEditTableProjection[] = []; // holds all table projections during the generation

    generateProjectionDefault(language: PiLanguage, editorDef: PiEditUnit, relativePath: string): string {
        // reset the table projections, then remember all table projections
        this.tableProjections = [];
        this.tableProjections.push(...editorDef.allTableProjections());

        let binaryConcepts = language.concepts.filter(c => (c instanceof PiBinaryExpressionConcept));
        // sort the concepts such that base concepts come last
        binaryConcepts = sortConceptsWithBase(binaryConcepts, language.findExpressionBase());

        const conceptsWithoutProjection = language.concepts.filter(c => !(c instanceof PiBinaryExpressionConcept) && !(c instanceof PiLimitedConcept) ).filter(c => {
            const editor = editorDef.findProjectionForType(c);
            return editor === undefined || editor === null;
        });
        if (conceptsWithoutProjection.length > 0) {
            // TODO how to report this true internal error
            console.error("Projection generator: there are elements without projections "+ conceptsWithoutProjection.map(c => c.name));
        }

        const allClassifiers: PiClassifier[] = [];
        allClassifiers.push(...language.units);
        // TODO add interfaces as well?
        allClassifiers.push(...language.concepts);

        const nonBinaryClassifiers: PiClassifier[] = allClassifiers.filter(c => !(c instanceof PiBinaryExpressionConcept));
        const binaryClassifiers: PiClassifier[] = allClassifiers.filter(c => c instanceof PiBinaryExpressionConcept);

        const nonBinaryConceptsWithProjection = nonBinaryClassifiers.filter(c => {
            const editor = editorDef.findProjectionForType(c);
            return !!editor;
        });

        const modelImports: string[] = allClassifiers.map(u => `${Names.classifier(u)}`)
            .concat(language.interfaces.map(c => `${Names.interface(c)}`));

        // TODO sort out unused imports
        const defaultGroup = editorDef.getDefaultProjectiongroup();
        // TODO make classes for the other groups
        return `
            import { observable, makeObservable } from "mobx";

            import {
                BoxFactory,
                Box,
                TableUtil,
                ${Names.PiElement},
                ${Names.PiProjection},
                createDefaultBinaryBox,
                createDefaultExpressionBox,
                isPiBinaryExpression,
                ${Names.PiBinaryExpression},
                BoxUtils
            } from "${PROJECTITCORE}";

            import { ${Names.PiElementReference}, ${Names.allConcepts(language)}, ${modelImports.map(c => `${c}`).join(", ") } } from "${relativePath}${LANGUAGE_GEN_FOLDER }";
            import { ${Names.environment(language)} } from "${relativePath}${ENVIRONMENT_GEN_FOLDER}/${Names.environment(language)}";

             /**
             * Class ${Names.projectionDefault(language)} implements the default projections for elements of
             * language ${language.name}.
             * These are merged with the custom build additions and definition-based editor parts
             * in a three-way manner. For each modelelement,
             * (1) if a custom build creator/behavior is present, this is used,
             * (2) if a creator/behavior based on the editor definition is present, this is used,
             * (3) if neither (1) nor (2) yields a result, the default is used.
             */
            export class ${Names.projectionDefault(language)} implements ${Names.PiProjection} {
                rootProjection: ${Names.PiProjection};
                showBrackets: boolean = false;
                name: string = "${defaultGroup.name}";

                constructor(name?: string) {
                    if (!!name) {
                        this.name = name;
                    }
                    makeObservable(this, {
                        showBrackets: observable,
                    });
                }

                getBox(exp: ${Names.PiElement}): Box {
                    if (exp === null ) {
                        return null;
                    }

                    switch( exp.piLanguageConcept() ) {
                        ${nonBinaryClassifiers.map(c => `
                        case "${Names.classifier(c)}" : return this.${Names.projectionFunction(c)} (exp as ${Names.classifier(c)});`
                        ).join("  ")}
                        ${binaryClassifiers.map(c =>
                        `case "${Names.classifier(c)}" : return this.${Names.binaryProjectionFunction()} (exp as ${Names.classifier(c)});`
                        ).join("  ")}
                    }
                    // nothing fits
                    throw new Error("No box defined for this expression:" + exp.piId());
                }
                
                private ${Names.binaryProjectionFunction()} (element: ${Names.allConcepts(language)}) {
                    ${binaryConcepts.map(c => 
                     `if (element instanceof ${Names.classifier(c)}) {
                        return this.createBinaryBox(element, "${editorDef.findExtrasForType(c).symbol}");
                     }`).join(" else ")}
                     return null;
                }              

                ${nonBinaryConceptsWithProjection.map(c => this.generateUserProjection(language, c, editorDef.findProjectionForType(c))).join("\n")}

                /**
                 *  Create a standard binary box to ensure binary expressions can be edited easily
                 */
                private createBinaryBox(exp: PiBinaryExpression, symbol: string): Box {
                    const binBox = createDefaultBinaryBox(exp, symbol, ${Names.environment(language)}.getInstance().editor);
                    if (
                        this.showBrackets &&
                        !!exp.piContainer().container &&
                        isPiBinaryExpression(exp.piContainer().container)
                    ) {
                        return BoxFactory.horizontalList(exp, "brackets", [
                            BoxUtils.labelBox(exp, "(", "bracket-open", true),
                            binBox,
                            BoxUtils.labelBox(exp, ")", "bracket-close", true)
                        ]);
                    } else {
                        return binBox;
                    }
                }
            }`;
    }

    private generateUserProjection(language: PiLanguage, concept: PiClassifier, projection: PiEditClassifierProjection) {
        // TODO for now: do not do anything for a limited concept
        if (projection.classifier instanceof PiLimitedConcept) {
            return '';
        }

        if (projection instanceof PiEditProjection) {
            let result: string = "";
            const elementVarName = Roles.elementVarName(concept);
            const multiLine = projection.lines.length > 1;
            if (multiLine) {
                result += `BoxFactory.verticalList(${elementVarName}, "${concept.name}-overall", [
            `;
            }

            projection.lines.forEach((line, index) => {
                if (line.indent > 0) {
                    result += `BoxUtils.indentBox(${elementVarName}, ${line.indent}, "${index}", `;
                }
                if (line.items.length > 1) {
                    result += `BoxFactory.horizontalList(${elementVarName}, "${concept.name}-hlist-line-${index}", [ `;
                }
                // Now all projection items in the line
                line.items.forEach((item, itemIndex) => {
                    result += this.itemProjection(item, elementVarName, index, itemIndex, concept, language);
                    // TODO remove ref to PiEditParsedProjectionIndent => should not be in line after normalisation
                    if (!(item instanceof PiEditParsedProjectionIndent) && itemIndex < line.items.length - 1) {
                        result += ",";
                    }
                });
                if (line.items.length > 1) {
                    // TODO Too many things are now selectable, but if false, you cannot select e.g. an attribute
                    result += ` ], { selectable: true } ) `;
                }
                if (line.indent > 0) {
                    // end of line, finish indent when applicable
                    result += ` )`;
                }
                if (index !== projection.lines.length - 1) {
                    result += ",";
                }
            });
            if (multiLine) {
                result += ` ])`;
            }
            if (result === "") {
                result = "null";
            }
            if (concept instanceof PiExpressionConcept) {
                return `public ${Names.projectionFunction(concept)} (${elementVarName}: ${Names.concept(concept)}) : Box {
                    return createDefaultExpressionBox( ${elementVarName}, "default-expression-box", [
                            ${result}
                        ],
                        { selectable: false }
                    );
                }`;
            } else {
                if (result[0] === "\n") {
                    // TODO find out where this newline is added and make sure this is not done
                    // this error occurred in openhab project for concept ItemModel (!!only for this concept)
                    // for now:
                    // console.log("FOUND NEWLINE");
                    result = result.substr(1);
                }
                return `public ${Names.projectionFunction(concept)} (${elementVarName}: ${Names.classifier(concept)}) : Box {
                    return ${result};
                }`;
            }
        } else if (projection instanceof PiEditTableProjection) {
            // TODO table projection
            return '';
        }
        return '';
    }

    private itemProjection(item: PiEditProjectionItem,
                           elementVarName: string,
                           lineIndex: number,
                           itemIndex: number,
                           concept: PiClassifier,
                           language: PiLanguage) {
        // TODO add table projection for lists
        let result: string = "";
        if (item instanceof PiEditProjectionText) {
            result += ` BoxUtils.labelBox(${elementVarName}, "${ParserGenUtil.escapeRelevantChars(item.text.trim())}", "${lineIndex}-item-${itemIndex}") `;
        } else if (item instanceof PiOptionalPropertyProjection) {
            result += this.optionalProjection(item, elementVarName, lineIndex, concept, language);
        } else if (item instanceof PiEditPropertyProjection) {
            // Note: this condition should come after PiOptionalPropertyProjection, because PiOptionalPropertyProjection is a sub class
            // of PiEditPropertyProjection
            result += this.propertyProjection(item, elementVarName, concept, language);
        }
        return result;
    }

    private optionalProjection(optional: PiOptionalPropertyProjection, elementVarName: string, lineIndex: number, concept: PiClassifier,
                               language: PiLanguage): string {
        let result = "";
        // TODO see if we can reuse the general method to handle lines
        optional.lines.forEach(l => {
            l.items.forEach((subitem, subitemIndex) => {
                result += this.itemProjection(subitem, elementVarName, lineIndex, subitemIndex, concept, language);
                // Add a comma if there was a projection and its in the middle of the list
                if (!(subitem instanceof PiEditParsedProjectionIndent) && subitemIndex < l.items.length - 1) {
                    result += ", ";
                }
            })
            // If there are more items, surround with horizontal list
            if (l.items.length > 1) {
                result = `BoxFactory.horizontalList(${elementVarName}, "${concept.name}-hlist-line-${lineIndex}", [${result}])`;
            }

            const propertyProjection: PiEditPropertyProjection = optional.findPropertyProjection();
            const optionalPropertyName = (propertyProjection === undefined ? "UNKNOWN" : propertyProjection.property.name);
            result = `BoxFactory.optional(${elementVarName}, "optional-${optionalPropertyName}", () => (!!${elementVarName}.${optionalPropertyName}),
                ${ result},
                false, "<+>"
            )`;
        });
        return result;
    }

    /**
     * Projection template for a property.
     *
     * @param item      The property projection
     * @param elementVarName
     * @param concept
     * @param language
     * @private
     */
    private propertyProjection(item: PiEditPropertyProjection, elementVarName: string, concept: PiClassifier, language: PiLanguage) {
        let result: string = "";
        const property: PiProperty = item.property.referred;
        if (property instanceof PiPrimitiveProperty) {
            result += this.primitivePropertyProjection(property, elementVarName);
        } else if (property instanceof PiConceptProperty) {
            if (property.isPart) {
                if (property.isList) {
                    if (!!item.listInfo) { // if there is information on how to project the appliedFeature as a list, make it a list
                        result += this.conceptPartListProjection(item, concept, property, elementVarName);
                    } else if (!!item.listInfo && item.listInfo.isTable) {  // if there is information on how to project the appliedFeature as a table, make it a table
                        result += this.conceptPartTableProjection(item.listInfo.direction, property, elementVarName, language);
                    }
                } else { // single element
                    result += `BoxUtils.getBoxOrAlias(${elementVarName}, "${property.name}", this.rootProjection) `;
                }
            } else { // reference
                if (property.isList) {
                    if (!!item.listInfo) {
                        result += this.conceptReferenceListProjection(language, item.listInfo, property, elementVarName);
                    } else if (!!item.listInfo && item.listInfo.isTable) {
                        // TODO adjust for tables
                    }
                } else { // single element
                    result += this.conceptReferenceProjection(language, property, elementVarName);
                }
            }
        } else {
            result += `/* ERROR unknown property box here for ${property.name} */ `;
        }
        return result;
    }

    /**
     * Returns the text string that projects 'property' as a table.
     * @param orientation       Either row or column based
     * @param property          The property to be projected
     * @param elementVarName    The name of the variable that holds the property at runtime
     * @param language          The language for which this projection is made
     * @private
     */
    private conceptPartTableProjection(orientation: PiEditProjectionDirection, property: PiConceptProperty, elementVarName: string, language: PiLanguage): string {
        // find the projection to use for the type of the given property
        const featureType: PiClassifier = property.type.referred;
        const myTableProjection: PiEditTableProjection = this.tableProjections.find(proj => proj.classifier.referred === featureType);
        // TODO handle multiple tableProjections, now the first is chosen
        if (!myTableProjection) {
            console.error(`Cannot find a table projection for property ${property.name}.`);
            return `BoxUtils.labelBox(${elementVarName}, "Cannot find a table projection for this property.")`;
        }
        // create the cell getters
        let cellGetters: string = '';
        myTableProjection.cells.forEach((cell, index) =>
            cellGetters += `(cell${index}: ${Names.classifier(featureType)}): Box => {
                return ${this.itemProjection(cell, `cell${index}`, index, index, property.type.referred, language)}
            },\n`
        );
        // return the projection based on the orientation of the table
        if (orientation === PiEditProjectionDirection.Vertical) {
            return `TableUtil.tableBoxColumnOriented(
                ${elementVarName},
                "${property.name}",
                [ ${myTableProjection.headers.map(head => `"${head}"`).join(", ")}] ,
                [ ${cellGetters} ],
                ExampleEnvironment.getInstance().editor)`;
        } else {
            return `TableUtil.tableBoxRowOriented(
                ${elementVarName},
                "${property.name}",
                [ ${myTableProjection.headers.map(head => `"${head}"`).join(", ")}] ,
                [ ${cellGetters} ],
                ExampleEnvironment.getInstance().editor)`;
        }
    }

    /**
     * generate the part list
     *
     * @param item
     * @param concept
     * @param propertyConcept   The property for which the projection is generated.
     * @param elementVarName    The name of the element parameter of the getBox projection method.
     */
    private conceptPartListProjection(item: PiEditPropertyProjection, concept: PiClassifier, propertyConcept: PiConceptProperty, elementVarName: string) {
        let joinEntry = this.getJoinEntry(item.listInfo);
        if (item.listInfo.direction === PiEditProjectionDirection.Vertical) {
            return `BoxUtils.verticalPartListBox(${elementVarName}, "${propertyConcept.name}", this.rootProjection${joinEntry})`;
        } // else
        return `BoxUtils.horizontalPartListBox(${elementVarName}, "${propertyConcept.name}", this.rootProjection${joinEntry})`;
    }

    private conceptReferenceProjection(language: PiLanguage, appliedFeature: PiConceptProperty, element: string) {
        const featureType = Names.classifier(appliedFeature.type.referred);
        return `BoxUtils.referenceBox(
                                ${element},
                                "${appliedFeature.name}",
                                (selected: string) => {
                                    ${element}.${appliedFeature.name} = PiElementReference.create<${featureType}>(
                                       ${Names.environment(language)}.getInstance().scoper.getFromVisibleElements(
                                            ${element},
                                            selected,
                                            "${featureType}"
                                       ) as ${featureType}, "${featureType}");
                                },
                                ${Names.environment(language)}.getInstance().scoper
               )`;
    }

    private conceptReferenceListProjection(language: PiLanguage, listJoin: ListInfo, reference: PiConceptProperty, element: string) {
        let joinEntry = this.getJoinEntry(listJoin);
        if (listJoin.direction === PiEditProjectionDirection.Vertical) {
            return `BoxUtils.verticalReferenceListBox(${element}, "${reference.name}", ${Names.environment(language)}.getInstance().scoper ${joinEntry})`;
        } // else
        return `BoxUtils.horizontalReferenceListBox(${element}, "${reference.name}", ${Names.environment(language)}.getInstance().scoper ${joinEntry})`;
    }

    private getJoinEntry(listJoin: ListInfo) {
        let joinEntry: string = `, { text:"${listJoin.joinText}", type:"${listJoin.joinType}" }`;
        if (listJoin.joinType === ListJoinType.NONE || !(listJoin.joinText?.length > 0)) {
            joinEntry = "";
        }
        return joinEntry;
    }

    private primitivePropertyProjection(property: PiPrimitiveProperty, element: string): string {
        if (property.isList) {
            return this.listPrimitivePropertyProjection(property, element);
        } else {
            return this.singlePrimitivePropertyProjection(property, element);
        }
    }

    private singlePrimitivePropertyProjection(property: PiPrimitiveProperty, element: string): string {
        const listAddition: string = `${property.isList ? `, index` : ``}`;
        switch (property.type.referred) {
            case PiPrimitiveType.string:
            case PiPrimitiveType.identifier:
                return `BoxUtils.textBox(${element}, "${property.name}"${listAddition})`;
            case PiPrimitiveType.number:
                return `BoxUtils.numberBox(${element}, "${property.name}"${listAddition})`;
            case PiPrimitiveType.boolean:
                // TODO labels
                return `BoxUtils.booleanBox(${element}, "${property.name}", {yes:"true", no:"false"}${listAddition})`;
            default:
                return `BoxUtils.textBox(${element}, "${property.name}"${listAddition})`;
        }
    }

    private listPrimitivePropertyProjection(property: PiPrimitiveProperty, element: string): string {
        return `BoxFactory.horizontalList(${element}, "${Roles.property(property)}-hlist",
                            (${element}.${property.name}.map( (item, index)  =>
                                ${this.singlePrimitivePropertyProjection(property, element)}
                            ) as Box[]).concat( [
                                // TODO  Create Action for the role to actually add an element.
                                BoxFactory.alias(${element}, "new-${Roles.property(property)}-hlist", "<+ ${property.name}>")
                            ])
                        )`;
    }
}
