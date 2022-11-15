import {
    BoolKeywords, ListInfo, ListJoinType,
    PiEditClassifierProjection,
    PiEditProjection, PiEditProjectionDirection,
    PiEditProjectionItem,
    PiEditProjectionLine, PiEditProjectionText, PiEditPropertyProjection, PiEditSuperProjection, PiEditTableProjection,
    PiEditUnit, PiOptionalPropertyProjection
} from "../../metalanguage";
import {
    PiBinaryExpressionConcept,
    PiClassifier,
    PiConceptProperty,
    PiExpressionConcept,
    PiLanguage,
    PiPrimitiveProperty, PiPrimitiveType,
    PiProperty
} from "../../../languagedef/metalanguage";
import {
    CONFIGURATION_GEN_FOLDER,
    EDITOR_GEN_FOLDER,
    LANGUAGE_GEN_FOLDER,
    ListUtil,
    LOG2USER,
    Names,
    PROJECTITCORE,
    Roles
} from "../../../utils";
import { ParserGenUtil } from "../../../parsergen/parserTemplates/ParserGenUtil";
import { BoxUtils, NewTableUtil } from "@projectit/core";

export class ProjectionTemplate {
    // The values for the boolean keywords are set on initialization (by a call to 'setStandardBooleanKeywords').
    private trueKeyword: string = "true";
    private falseKeyword: string = "false";
    // The classes, functions, etc. to import are collected during the creation of the content for the generated file,
    // to avoid unused imports. All imports are stored in the following three variables.
    private modelImports: string[] = [];    // imports from ../language/gen
    private coreImports: string[] = [];     // imports from @projectit/core
    private configImports: string[] = [];   // imports from ../config/gen
    // Information about the use of projections from superconcepts or interfaces is also collected during the content
    // creation. This avoids the generation of unused classes and methods.
    private useSuper: boolean = false;  // indicates whether one or more super projection(s) are being usedknownBoxProjections
    private supersUsed: PiClassifier[] = [];  // holds the names of the supers (concepts/interfaces) that are being used
    // To be able to add a projections for showing/hiding brakets to binary expression, this dummy projection is used.
    private static dummyProjection: PiEditProjection = new PiEditProjection();

    setStandardBooleanKeywords(editorDef: PiEditUnit) {
        // get the standard labels for true and false
        const stdLabels: BoolKeywords = editorDef.getDefaultProjectiongroup().standardBooleanProjection;
        if (!!stdLabels) {
            this.trueKeyword = stdLabels.trueKeyword;
            this.falseKeyword = stdLabels.falseKeyword;
        }
    }

    generateBoxProvider(language: PiLanguage, concept: PiClassifier, editDef: PiEditUnit, extraClassifiers: PiClassifier[], relativePath: string): string {
        // init the imports
        ListUtil.addIfNotPresent(this.modelImports, Names.classifier(concept));
        this.coreImports.push(...['Box', 'BoxUtils', 'BoxFactory', 'PiElement', 'FreBoxProvider' +
        '', 'FreProjectionHandler', 'Language']);

        // see which projections there are for this concept
        // myProjections: all non table projections
        // myTableProjections: all table projections
        const myBoxProjections: PiEditClassifierProjection[] = editDef.findProjectionsForType(concept).filter(proj => !(proj instanceof PiEditTableProjection));
        const myTableProjections: PiEditTableProjection[] = editDef.findTableProjectionsForType(concept);
        const allProjections: PiEditClassifierProjection[] = [];
        ListUtil.addListIfNotPresent(allProjections, myBoxProjections);
        ListUtil.addListIfNotPresent(allProjections, myTableProjections);

        // if concept is a binary expression, handle it differently
        let isBinExp: boolean = false;
        let symbol: string = '';
        if (concept instanceof PiBinaryExpressionConcept) {
            isBinExp = true;
            symbol = editDef.getDefaultProjectiongroup().findExtrasForType(concept).symbol;
            this.coreImports.push(...['createDefaultBinaryBox', 'isPiBinaryExpression', Names.PiBinaryExpression]);
            this.configImports.push(Names.environment(language));
            // add the projection to show/hide brackets
            ProjectionTemplate.dummyProjection.name = Names.brackets;
            myBoxProjections.splice(0,0, ProjectionTemplate.dummyProjection);
            // todo the current implementation does not work on non-standard projections, is this a problem?
        }

        // start template
        const coreText: string = `                
                constructor(mainHandler: FreProjectionHandler) {
                    super(mainHandler);
                    this.knownBoxProjections = [${myBoxProjections.length > 0 ? myBoxProjections.map(p => `"${p.name}"`) : `"default"`}];
                    this.knownTableProjections = [${myTableProjections.length > 0 ? myTableProjections.map(p => `"${p.name}"`) : `"default"`}];
                    this.conceptName = '${Names.classifier(concept)}';
                }
            
                set element(element: PiElement) {
                    if (Language.getInstance().metaConformsToType(element, '${Names.classifier(concept)}')) {
                        this._element = element as ${Names.classifier(concept)};
                    } else {
                        console.log('setelement: wrong type (' + element.piLanguageConcept() + ' != ${Names.classifier(concept)})')
                    }
                }
                       
                protected getContent(projectionName: string): Box {
                // console.log("GET CONTENT " + this._element?.piId() + ' ' +  this._element?.piLanguageConcept() + ' ' + projectionName);
                    // see if we need to use a custom projection
                    if (!this.knownBoxProjections.includes(projectionName) && !this.knownTableProjections.includes(projectionName)) {
                        let BOX: Box = this.mainHandler.executeCustomProjection(this._element, projectionName);
                        if (!!BOX) { // found one, so return it
                            return BOX;
                        }      
                    ${allProjections.length > 0 ?
                        `} else { // select the box to return based on the projectionName
                            ${allProjections.map(proj => `if (projectionName === '${proj.name}') {
                                return this.${Names.projectionMethod(proj)}();
                            }`).join(" else ")}   
                            }               
                            // in all other cases, return the default`
                        : `}`
                        }
                    return this.getDefault();
                }
               
                protected getTableHeadersFor(projectionName: string): TableRowBox {
                    // console.log("GET getTableHeadersFor " + projectionName);
                    // see if we need to use a custom projection
                    if (!this.knownBoxProjections.includes(projectionName) && !this.knownTableProjections.includes(projectionName)) {
                        let BOX: TableRowBox = this.mainHandler.getTableHeadersFor(projectionName);
                        if (!!BOX) {
                            // found one, so return it
                            return BOX;
                        }
                    ${myTableProjections.length > 0 ?
                        `} else { // select the box to return based on the projectionName
                            ${myTableProjections.map(proj => `if (projectionName === '${proj.name}') {
                                return this.${Names.tableHeadersMethod(proj)}();
                            }`).join(" else ")}   
                            }               
                            // in all other cases, return the default`
                        : `}`
                    }
                    return null;
                }
            
                ${myTableProjections.length > 0 ?
                    `${myTableProjections.map(proj => 
                        `${this.generateTableProjection(language, concept, proj)}\n
                        ${this.generateHeaderProjection(language, concept, proj)}`
                    ).join("\n\n")}`
                    : ``
                }
        
                ${!isBinExp ?
                    `${myBoxProjections.map(proj => `${this.generateProjectionForClassifier(language, concept, proj)}`).join("\n\n")}`
                : ` /**
                     *  Create a standard binary box to ensure binary expressions can be edited easily
                     */
                    private getDefault(): Box {
                        return createDefaultBinaryBox(
                            this._element as ${Names.PiBinaryExpression}, 
                            "${symbol}", 
                            ${Names.environment(language)}.getInstance().editor, 
                            this.mainHandler
                        );               
                    }
                
                    private getBrackets(): Box {
                        const binBox = this.getDefault(); 
                        if (!!this._element.piOwnerDescriptor().owner &&
                            isPiBinaryExpression(this._element.piOwnerDescriptor().owner)
                        ) {
                            return BoxFactory.horizontalList(this._element, "brackets", [
                                BoxUtils.labelBox(this._element, "(", "bracket-open", true),
                                binBox,
                                BoxUtils.labelBox(this._element, ")", "bracket-close", true)
                            ]);
                        } else {
                            return binBox;
                        }
                    }`
                }`;

        // If 'concept' extends a superconcept or implements interfaces, create the method to produce the box for the superprojection
        // It is added to the generated class, only if it is used, which is indicated by 'this.useSuper'.
        // Note, this should be done after generating 'coreText', because during generation 'this.useSuper' and 'this.supersUsed' are set
        let superMethod: string = '';
        if (this.useSuper && this.supersUsed.length > 0) {
            const elementVarName = `(this._element as ${Names.classifier(concept)})`;
            superMethod = this.createdGetSuperMethod(this.supersUsed, elementVarName);
            ListUtil.addListIfNotPresent(extraClassifiers, this.supersUsed);
        }

        // add the collected imports
        let importsText: string = `
            ${this.coreImports.length > 0
            ? `import { ${this.coreImports.map(c => `${c}`).join(", ")} } from "${PROJECTITCORE}";`
            : ``}         

            ${this.modelImports.length > 0
            ? `import { ${this.modelImports.map(c => `${c}`).join(", ")} } from "${relativePath}${LANGUAGE_GEN_FOLDER}";`
            : ``}        
            
            ${this.configImports.length > 0
            ? this.configImports.map(c => `import { ${c} } from "${relativePath}${CONFIGURATION_GEN_FOLDER}/${c}";`)
            : ``}          
            
            ${this.supersUsed.length > 0
            ? `import { ${this.supersUsed.map(c => `${Names.boxProvider(c)}`).join(", ")} } from "${relativePath}${EDITOR_GEN_FOLDER}";`
            : ``}
            `;

        const classText: string = `
            ${importsText} 
            /**
             * This class implements the box provider for a single node of type ${Names.classifier(concept)}. 
             * The box provider is able to create the (tree of) boxes for the node, based 
             * on the projections that are currently selected by the user.
             * The top of the tree of boxes is always a box of type ElementBox, which is 
             * a box that will never be rendered itself, only its content will. Thus, we 
             * have a stable entry in the complete box tree for every PiElement node.
             */       
            export class ${Names.boxProvider(concept)} extends FreBoxProvider {
                ${coreText}
                ${this.useSuper ? superMethod : ''}       
            }`;

        // reset the imports
        this.modelImports = [];
        this.coreImports = [];
        this.configImports = [];

        // reset the variables for super projections
        this.useSuper = false;
        this.supersUsed = [];

        // return the generated text
        return classText;
    }

    private createdGetSuperMethod(supers: PiClassifier[], elementVarName: string): string {
        ListUtil.addIfNotPresent(this.coreImports, "FreBoxProvider");
        return `
                /**
                 * This method returns the content for one of the superconcepts or interfaces of 'this._element'.
                 * Based on the name of the susperconcept/interface, a tempory BoxProvider is created. This BoxProvider
                 * then returns the result of its 'getContent' method, using 'projectionName' as parameter.
                 *
                 * @param superName         The name of the superconcept or interface for which the projection is requested.
                 * @param projectionName    The name of projection that is requested.
                 * @private
                 */
                private getSuper(superName: string, projectionName?: string): Box {                   
                    let superBoxProvider: FreBoxProvider = null;
                    switch (superName) {
                        ${supers.map(s => `case "${s.name}": {
                            superBoxProvider = new ${Names.boxProvider(s)}(this.mainHandler);
                            break;
                        }`).join("\n")}
                    }
                    if (!!superBoxProvider) {
                        superBoxProvider.element = ${elementVarName};
                        return superBoxProvider.getContent(projectionName);
                    } else {
                        return BoxUtils.labelBox(${elementVarName},
                            "ERROR: '" + superName + "' is not a super concept or interface for element of type '" + ${elementVarName}.piLanguageConcept() + "'",
                            'super-projection-error-box'
                        );
                    }
                }`;
    }

    private generateTableProjection(language: PiLanguage, concept: PiClassifier, projection: PiEditTableProjection) {
        // TODO Check whether 999 argument to generateItem()n should be different.
        if (!!projection) {
            let hasHeaders: boolean = false;
            if (!!projection.headers && projection.headers.length > 0) {
                hasHeaders = true;
            }
            let cellDefs: string[] = [];
            projection.cells.forEach((cell, index) => { // because we need the index, this is done outside the template
                ListUtil.addIfNotPresent(this.modelImports, Names.classifier(concept));
                cellDefs.push(this.generateItem(cell, `(this._element as ${Names.classifier(concept)})`, index, index, concept.name + "_table", language, 999));
            });
            ListUtil.addIfNotPresent(this.coreImports, "TableRowBox");
            ListUtil.addIfNotPresent(this.coreImports, "NewTableUtil");
            return `private ${Names.tableProjectionMethod(projection)}(): TableRowBox {
                        const cells: Box[] = [];
                        ${cellDefs.map(cellDef => `cells.push(${cellDef})`).join(';\n')}
                        return NewTableUtil.rowBox(this._element, this._element.piOwnerDescriptor().propertyName, cells, this._element.piOwnerDescriptor().propertyIndex, ${hasHeaders});
                    }`;
        } else {
            console.log("INTERNAL PROJECTIT ERROR in generateTableCellFunction");
            return "";
        }
    }

    private generateHeaderProjection(language: PiLanguage, concept: PiClassifier, projection: PiEditTableProjection): string {

        if (!!projection) {
            if (!!projection.headers && projection.headers.length > 0) {
                ListUtil.addIfNotPresent(this.coreImports, "NewTableUtil");
                ListUtil.addIfNotPresent(this.coreImports, "BoxUtils");
                // todo this._element is null and propertyName should be set differently
                return `private ${Names.tableHeadersMethod(projection)}(): TableRowBox {
                    return NewTableUtil.rowBox(
                        this._element,
                        this._element.piOwnerDescriptor().propertyName,
                        [ ${projection.headers.map((head, index) => 
                            `BoxUtils.labelBox(this._element, "${head}", "table-header-${index}")`
                        ).join(",\n")}
                        ],
                        0, 
                        true
                    );
                }`;
            } else {
                return `private ${Names.tableHeadersMethod(projection)}(): TableRowBox {
                    return null;
                }`;
            }
        } else {
            console.log("INTERNAL PROJECTIT ERROR in generateTableCellFunction");
            return "";
        }
    }

    private generateProjectionForClassifier(language: PiLanguage, concept: PiClassifier, projection: PiEditClassifierProjection): string {
        ListUtil.addIfNotPresent(this.modelImports, Names.classifier(concept));
        if (projection instanceof PiEditProjection) {
            // const elementVarName = Roles.elementVarName(concept);
            const elementVarName = `(this._element as ${Names.classifier(concept)})`;
            let result = this.generateLines(projection.lines, elementVarName, concept.name, language, 1);
            if (concept instanceof PiExpressionConcept) {
                ListUtil.addIfNotPresent(this.coreImports, "createDefaultExpressionBox");
                return `private ${Names.projectionMethod(projection)} () : Box {
                    return createDefaultExpressionBox( ${elementVarName}, "default-expression-box", [
                            ${result}
                        ],
                        { selectable: false }
                    );
                }`;
            } else {
                return `private ${Names.projectionMethod(projection)} () : Box {
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
            ListUtil.addIfNotPresent(this.coreImports, "BoxFactory");
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
        if (line.isEmpty()) {
            ListUtil.addIfNotPresent(this.coreImports, "BoxUtils");
            result = `BoxUtils.emptyLineBox(${elementVarName}, "${boxLabel}-empty-line-${index}")`;
        } else {
            // do all projection items in the line, separate them with a comma
            line.items.forEach((item, itemIndex) => {
                result += this.generateItem(item, elementVarName, index, itemIndex, boxLabel, language, topIndex);
                if (itemIndex < line.items.length - 1) {
                    result += ",";
                }
            });
            if (line.items.length > 1) { // surround with horizontal box
                // TODO Too many things are now selectable, but if false, you cannot select e.g. an attribute
                ListUtil.addIfNotPresent(this.coreImports, "BoxFactory");
                result = `BoxFactory.horizontalList(${elementVarName}, "${boxLabel}-hlist-line-${index}", [ ${result} ], { selectable: true } ) `;
            }
            if (line.indent > 0) { // surround with indentBox
                ListUtil.addIfNotPresent(this.coreImports, "BoxUtils");
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
            ListUtil.addIfNotPresent(this.coreImports, "BoxUtils");
            result += ` BoxUtils.labelBox(${elementVarName}, "${ParserGenUtil.escapeRelevantChars(item.text.trim())}", "top-${topIndex}-line-${lineIndex}-item-${itemIndex}") `;
        } else if (item instanceof PiOptionalPropertyProjection) {
            result += this.generateOptionalProjection(item, elementVarName, mainBoxLabel, language);
        } else if (item instanceof PiEditPropertyProjection) {
            // Note: this condition must come after PiOptionalPropertyProjection,
            // because PiOptionalPropertyProjection is a subclass of PiEditPropertyProjection
            result += this.generatePropertyProjection(item, elementVarName, mainBoxLabel, language);
        } else if (item instanceof PiEditSuperProjection) {
            result += this.generateSuperProjection(item);
        }
        return result;
    }

    private generateOptionalProjection(optional: PiOptionalPropertyProjection, elementVarName: string, mainBoxLabel: string, language: PiLanguage): string {
        const propertyProjection: PiEditPropertyProjection = optional.findPropertyProjection();
        if (!!propertyProjection) {
            const optionalPropertyName = propertyProjection.property.name;
            const myLabel = `${mainBoxLabel}-optional-${optionalPropertyName}`;

            // reuse the general method to handle lines
            let result = this.generateLines(optional.lines, elementVarName, myLabel, language, 2);

            // surround with optional box, and add "BoxFactory" to imports
            ListUtil.addIfNotPresent(this.coreImports, "BoxFactory");
            result = `BoxFactory.optional(${elementVarName}, "optional-${optionalPropertyName}", () => (!!${elementVarName}.${optionalPropertyName}),
                ${result},
                false, "<+>"
            )`
            return result;
        } else {
            LOG2USER.error("INTERNAL ERROR: no property found in optional projection.");
        }
        return "";
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
                    if (!!item.listInfo && item.listInfo.isTable) {  // if there is information on how to project the property as a table, make it a table
                        result += this.generatePropertyAsTable(item.listInfo.direction, property, elementVarName, language);
                    } else if (!!item.listInfo) { // if there is information on how to project the property as a list, make it a list
                        result += this.generatePartAsList(item, property, elementVarName, language);
                    }
                } else { // single element
                    ListUtil.addIfNotPresent(this.coreImports, "BoxUtils");
                    result += `BoxUtils.getBoxOrAlias(${elementVarName}, "${property.name}", "${property.type.name}", this.mainHandler) `;
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
        ListUtil.addIfNotPresent(this.coreImports, "NewTableUtil");
        ListUtil.addIfNotPresent(this.configImports, Names.environment(language));
        // return the projection based on the orientation of the table
        if (orientation === PiEditProjectionDirection.Vertical) {
            return `NewTableUtil.tableBoxColumnOriented(
                ${elementVarName},
                ${elementVarName}.${property.name},
                "${property.name}",
                this.mainHandler,
                ${Names.environment(language)}.getInstance().editor)`;
        } else {
            return `NewTableUtil.tableBoxRowOriented(
                ${elementVarName},
                ${elementVarName}.${property.name},
                "${property.name}",
                this.mainHandler,
                ${Names.environment(language)}.getInstance().editor)`;
        }
    }

    /**
     * generate the part list
     *
     * @param item
     * @param propertyConcept   The property for which the projection is generated.
     * @param elementVarName    The name of the element parameter of the getBox projection method.
     * @param language
     * @private
     */
    private generatePartAsList(item: PiEditPropertyProjection, propertyConcept: PiConceptProperty, elementVarName: string, language: PiLanguage) {
        ListUtil.addIfNotPresent(this.coreImports, "BoxUtils");
        let joinEntry = this.getJoinEntry(item.listInfo);
        if (item.listInfo.direction === PiEditProjectionDirection.Vertical) {
            return `BoxUtils.verticalPartListBox(${elementVarName}, ${elementVarName}.${item.property.name}, "${propertyConcept.name}", ${joinEntry}, this.mainHandler)`;
        } // else
        return `BoxUtils.horizontalPartListBox(${elementVarName}, ${elementVarName}.${item.property.name}, "${propertyConcept.name}", ${joinEntry}, this.mainHandler)`;
    }

    private generateReferenceProjection(language: PiLanguage, appliedFeature: PiConceptProperty, element: string) {
        const featureType = Names.classifier(appliedFeature.type);
        ListUtil.addIfNotPresent(this.modelImports, featureType);
        ListUtil.addIfNotPresent(this.configImports, Names.environment(language));
        ListUtil.addIfNotPresent(this.coreImports, Names.PiElementReference);
        ListUtil.addIfNotPresent(this.coreImports, "BoxUtils");
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
        ListUtil.addIfNotPresent(this.coreImports, "BoxUtils");
        ListUtil.addIfNotPresent(this.configImports, Names.environment(language));
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
        ListUtil.addIfNotPresent(this.coreImports, "BoxUtils");
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
        ListUtil.addIfNotPresent(this.coreImports, "BoxFactory");
        ListUtil.addIfNotPresent(this.coreImports, "Box");
        // TODO Create Action for the role to actually add an element.
        return `BoxFactory.${direction}(${element}, "${Roles.property(property)}-hlist",
                            (${element}.${property.name}.map( (item, index)  =>
                                ${this.singlePrimitivePropertyProjection(property, element, boolInfo)}
                            ) as Box[]).concat( [
                                BoxFactory.alias(${element}, "new-${Roles.property(property)}-hlist", "<+ ${property.name}>")
                            ])
                        )`;
    }

    // private generateTableDefinition(language: PiLanguage, c: PiClassifier, myTableProjection: PiEditTableProjection): string {
    //     // TODO Check whether 999 argument to generateItem()n should be different.
    //     if (!!myTableProjection) {
    //         // create the cell getters
    //         let cellGetters: string = '';
    //         myTableProjection.cells.forEach((cell, index) => {
    //             ListUtil.addIfNotPresent(this.modelImports, Names.classifier(c));
    //             cellGetters += `(cell${index}: ${Names.classifier(c)}): Box => {
    //                     return ${this.generateItem(cell, `cell${index}`, index, index, c.name + "_table", language, 999)}
    //                 },\n`;
    //         });
    //
    //         return `
    //         private ${Names.tabelDefinitionFunctionNew(myTableProjection.name)}(): PiTableDefinition {
    //             return {
    //                 headers: [ ${myTableProjection.headers.map(head => `"${head}"`).join(", ")} ],
    //                 cells: [${cellGetters}]
    //             };
    //         }
    //     `;
    //     } else {
    //         console.log("INTERNAL PROJECTIT ERROR in generateTableCellFunction");
    //         return "";
    //     }
    // }

    private generateSuperProjection(item: PiEditSuperProjection) {
        const myClassifier: PiClassifier = item.superRef.referred; // to avoid the lookup by '.referred' to happen more than once
        // indicate that the super method must be added and remember that a box provider for the super concept/interface must be created
        this.useSuper = true;
        ListUtil.addIfNotPresent(this.supersUsed, myClassifier);
        // return the call to the extra method
        if (item.projectionName !== null && item.projectionName !== undefined && item.projectionName.length > 0) {
            // a specific projectName is requested, use it as parameter to the 'getSuper' method
            return `this.getSuper("${Names.classifier(myClassifier)}", "${item.projectionName}")`;
        } else {
            return `this.getSuper("${Names.classifier(myClassifier)}")`;
        }
    }

}
