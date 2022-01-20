import {
    PiBinaryExpressionConcept,
    PiClassifier,
    PiConceptProperty,
    PiExpressionConcept,
    PiLanguage,
    PiLimitedConcept,
    PiPrimitiveProperty,
    PiPrimitiveType,
    PiProperty
} from "../../../languagedef/metalanguage";
import { ENVIRONMENT_GEN_FOLDER, LANGUAGE_GEN_FOLDER, Names, PROJECTITCORE, Roles, sortConceptsWithBase } from "../../../utils";
import {
    BoolKeywords,
    ListInfo,
    ListJoinType,
    PiEditClassifierProjection,
    PiEditProjection,
    PiEditProjectionDirection,
    PiEditProjectionGroup,
    PiEditProjectionItem,
    PiEditProjectionLine,
    PiEditProjectionText,
    PiEditPropertyProjection,
    PiEditTableProjection,
    PiEditUnit,
    PiOptionalPropertyProjection
} from "../../metalanguage";
import { ParserGenUtil } from "../../../parsergen/parserTemplates/ParserGenUtil";

export class ProjectionTemplate {
    private tableProjections: PiEditTableProjection[] = []; // holds all table projections during the generation
    // the values for the boolean keywords are set on initialization (by a call to 'setStandardBooleanKeywords')
    private trueKeyword: string = "true";
    private falseKeyword: string = "false";

    // TODO take super projections into account
    generateProjectionDefault(language: PiLanguage, editorDef: PiEditUnit, relativePath: string): string {
        // generate a 'normal' group, but without the final end bracket
        let result = this.generateGroupWithoutBracket(language, editorDef.getDefaultProjectiongroup(), relativePath);

        // binary concepts are only handled in the default projection group
        let binaryConcepts = language.concepts.filter(c => (c instanceof PiBinaryExpressionConcept));
        // sort the concepts such that base concepts come last
        binaryConcepts = sortConceptsWithBase(binaryConcepts, language.findExpressionBase());

        return result +
            `                               
                ${ !!binaryConcepts && binaryConcepts.length > 0  
                // only add these two methods when there are binary concepts, i.e. only for the default projection group
                ? 
                    `private ${Names.binaryProjectionFunction()} (element: ${Names.allConcepts(language)}) {
                        ${binaryConcepts.map(c => 
                         `if (element instanceof ${Names.classifier(c)}) {
                            return this.createBinaryBox(element, "${editorDef.getDefaultProjectiongroup().findExtrasForType(c).symbol}");
                         }`).join(" else ")}
                         return null;
                    }              
                                    
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
                    }` 
                : ``  
                }            

            }`;
    }

    setStandardBooleanKeywords(editorDef: PiEditUnit) {
        // get the standard labels for true and false
        const stdLabels: BoolKeywords = editorDef.getDefaultProjectiongroup().standardBooleanProjection;
        if (!!stdLabels) {
            this.trueKeyword = stdLabels.trueKeyword;
            this.falseKeyword = stdLabels.falseKeyword;
        }
    }

    generateProjectionGroup(language: PiLanguage, projectionGroup: PiEditProjectionGroup, relativePath: string): string {
        return this.generateGroupWithoutBracket(language, projectionGroup, relativePath) + "\n}";
    }

    // generates a group without binary expression concepts, and does NOT add the final end bracket
    private generateGroupWithoutBracket(language: PiLanguage, projectionGroup: PiEditProjectionGroup, relativePath: string): string {
        // reset the table projections, then remember all table projections
        this.tableProjections = [];
        this.tableProjections.push(...projectionGroup.allTableProjections());

        // TODO add projections for abstract concepts and interfaces
        // get all units and all concepts that are not bin expressions, limited concepts, or abstract
        const allClassifiersWithProjection = this.findClassifiersWithProjection(language, projectionGroup);
        const classifiersWithTableProjection: PiClassifier[] = this.tableProjections.map(t => t.concept.referred);

        // TODO sort out unused imports
        const modelImports: string[] = language.units.map(u => `${Names.classifier(u)}`)
            .concat(language.concepts.map(c => `${Names.classifier(c)}`)
                .concat(language.interfaces.map(c => `${Names.interface(c)}`)));

        return `
            import { observable, makeObservable } from "mobx";

            import {
                BoxFactory,
                Box,
                PiTableDefinition,
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
             * Class ${Names.projectionDefault(language)} implements the projections for elements of
             * language ${language.name} defined in the editor named ${projectionGroup.name}.
             * These are merged with the custom build additions and other definition-based editor parts
             * in a three-way manner. For each modelelement,
             * (1) if a custom build creator/behavior is present, this is used,
             * (2) if a creator/behavior based on one of the editor definition is present, this is used,
             * (3) if neither (1) nor (2) yields a result, the default is used.
             */
            export class ${Names.projectionDefault(language)} implements ${Names.PiProjection} {
                rootProjection: ${Names.PiProjection};
                showBrackets: boolean = false;
                name: string = "${projectionGroup.name}";

                constructor(name?: string) {
                    if (!!name) {
                        this.name = name;
                    }
                    makeObservable(this, {
                        showBrackets: observable,
                    });
                }

                getBox(element: ${Names.PiElement}): Box {
                    if (element === null ) {
                        return null;
                    }

                    switch( element.piLanguageConcept() ) {
                        ${allClassifiersWithProjection.map(c => `
                        case "${Names.classifier(c)}" : return this.${Names.projectionFunction(c)} (element as ${Names.classifier(c)});`
        ).join("  ")}
                    }
                    return null;
                }
                
                getTableDefinition(conceptName: string): PiTableDefinition {
                    if (conceptName === null || conceptName.length === 0) {
                        return null;
                    }

                    switch( conceptName ) {
                        ${classifiersWithTableProjection.map(c => `
                        case "${Names.classifier(c)}" : return this.${Names.tableCellFunction(c)} ();`).join("  ")}
                    }
                    // nothing fits
                    return null;
                }
                
                private ${Names.binaryProjectionFunction()} (element: ${Names.allConcepts(language)}) {
                    ${binaryConceptsWithDefaultProjection.map(c => 
                     `if (element instanceof ${Names.classifier(c)}) {
                        return this.createBinaryBox(element, "${editorDef.findConceptEditor(c).symbol}");
                     }`).join(" else ")}
                     return null;
                }              

                ${allClassifiersWithProjection.map(c => this.generateProjectionForClassfier(language, c, projectionGroup.findProjectionForType(c))).join("\n")}                                        
        `;
    }

    private findClassifiersWithProjection(language: PiLanguage, group: PiEditProjectionGroup) {
        const nonBinaryClassifiers: PiClassifier[] = language.concepts.filter(c =>
            !(c instanceof PiBinaryExpressionConcept) &&
            !(c instanceof PiLimitedConcept) &&
            !c.isAbstract);
        nonBinaryClassifiers.push(...language.units);

        // only for non-default projections group the following can be true: nonBinaryConceptsWithProjection !== nonBinaryClassifiers
        const nonBinaryConceptsWithProjection = nonBinaryClassifiers.filter(c => {
            const editor = group.findProjectionForType(c);
            return !!editor;
        });
        return nonBinaryConceptsWithProjection;
    }

    private generateProjectionForClassfier(language: PiLanguage, concept: PiClassifier, projection: PiEditClassifierProjection) {
        if (projection instanceof PiEditProjection) {
            const elementVarName = Roles.elementVarName(concept);
            let result = this.generateLines(projection.lines, elementVarName, concept.name, language);
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

    private generateLines(lines: PiEditProjectionLine[], elementVarName: string, boxLabel: string, language: PiLanguage) {
        let result: string = "";
        // do all lines, separate them with a comma
        lines.forEach((line, index) => {
            result += this.generateLine(line, elementVarName, index, boxLabel, language);
            if (index !== lines.length - 1) { // add a comma
                result += ",";
            }
        });
        if (lines.length > 1) { // multi-line projection, so surround with vertical box
            result = `BoxFactory.verticalList(${elementVarName}, "${boxLabel}-overall", [
                ${result} 
            ])`;
        }
        if (result === "") {
            result = "null";
        }
        return result;
    }

    private generateLine(line: PiEditProjectionLine, elementVarName: string, index: number, boxLabel: string, language: PiLanguage): string {
        let result: string = "";
        // TODO empty lines are discarded in the editor now
        if (!line.isEmpty()) {
            // do all projection items in the line, separate them with a comma
            line.items.forEach((item, itemIndex) => {
                result += this.generateItem(item, elementVarName, index, itemIndex, boxLabel, language);
                if (itemIndex < line.items.length - 1) {
                    result += ",";
                }
            });
            if (line.items.length > 1) { // surround with horizontal box
                // TODO Too many things are now selectable, but if false, you cannot select e.g. an attribute
                result = `BoxFactory.horizontalList(${elementVarName}, "${boxLabel}-hlist-line-${index}", [ ${result} ], { selectable: true } ) `;
            }
            if (line.indent > 0) { // surround with indentBox
                result = `BoxUtils.indentBox(${elementVarName}, ${line.indent}, "${index}", ${result} )`;
            }
        }
        return result;
    }

    private generateItem(item: PiEditProjectionItem,
                           elementVarName: string,
                           lineIndex: number,
                           itemIndex: number,
                           mainBoxLabel: string,
                           language: PiLanguage) {
        // TODO add table projection for lists
        let result: string = "";
        if (item instanceof PiEditProjectionText) {
            result += ` BoxUtils.labelBox(${elementVarName}, "${ParserGenUtil.escapeRelevantChars(item.text.trim())}", "${lineIndex}-item-${itemIndex}") `;
        } else if (item instanceof PiOptionalPropertyProjection) {
            result += this.generateOptionalProjection(item, elementVarName, mainBoxLabel, language);
        } else if (item instanceof PiEditPropertyProjection) {
            // Note: this condition must come after PiOptionalPropertyProjection,
            // because PiOptionalPropertyProjection is a sub class of PiEditPropertyProjection
            result += this.generatePropertyProjection(item, elementVarName, mainBoxLabel, language);
        }
        return result;
    }

    private generateOptionalProjection(optional: PiOptionalPropertyProjection, elementVarName: string, mainBoxLabel: string, language: PiLanguage): string {
        const propertyProjection: PiEditPropertyProjection = optional.findPropertyProjection();
        const optionalPropertyName = (propertyProjection === undefined ? "UNKNOWN" : propertyProjection.property.name);
        const myLabel = `${mainBoxLabel}-optional-${optionalPropertyName}`;

        // reuse the general method to handle lines
        let result = this.generateLines(optional.lines, elementVarName, myLabel, language);

        // surround with optional box
        result = `BoxFactory.optional(${elementVarName}, "optional-${optionalPropertyName}", () => (!!${elementVarName}.${optionalPropertyName}),
                ${result},
                false, "<+>"
            )`
        return result;
    }

    /**
     * Projection template for a property.
     *
     * @param item      The property projection
     * @param elementVarName
     * @param mainLabel
     * @param language
     * @private
     */
    private generatePropertyProjection(item: PiEditPropertyProjection, elementVarName: string, mainLabel: string, language: PiLanguage) {
        let result: string = "";
        const property: PiProperty = item.property.referred;
        if (property instanceof PiPrimitiveProperty) {
            result += this.primitivePropertyProjection(property, elementVarName, item.boolInfo, item.listInfo);
        } else if (property instanceof PiConceptProperty) {
            if (property.isPart) {
                if (property.isList) {
                    if (!!item.listInfo) { // if there is information on how to project the appliedFeature as a list, make it a list
                        result += this.generatePartListProjection(item, property, elementVarName);
                    } else if (!!item.listInfo && item.listInfo.isTable) {  // if there is information on how to project the appliedFeature as a table, make it a table
                        result += this.generatePropertyAsTable(item.listInfo.direction, property, elementVarName, language);
                    }
                } else { // single element
                    result += `BoxUtils.getBoxOrAlias(${elementVarName}, "${property.name}", "${property.type.name}", this.rootProjection) `;
                }
            } else { // reference
                if (property.isList) {
                    if (!!item.listInfo) {
                        result += this.generateReferenceListProjection(language, item.listInfo, property, elementVarName);
                    } else if (!!item.listInfo && item.listInfo.isTable) {
                        // TODO adjust for tables
                    }
                } else { // single element
                    result += this.generateReferenceProjection(language, property, elementVarName);
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
    private generatePropertyAsTable(orientation: PiEditProjectionDirection, property: PiConceptProperty, elementVarName: string, language: PiLanguage): string {
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
                return ${this.generateItem(cell, `cell${index}`, index, index, property.type.referred.name, language)}
            },\n`
        );
        // return the projection based on the orientation of the table
        if (orientation === PiEditProjectionDirection.Vertical) {
            return `TableUtil.tableBoxColumnOriented(
                ${elementVarName},
                "${property.name}",
                this.rootProjection.getTableDefinition("${property.type.referred.name}").headers,
                this.rootProjection.getTableDefinition("${property.type.referred.name}").cells,
                ExampleEnvironment.getInstance().editor)`;
        } else {
            return `TableUtil.tableBoxRowOriented(
                ${elementVarName},
                "${property.name}",
                this.rootProjection.getTableDefinition("${property.type.referred.name}").headers,
                this.rootProjection.getTableDefinition("${property.type.referred.name}").cells,
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
    private generatePartListProjection(item: PiEditPropertyProjection, propertyConcept: PiConceptProperty, elementVarName: string) {
        let joinEntry = this.getJoinEntry(item.listInfo);
        if (item.listInfo.direction === PiEditProjectionDirection.Vertical) {
            return `BoxUtils.verticalPartListBox(${elementVarName}, "${propertyConcept.name}", this.rootProjection${joinEntry})`;
        } // else
        return `BoxUtils.horizontalPartListBox(${elementVarName}, "${propertyConcept.name}", this.rootProjection${joinEntry})`;
    }

    private generateReferenceProjection(language: PiLanguage, appliedFeature: PiConceptProperty, element: string) {
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

    private generateReferenceListProjection(language: PiLanguage, listJoin: ListInfo, reference: PiConceptProperty, element: string) {
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

    private primitivePropertyProjection(property: PiPrimitiveProperty, element: string, boolInfo?: BoolKeywords, listInfo?: ListInfo): string {
        if (property.isList) {
            return this.listPrimitivePropertyProjection(property, element, boolInfo, listInfo);
        } else {
            return this.singlePrimitivePropertyProjection(property, element, boolInfo);
        }
    }

    private singlePrimitivePropertyProjection(property: PiPrimitiveProperty, element: string, boolInfo?: BoolKeywords): string {
        const listAddition: string = `${property.isList ? `, index` : ``}`;
        switch (property.type.referred) {
            case PiPrimitiveType.string:
            case PiPrimitiveType.identifier:
                return `BoxUtils.textBox(${element}, "${property.name}"${listAddition})`;
            case PiPrimitiveType.number:
                return `BoxUtils.numberBox(${element}, "${property.name}"${listAddition})`;
            case PiPrimitiveType.boolean:
                let trueKeyword: string = this.trueKeyword;
                let falseKeyword: string = this.falseKeyword;
                if (!!boolInfo) {
                    trueKeyword = boolInfo.trueKeyword;
                    falseKeyword = boolInfo.falseKeyword;
                }
                return `BoxUtils.booleanBox(${element}, "${property.name}", {yes:"${trueKeyword}", no:"${falseKeyword}"}${listAddition})`;
            default:
                return `BoxUtils.textBox(${element}, "${property.name}"${listAddition})`;
        }
    }

    private listPrimitivePropertyProjection(property: PiPrimitiveProperty, element: string, boolInfo?: BoolKeywords, listInfo?: ListInfo): string {
        let direction: string = "verticalList";
        if (!!listInfo && listInfo.direction === PiEditProjectionDirection.Horizontal) {
            direction = "horizontalList";
        }
        // TODO also adjust role '..-hlist' to '..-vlist'?
        return `BoxFactory.${direction}(${element}, "${Roles.property(property)}-hlist",
                            (${element}.${property.name}.map( (item, index)  =>
                                ${this.singlePrimitivePropertyProjection(property, element, boolInfo)}
                            ) as Box[]).concat( [
                                // TODO  Create Action for the role to actually add an element.
                                BoxFactory.alias(${element}, "new-${Roles.property(property)}-hlist", "<+ ${property.name}>")
                            ])
                        )`;
    }

    private generateTableCellFunction(language: PiLanguage, c: PiClassifier, piEditConcept: PiEditConcept): string {
        // find the projection to use for the type of the given property
        const myTableProjection: PiEditTableProjection = piEditConcept?.tableProjections[0];
        if (!!myTableProjection) {
            // create the cell getters
            let cellGetters: string = '';
            myTableProjection.cells.forEach((cell, index) =>
                cellGetters += `(cell${index}: ${Names.classifier(c)}): Box => {
                    return ${this.itemProjection(cell, `cell${index}`, index, index, c, language)}
                },\n`
            );

            return `${Names.tableCellFunction(c)}(): PiTableDefinition {
                const result: PiTableDefinition = {
                    headers: [ ${myTableProjection.headers.map(head => `"${head}"`).join(", ")} ],
                    cells: [${cellGetters}]
                };
                return result;
            }
        `;
        } else {
            console.log("INTERNAL PROJECTIYT ERROR in generaateTableCellFunction");
            return "";
        }
    }
}
