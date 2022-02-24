import {
    PiBinaryExpressionConcept,
    PiClassifier, PiConcept,
    PiConceptProperty,
    PiExpressionConcept, PiInterface,
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
    PiEditPropertyProjection, PiEditSuperProjection,
    PiEditTableProjection,
    PiEditUnit,
    PiOptionalPropertyProjection
} from "../../metalanguage";
import { ParserGenUtil } from "../../../parsergen/parserTemplates/ParserGenUtil";

export class ProjectionTemplate {
    private tableProjections: PiEditTableProjection[] = []; // holds all table projections during the generation of a single projection group
    private modelImports: string[] = []; // holds all imports from LANGUAGE during the generation of a single projection group
    private coreImports: string[] = []; // holds all imports from ProjectIt/core during the generation of a single projection group
    private envImports: string[] = []; // holds all imports from ENVIRONMENT during the generation of a single projection group
    // the values for the boolean keywords are set on initialization (by a call to 'setStandardBooleanKeywords')
    private trueKeyword: string = "true";
    private falseKeyword: string = "false";

    generateProjectionGroup(language: PiLanguage, projectionGroup: PiEditProjectionGroup, relativePath: string): string {
        // console.log("generateProjectionGroup " + projectionGroup.name);
        // binary concepts are only handled in the default projection group
        let binaryConcepts: PiConcept[] = [];
        if (projectionGroup.name === Names.defaultProjectionName) {
             binaryConcepts = language.concepts.filter(c => (c instanceof PiBinaryExpressionConcept));
        }

        // reset the table projections, then remember all table projections
        this.tableProjections = [];
        this.tableProjections.push(...projectionGroup.allTableProjections());

        // get all units and all concepts that are not bin expressions, limited concepts, or abstract
        const allClassifiersWithProjection = this.findClassifiersWithNormalProjection(language, projectionGroup);
        const classifiersWithTableProjection: PiClassifier[] = this.tableProjections.map(t => t.classifier.referred);

        // reset the imports
        // the neccessary imports are gathered while making the methods in the template
        // they are added to the generated 'coreText' string afterwards
        this.modelImports = [];
        this.envImports = [];
        this.coreImports = [Names.PiProjection, Names.PiCompositeProjection, Names.PiElement, "PiTableDefinition", "Box"]; // these are always used
        if (!!binaryConcepts && binaryConcepts.length > 0 && projectionGroup.name === Names.defaultProjectionName) {
            // these are always used in the default projection group
            this.modelImports.push(Names.allConcepts(language), Names.PiElementReference);
            this.coreImports.push("isPiBinaryExpression", "PiBinaryExpression", "createDefaultBinaryBox", "BoxFactory", "BoxUtils");
            this.envImports.push(Names.environment(language));
        }
        binaryConcepts.forEach(c =>
            this.addToIfNotPresent(this.modelImports, Names.classifier(c))
        );

        const coreText: string = `
             /**
             * Class ${Names.projection(projectionGroup)} implements the projections for elements of
             * language ${language.name} defined in the editor named ${projectionGroup.name}.
             * These are merged with the custom build additions and other definition-based editor parts
             * in a three-way manner. For each modelelement,
             * (1) if a custom build creator/behavior is present, this is used,
             * (2) if a creator/behavior based on one of the editor definition is present, this is used,
             * (3) if neither (1) nor (2) yields a result, the default is used.
             */
            export class ${Names.projection(projectionGroup)} implements ${Names.PiProjection} {
                rootProjection: ${Names.PiCompositeProjection};
                showBrackets: boolean = false;
                name: string = "${projectionGroup.name}";
                isEnabled: boolean = true;

                constructor() {
                    makeObservable(this, {
                        showBrackets: observable,
                    });
                }

                getBox(element: ${Names.PiElement}, nameOfSuper?: string): Box {
                    if (element === null ) {
                        return null;
                    }
                    
                    let boxType: string = element.piLanguageConcept();
                    if (!!nameOfSuper && nameOfSuper.length > 0) {
                        if (!this.rootProjection.checkSuper(nameOfSuper, element.piLanguageConcept()) ) {
                            throw new Error(\`A box requested for '\${nameOfSuper}', which is not a super class or interface of '\${element.piLanguageConcept()}'\`);
                        } else {
                            boxType = nameOfSuper;
                        }
                    }

                    switch( boxType ) {
                        ${allClassifiersWithProjection.map(c => `
                        case "${Names.classifier(c)}" : return this.${Names.projectionFunction(c)} (element as ${Names.classifier(c)});`
                            ).join("  ")}
                        ${binaryConcepts.map(c => // these are added only in the default projection group
                        `case "${Names.classifier(c)}" : return this.${Names.binaryProjectionFunction()} (element as ${Names.classifier(c)});`
                            ).join("  ")}
                    }
                    ${projectionGroup.name === Names.defaultProjectionName // only in the default projection group we need to give a message to the user
                    ?
                    `// nothing fits
                    throw new Error("No box defined for this expression:" + element.piId());`
                    : 
                    `return null;`}
                }
                
                getTableDefinition(conceptName: string): PiTableDefinition {
                    if (conceptName === null || conceptName.length === 0) {
                        return null;
                    }

                    switch( conceptName ) {
                        ${classifiersWithTableProjection.map(c => `
                        case "${Names.classifier(c)}" : return this.${Names.tabelDefinitionFunction(c)} ();`).join("  ")}
                    }
                    // nothing fits
                    return null;
                }                     

                ${allClassifiersWithProjection.map(c => this.generateProjectionForClassfier(language, c, projectionGroup.findNonTableProjectionForType(c))).join("\n")}                                        

                ${classifiersWithTableProjection.map(c => this.generateTableDefinition(language, c, projectionGroup.findTableProjectionForType(c))).join("\n")}
                
                ${!!binaryConcepts && binaryConcepts.length > 0 && projectionGroup.name === Names.defaultProjectionName
                    // only add these two methods when there are binary concepts, i.e. only for the default projection group
                    ?
                    `private ${Names.binaryProjectionFunction()} (element: ${Names.allConcepts(language)}) {
                        switch( element.piLanguageConcept() ){
                                ${binaryConcepts.map(c =>
                                    `case "${Names.classifier(c)}": 
                                            return this.createBinaryBox(element as ${Names.classifier(c)}, "${projectionGroup.findExtrasForType(c).symbol}");
                                    `).join("")}
                        }
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

        let importsText: string = `
            import { observable, makeObservable } from "mobx";

            ${this.coreImports.length > 0
                ? `import { ${this.coreImports.map(c => `${c}`).join(", ")} } from "${PROJECTITCORE}";`
                : ``}          

            ${this.modelImports.length > 0
            ? `import { ${this.modelImports.map(c => `${c}`).join(", ")} } from "${relativePath}${LANGUAGE_GEN_FOLDER}";`
            : ``}             
            
            ${this.envImports.length > 0 
                ? `import { ${this.envImports.map(c => `${c}`).join(", ")} } from "${relativePath}${ENVIRONMENT_GEN_FOLDER}/${Names.environment(language)}";`
                : ``}          
            `;
        return importsText + coreText;
    }

    setStandardBooleanKeywords(editorDef: PiEditUnit) {
        // get the standard labels for true and false
        const stdLabels: BoolKeywords = editorDef.getDefaultProjectiongroup().standardBooleanProjection;
        if (!!stdLabels) {
            this.trueKeyword = stdLabels.trueKeyword;
            this.falseKeyword = stdLabels.falseKeyword;
        }
    }

    private findClassifiersWithNormalProjection(language: PiLanguage, group: PiEditProjectionGroup) {
        const nonBinaryClassifiers: PiClassifier[] = language.concepts.filter(c =>
            !(c instanceof PiBinaryExpressionConcept) &&
            !(c instanceof PiLimitedConcept));
        nonBinaryClassifiers.push(...language.units);
        nonBinaryClassifiers.push(...language.interfaces);

        // only for non-default projections group the following can be true: nonBinaryConceptsWithProjection !== nonBinaryClassifiers
        return nonBinaryClassifiers.filter(c => {
            const editor = group.findNonTableProjectionForType(c);
            return !!editor;
        });
    }

    private generateProjectionForClassfier(language: PiLanguage, concept: PiClassifier, projection: PiEditClassifierProjection): string {
        this.addToIfNotPresent(this.modelImports, Names.classifier(concept));
        if (projection instanceof PiEditProjection) {
            const elementVarName = Roles.elementVarName(concept);
            let result = this.generateLines(projection.lines, elementVarName, concept.name, language, 1);
            if (concept instanceof PiExpressionConcept) {
                this.addToIfNotPresent(this.coreImports, "createDefaultExpressionBox");
                return `public ${Names.projectionFunction(concept)} (${elementVarName}: ${Names.concept(concept)}) : Box {
                    return createDefaultExpressionBox( ${elementVarName}, "default-expression-box", [
                            ${result}
                        ],
                        { selectable: false }
                    );
                }`;
            } else {
                return `public ${Names.projectionFunction(concept)} (${elementVarName}: ${Names.classifier(concept)}) : Box {
                    return ${result};
                }`;
            }
        // } else if (projection instanceof PiEditTableProjection) => should not occur. Filtered out of 'allClassifiersWithProjection'
        }
        return '';
    }

    private generateLines(lines: PiEditProjectionLine[], elementVarName: string, boxLabel: string, language: PiLanguage, topIndex: number) {
        let result: string = "";
        // do all lines, separate them with a comma
        lines.forEach((line, index) => {
            result += this.generateLine(line, elementVarName, index, boxLabel, language, topIndex);
            if (index !== lines.length - 1) { // add a comma
                result += ",";
            }
        });
        if (lines.length > 1) { // multi-line projection, so surround with vertical box
            this.addToIfNotPresent(this.coreImports, "BoxFactory");
            result = `BoxFactory.verticalList(${elementVarName}, "${boxLabel}-overall", [
                ${result} 
            ])`;
        }
        if (result === "") {
            result = "null";
        }
        return result;
    }

    private generateLine(line: PiEditProjectionLine, elementVarName: string, index: number, boxLabel: string, language: PiLanguage, topIndex: number): string {
        let result: string = "";
        // TODO empty lines are discarded in the editor now
        if (!line.isEmpty()) {
            // do all projection items in the line, separate them with a comma
            line.items.forEach((item, itemIndex) => {
                result += this.generateItem(item, elementVarName, index, itemIndex, boxLabel, language, topIndex);
                if (itemIndex < line.items.length - 1) {
                    result += ",";
                }
            });
            if (line.items.length > 1) { // surround with horizontal box
                // TODO Too many things are now selectable, but if false, you cannot select e.g. an attribute
                this.addToIfNotPresent(this.coreImports, "BoxFactory");
                result = `BoxFactory.horizontalList(${elementVarName}, "${boxLabel}-hlist-line-${index}", [ ${result} ], { selectable: true } ) `;
            }
            if (line.indent > 0) { // surround with indentBox
                this.addToIfNotPresent(this.coreImports, "BoxUtils");
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
                           language: PiLanguage,
                           topIndex: number): string {
        let result: string = "";
        if (item instanceof PiEditProjectionText) {
            this.addToIfNotPresent(this.coreImports, "BoxUtils");
            result += ` BoxUtils.labelBox(${elementVarName}, "${ParserGenUtil.escapeRelevantChars(item.text.trim())}", "top-${topIndex}-line-${lineIndex}-item-${itemIndex}") `;
        } else if (item instanceof PiOptionalPropertyProjection) {
            result += this.generateOptionalProjection(item, elementVarName, mainBoxLabel, language);
        } else if (item instanceof PiEditPropertyProjection) {
            // Note: this condition must come after PiOptionalPropertyProjection,
            // because PiOptionalPropertyProjection is a sub class of PiEditPropertyProjection
            result += this.generatePropertyProjection(item, elementVarName, mainBoxLabel, language);
        } else if (item instanceof PiEditSuperProjection) {
            result += this.generateSuperProjection(item, elementVarName);
        }
        return result;
    }

    private generateOptionalProjection(optional: PiOptionalPropertyProjection, elementVarName: string, mainBoxLabel: string, language: PiLanguage): string {
        const propertyProjection: PiEditPropertyProjection = optional.findPropertyProjection();
        const optionalPropertyName = (propertyProjection === undefined ? "UNKNOWN" : propertyProjection.property.name);
        const myLabel = `${mainBoxLabel}-optional-${optionalPropertyName}`;

        // reuse the general method to handle lines
        let result = this.generateLines(optional.lines, elementVarName, myLabel, language, 2);

        // surround with optional box
        this.addToIfNotPresent(this.coreImports, "BoxFactory");
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
                let projNameStr: string = '';
                if (!!item.projectionName && item.projectionName.length > 0) {
                    projNameStr = ', "' + item.projectionName + '"';
                }
                if (property.isList) {
                    if (!!item.listInfo && item.listInfo.isTable) {  // if there is information on how to project the property as a table, make it a table
                        result += this.generatePropertyAsTable(item.listInfo.direction, property, elementVarName, language);
                    } else if (!!item.listInfo) { // if there is information on how to project the property as a list, make it a list
                        result += this.generatePartAsList(item, property, elementVarName, projNameStr);
                    }
                } else { // single element
                    this.addToIfNotPresent(this.coreImports, "BoxUtils");
                    result += `BoxUtils.getBoxOrAlias(${elementVarName}, "${property.name}", "${property.type.name}", this.rootProjection ${projNameStr}) `;
                }
            } else { // reference
                if (property.isList) {
                    if (!!item.listInfo&& item.listInfo.isTable) { // if there is information on how to project the property as a table, make it a table
                        // no table projection for references - for now
                        result += this.generateReferenceAsList(language, item.listInfo, property, elementVarName);
                    } else if (!!item.listInfo) { // if there is information on how to project the property as a list, make it a list
                        result += this.generateReferenceAsList(language, item.listInfo, property, elementVarName);
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
        this.addToIfNotPresent(this.coreImports, "TableUtil");
        this.addToIfNotPresent(this.envImports, Names.environment(language));
        // return the projection based on the orientation of the table
        if (orientation === PiEditProjectionDirection.Vertical) {
            return `TableUtil.tableBoxColumnOriented(
                ${elementVarName},
                "${property.name}",
                this.rootProjection.getTableDefinition("${property.type.name}").headers,
                this.rootProjection.getTableDefinition("${property.type.name}").cells,
                ${Names.environment(language)}.getInstance().editor)`;
        } else {
            return `TableUtil.tableBoxRowOriented(
                ${elementVarName},
                "${property.name}",
                this.rootProjection.getTableDefinition("${property.type.name}").headers,
                this.rootProjection.getTableDefinition("${property.type.name}").cells,
                ${Names.environment(language)}.getInstance().editor)`;
        }
    }

    /**
     * generate the part list
     *
     * @param item
     * @param propertyConcept   The property for which the projection is generated.
     * @param elementVarName    The name of the element parameter of the getBox projection method.
     * @param projNameStr
     * @private
     */
    private generatePartAsList(item: PiEditPropertyProjection, propertyConcept: PiConceptProperty, elementVarName: string, projNameStr: string) {
        this.addToIfNotPresent(this.coreImports, "BoxUtils");
        let joinEntry = this.getJoinEntry(item.listInfo);
        if (item.listInfo.direction === PiEditProjectionDirection.Vertical) {
            return `BoxUtils.verticalPartListBox(${elementVarName}, "${propertyConcept.name}", this.rootProjection, ${joinEntry}${projNameStr})`;
        } // else
        return `BoxUtils.horizontalPartListBox(${elementVarName}, "${propertyConcept.name}", this.rootProjection, ${joinEntry}${projNameStr})`;
    }

    private generateReferenceProjection(language: PiLanguage, appliedFeature: PiConceptProperty, element: string) {
        const featureType = Names.classifier(appliedFeature.type);
        this.addToIfNotPresent(this.modelImports, featureType);
        this.addToIfNotPresent(this.modelImports, Names.PiElementReference);
        this.addToIfNotPresent(this.coreImports, "BoxUtils");
        this.addToIfNotPresent(this.envImports, Names.environment(language));
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

    private generateReferenceAsList(language: PiLanguage, listJoin: ListInfo, reference: PiConceptProperty, element: string) {
        this.addToIfNotPresent(this.coreImports, "BoxUtils");
        this.addToIfNotPresent(this.envImports, Names.environment(language));
        let joinEntry = this.getJoinEntry(listJoin);
        if (listJoin.direction === PiEditProjectionDirection.Vertical) {
            return `BoxUtils.verticalReferenceListBox(${element}, "${reference.name}", ${Names.environment(language)}.getInstance().scoper, ${joinEntry})`;
        } // else
        return `BoxUtils.horizontalReferenceListBox(${element}, "${reference.name}", ${Names.environment(language)}.getInstance().scoper, ${joinEntry})`;
    }

    private getJoinEntry(listJoin: ListInfo) {
        let joinEntry: string = `{ text:"${listJoin.joinText}", type:"${listJoin.joinType}" }`;
        if (listJoin.joinType === ListJoinType.NONE || !(listJoin.joinText?.length > 0)) {
            joinEntry = "null";
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
        this.addToIfNotPresent(this.coreImports, "BoxUtils");
        const listAddition: string = `${property.isList ? `, index` : ``}`;
        switch (property.type) {
            case PiPrimitiveType.string:
            case PiPrimitiveType.identifier:
                return `BoxUtils.textBox(${element}, "${property.name}"${listAddition})`;
            case PiPrimitiveType.number:
                return `BoxUtils.numberBox(${element}, "${property.name}"${listAddition})`;
            case PiPrimitiveType.boolean:
                let trueKeyword: string = this.trueKeyword;
                let falseKeyword: string = this.falseKeyword;
                if (!!boolInfo) {
                    // TODO this should probably get a new type of box
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
        this.addToIfNotPresent(this.coreImports, "BoxFactory");
        this.addToIfNotPresent(this.coreImports, "Box");
        return `BoxFactory.${direction}(${element}, "${Roles.property(property)}-hlist",
                            (${element}.${property.name}.map( (item, index)  =>
                                ${this.singlePrimitivePropertyProjection(property, element, boolInfo)}
                            ) as Box[]).concat( [
                                // TODO  Create Action for the role to actually add an element.
                                BoxFactory.alias(${element}, "new-${Roles.property(property)}-hlist", "<+ ${property.name}>")
                            ])
                        )`;
    }

    private generateTableDefinition(language: PiLanguage, c: PiClassifier, myTableProjection: PiEditTableProjection): string {
        // TODO Check whether 999 argument to generateItem()n should be different.
        if (!!myTableProjection) {
            // create the cell getters
            let cellGetters: string = '';
            myTableProjection.cells.forEach((cell, index) => {
                this.addToIfNotPresent(this.modelImports, Names.classifier(c));
                cellGetters += `(cell${index}: ${Names.classifier(c)}): Box => {
                        return ${this.generateItem(cell, `cell${index}`, index, index, c.name + "_table", language, 999)}
                    },\n`;
            });
            this.addToIfNotPresent(this.coreImports, "PiTableDefinition");

            return `${Names.tabelDefinitionFunction(c)}(): PiTableDefinition {
                const result: PiTableDefinition = {
                    headers: [ ${myTableProjection.headers.map(head => `"${head}"`).join(", ")} ],
                    cells: [${cellGetters}]
                };
                return result;
            }
        `;
        } else {
            console.log("INTERNAL PROJECTIT ERROR in generateTableCellFunction");
            return "";
        }
    }

    private addToIfNotPresent(imports: string[], newEntry: string) {
        if (imports.indexOf(newEntry) === -1) {
            imports.push(newEntry);
        }

    }

    private generateSuperProjection(item: PiEditSuperProjection, elementVarName: string) {
        return `this.getBox(${elementVarName}, "${Names.classifier(item.superRef.referred)}")`;
    }
}
