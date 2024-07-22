import {
    ListInfo,
    ListJoinType,
    FreEditClassifierProjection,
    FreEditProjection,
    FreEditProjectionDirection,
    FreEditProjectionItem,
    FreEditProjectionLine,
    FreEditProjectionText,
    FreEditPropertyProjection,
    FreEditSuperProjection,
    FreEditTableProjection,
    FreEditUnit,
    FreOptionalPropertyProjection,
    ExtraClassifierInfo, BoolKeywords, FreEditProjectionGroup, ForType, FreEditStandardProjection
} from "../../metalanguage";
import {
    FreMetaBinaryExpressionConcept,
    FreMetaClassifier,
    FreMetaConceptProperty,
    FreMetaExpressionConcept,
    FreMetaLanguage,
    FreMetaPrimitiveProperty, FreMetaPrimitiveType,
    FreMetaProperty
} from "../../../languagedef/metalanguage";
import {
    CONFIGURATION_GEN_FOLDER,
    EDITOR_GEN_FOLDER,
    LANGUAGE_GEN_FOLDER,
    ListUtil,
    LOG2USER,
    Names,
    FREON_CORE,
    Roles
} from "../../../utils";
import { ParserGenUtil } from "../../../parsergen/parserTemplates/ParserGenUtil";

export class ProjectionTemplate {
    // To be able to add a projections for showing/hiding brakets to binary expression, this dummy projection is used.
    private static dummyProjection: FreEditProjection = new FreEditProjection();
    // The values for the boolean keywords are set on initialization (by a call to 'setStandardBooleanKeywords').
    private trueKeyword: string = "true";
    private falseKeyword: string = "false";
    private stdBoolDisplayType: string = "text";
    // The classes, functions, etc. to import are collected during the creation of the content for the generated file,
    // to avoid unused imports. All imports are stored in the following three variables.
    private modelImports: string[] = [];    // imports from ../language/gen
    private coreImports: string[] = [];     // imports from @freon4dsl/core
    private configImports: string[] = [];   // imports from ../config/gen
    // Information about the use of projections from superconcepts or interfaces is also collected during the content
    // creation. This avoids the generation of unused classes and methods.
    private useSuper: boolean = false;  // indicates whether one or more super projection(s) are being used
    private supersUsed: FreMetaClassifier[] = [];  // holds the names of the supers (concepts/interfaces) that are being used

    setStandardBooleanKeywords(editorDef: FreEditUnit) {
        // get the standard labels for true and false, and the standard display type (checkbox, radio, text, etc.) for boolean values
        const defProjGroup: FreEditProjectionGroup | undefined = editorDef.getDefaultProjectiongroup();
        if (!!defProjGroup) {
            const standardBoolProj: FreEditStandardProjection | undefined = defProjGroup.findStandardProjFor(ForType.Boolean);
            const stdLabels: BoolKeywords | undefined = standardBoolProj?.keywords;
            if (!!stdLabels) {
                this.trueKeyword = stdLabels.trueKeyword;
                this.falseKeyword = stdLabels.falseKeyword ? stdLabels.falseKeyword : "false";
            }
            const displayType: string | undefined = standardBoolProj?.displayType;
            if (!!displayType) {
                this.stdBoolDisplayType = displayType;
            }
        }
    }

    generateBoxProvider(language: FreMetaLanguage, concept: FreMetaClassifier, editDef: FreEditUnit, extraClassifiers: FreMetaClassifier[], relativePath: string): string {
        // init the imports
        ListUtil.addIfNotPresent(this.modelImports, Names.classifier(concept));
        this.coreImports.push(...["Box", "BoxUtil", "BoxFactory", Names.FreNode, "FreBoxProvider", "FreProjectionHandler", Names.FreLanguage]);

        // see which projections there are for this concept
        // myProjections: all non table projections
        // myTableProjections: all table projections
        const myBoxProjections: FreEditClassifierProjection[] = editDef.findProjectionsForType(concept)
            .filter(proj => !(proj instanceof FreEditTableProjection));
        const myTableProjections: FreEditTableProjection[] = editDef.findTableProjectionsForType(concept);
        const allProjections: FreEditClassifierProjection[] = [];
        ListUtil.addListIfNotPresent(allProjections, myBoxProjections);
        ListUtil.addListIfNotPresent(allProjections, myTableProjections);

        // if concept is a binary expression, handle it differently
        let isBinExp: boolean = false;
        let symbol: string = "";
        if (concept instanceof FreMetaBinaryExpressionConcept) {
            isBinExp = true;
            const extras: ExtraClassifierInfo | undefined = editDef.getDefaultProjectiongroup()?.findExtrasForType(concept);
            if (!!extras) {
                symbol = extras.symbol;
            }
            this.coreImports.push(...["createDefaultBinaryBox", "isFreBinaryExpression", Names.FreBinaryExpression]);
            this.configImports.push(Names.environment(language));
            // add the projection to show/hide brackets
            ProjectionTemplate.dummyProjection.name = Names.brackets;
            myBoxProjections.splice(0, 0, ProjectionTemplate.dummyProjection);
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

                protected getContent(projectionName: string): Box {
                // console.log("GET CONTENT " + this._element?.freId() + ' ' +  this._element?.freLanguageConcept() + ' ' + projectionName);
                    // see if we need to use a custom projection
                    if (!this.knownBoxProjections.includes(projectionName) && !this.knownTableProjections.includes(projectionName)) {
                        const BOX: Box = this.mainHandler.executeCustomProjection(this._element, projectionName);
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

                ${myTableProjections.length > 0 ?
                    `${myTableProjections.map(proj =>
                        `${this.generateTableProjection(language, concept, proj)}`
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
                            this._element as ${Names.FreBinaryExpression},
                            "${symbol}",
                            ${Names.environment(language)}.getInstance().editor,
                            this.mainHandler
                        );
                    }

                    private getBrackets(): Box {
                        const binBox = this.getDefault();
                        if (!!this._element.freOwnerDescriptor().owner &&
                            isFreBinaryExpression(this._element.freOwnerDescriptor().owner)
                        ) {
                            return BoxFactory.horizontalLayout(this._element, "brackets", '', [
                                BoxUtil.labelBox(this._element, "(", "bracket-open", true),
                                binBox,
                                BoxUtil.labelBox(this._element, ")", "bracket-close", true)
                            ]);
                        } else {
                            return binBox;
                        }
                    }`
                }`;

        // If 'concept' extends a superconcept or implements interfaces, create the method to produce the box for the superprojection
        // It is added to the generated class, only if it is used, which is indicated by 'this.useSuper'.
        // Note, this should be done after generating 'coreText', because during generation 'this.useSuper' and 'this.supersUsed' are set
        let superMethod: string = "";
        if (this.useSuper && this.supersUsed.length > 0) {
            const elementVarName = `(this._element as ${Names.classifier(concept)})`;
            superMethod = this.createdGetSuperMethod(this.supersUsed, elementVarName);
            ListUtil.addListIfNotPresent(extraClassifiers, this.supersUsed);
        }

        // add the collected imports
        const importsText: string = `
            ${this.coreImports.length > 0
            ? `import { ${this.coreImports.map(c => `${c}`).join(", ")} } from "${FREON_CORE}";`
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
             * have a stable entry in the complete box tree for every ${Names.FreNode} node.
             */
            export class ${Names.boxProvider(concept)} extends FreBoxProvider {
                ${coreText}
                ${this.useSuper ? superMethod : ""}
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

    private createdGetSuperMethod(supers: FreMetaClassifier[], elementVarName: string): string {
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
                        return superBoxProvider.getContentForSuper(projectionName);
                    } else {
                        return BoxUtil.labelBox(${elementVarName},
                            "ERROR: '" + superName + "' is not a super concept or interface for element of type '" + ${elementVarName}.freLanguageConcept() + "'",
                            'super-projection-error-box'
                        );
                    }
                }`;
    }

    private generateTableProjection(language: FreMetaLanguage, concept: FreMetaClassifier, projection: FreEditTableProjection) {
        // TODO Check whether 999 argument to generateItem()n should be different.
        if (!!projection) {
            let hasHeaders: boolean = false;
            if (!!projection.headers && projection.headers.length > 0) {
                hasHeaders = true;
            }
            const cellDefs: string[] = [];
            projection.cells.forEach((cell, index) => { // because we need the index, this is done outside the template
                ListUtil.addIfNotPresent(this.modelImports, Names.classifier(concept));
                cellDefs.push(this.generateItem(cell, `(this._element as ${Names.classifier(concept)})`, index, index, concept.name + "_table", language, 999));
            });
            ListUtil.addIfNotPresent(this.coreImports, "TableRowBox");
            ListUtil.addIfNotPresent(this.coreImports, "TableUtil");
            return `private ${Names.tableProjectionMethod(projection)}(): TableRowBox {
                        const cells: Box[] = [];
                        ${cellDefs.map(cellDef => `cells.push(${cellDef})`).join(";\n")}
                        return TableUtil.rowBox(this._element, this._element.freOwnerDescriptor().propertyName, "${Names.classifier(concept)}", cells, this._element.freOwnerDescriptor().propertyIndex, ${hasHeaders});
                    }`;
        } else {
            console.log("INTERNAL FREON ERROR in generateTableCellFunction");
            return "";
        }
    }

    private generateProjectionForClassifier(language: FreMetaLanguage, concept: FreMetaClassifier, projection: FreEditClassifierProjection): string {
        ListUtil.addIfNotPresent(this.modelImports, Names.classifier(concept));
        if (projection instanceof FreEditProjection) {
            // const elementVarName = Roles.elementVarName(concept);
            const elementVarName = `(this._element as ${Names.classifier(concept)})`;
            const result = this.generateLines(projection.lines, elementVarName, concept.name, language, 1);
            if (concept instanceof FreMetaExpressionConcept) {
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
            // } else if (projection instanceof FreEditTableProjection) => should not occur. Filtered out of 'allClassifiersWithProjection'
        }
        return "";
    }

    private generateLines(lines: FreEditProjectionLine[], elementVarName: string, boxLabel: string, language: FreMetaLanguage, topIndex: number) {
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
            result = `BoxFactory.verticalLayout(${elementVarName}, "${boxLabel}-overall", '', [
                ${result}
            ])`;
        }
        if (result === "") {
            result = "null";
        }
        return result;
    }

    private generateLine(
                        line: FreEditProjectionLine,
                        elementVarName: string,
                        index: number,
                        boxLabel: string,
                        language: FreMetaLanguage,
                        topIndex: number): string {
        let result: string = "";
        if (line.isEmpty()) {
            ListUtil.addIfNotPresent(this.coreImports, "BoxUtil");
            result = `BoxUtil.emptyLineBox(${elementVarName}, "${boxLabel}-empty-line-${index}")`;
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
                result = `BoxFactory.horizontalLayout(${elementVarName}, "${boxLabel}-hlist-line-${index}", '', [ ${result} ], { selectable: false } ) `;
            }
            if (line.indent > 0) { // surround with indentBox
                ListUtil.addIfNotPresent(this.coreImports, "BoxUtil");
                result = `BoxUtil.indentBox(${elementVarName}, ${line.indent}, "${index}", ${result} )`;
            }
        }
        return result;
    }

    private generateItem(item: FreEditProjectionItem,
                         elementVarName: string,
                         lineIndex: number,
                         itemIndex: number,
                         mainBoxLabel: string,
                         language: FreMetaLanguage,
                         topIndex: number): string {
        let result: string = "";
        if (item instanceof FreEditProjectionText) {
            ListUtil.addIfNotPresent(this.coreImports, "BoxUtil");
            result += ` BoxUtil.labelBox(${elementVarName}, "${ParserGenUtil.escapeRelevantChars(item.text.trim())}", "top-${topIndex}-line-${lineIndex}-item-${itemIndex}") `;
        } else if (item instanceof FreOptionalPropertyProjection) {
            result += this.generateOptionalProjection(item, elementVarName, mainBoxLabel, language);
        } else if (item instanceof FreEditPropertyProjection) {
            // Note: this condition must come after FreOptionalPropertyProjection,
            // because FreOptionalPropertyProjection is a subclass of FreEditPropertyProjection
            result += this.generatePropertyProjection(item, elementVarName, language);
        } else if (item instanceof FreEditSuperProjection) {
            result += this.generateSuperProjection(item);
        }
        return result;
    }

    private generateOptionalProjection(optional: FreOptionalPropertyProjection, elementVarName: string, mainBoxLabel: string, language: FreMetaLanguage): string {
        const propertyProjection: FreEditPropertyProjection | undefined = optional.findPropertyProjection();
        const property: FreMetaProperty | undefined = optional.property?.referred;
        if (!!propertyProjection && !!property && !!propertyProjection.property) {
            const optionalPropertyName = propertyProjection.property.name;
            const myLabel = `${mainBoxLabel}-optional-${optionalPropertyName}`;

            // reuse the general method to handle lines
            let result = this.generateLines(optional.lines, elementVarName, myLabel, language, 2);

            // surround with optional box, and add "BoxFactory" to imports
            ListUtil.addIfNotPresent(this.coreImports, "BoxFactory");
            const condition = property.isList   ? `() => (!!${elementVarName}.${optionalPropertyName}) && (${elementVarName}.${optionalPropertyName}).length !== 0`
                                                : `() => (!!${elementVarName}.${optionalPropertyName})`
            result = `BoxFactory.optional2(${elementVarName}, "optional-${optionalPropertyName}", ${condition},
                ${result},
                false, 
                ${this.generatePropertyProjection(propertyProjection, elementVarName, language)}
            )`;
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
     * @param language
     * @private
     */
    private generatePropertyProjection(item: FreEditPropertyProjection, elementVarName: string, language: FreMetaLanguage) {
        let result: string = "";
        const property: FreMetaProperty | undefined = item.property?.referred;
        if (property === null || property === undefined) {
            return '';
        }
        if (property instanceof FreMetaPrimitiveProperty) {
            result += this.primitivePropertyProjection(property, elementVarName, item.displayType, item.boolKeywords, item.listInfo);
        } else if (property instanceof FreMetaConceptProperty) {
            if (property.isPart) {
                if (property.isList) {
                    if (!!item.listInfo && item.listInfo.isTable) {  // if there is information on how to project the property as a table, make it a table
                        result += this.generatePropertyAsTable(item.listInfo.direction, property, elementVarName, language);
                    } else if (!!item.listInfo) { // if there is information on how to project the property as a list, make it a list
                        result += this.generatePartAsList(item, property, elementVarName);
                    }
                } else { // single element
                    ListUtil.addIfNotPresent(this.coreImports, "BoxUtil");
                    result += `BoxUtil.getBoxOrAction(${elementVarName}, "${property.name}", "${property.type.name}", this.mainHandler) `;
                }
            } else { // reference
                if (property.isList) {
                    if (!!item.listInfo && item.listInfo.isTable) { // if there is information on how to project the property as a table, make it a table
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
    private generatePropertyAsTable(orientation: FreEditProjectionDirection,
                                    property: FreMetaConceptProperty,
                                    elementVarName: string,
                                    language: FreMetaLanguage): string {
        ListUtil.addIfNotPresent(this.coreImports, "TableUtil");
        ListUtil.addIfNotPresent(this.configImports, Names.environment(language));
        // return the projection based on the orientation of the table
        if (orientation === FreEditProjectionDirection.Vertical) {
            return `TableUtil.tableBoxColumnOriented(
                ${elementVarName},
                ${elementVarName}.${property.name},
                "${property.name}",
                this.mainHandler)`;
        } else {
            return `TableUtil.tableBoxRowOriented(
                ${elementVarName},
                ${elementVarName}.${property.name},
                "${property.name}",
                this.mainHandler)`;
        }
    }

    /**
     * generate the part list
     *
     * @param item
     * @param propertyConcept   The property for which the projection is generated.
     * @param elementVarName    The name of the element parameter of the getBox projection method.
     * @private
     */
    private generatePartAsList(item: FreEditPropertyProjection, propertyConcept: FreMetaConceptProperty, elementVarName: string): string {
        if (!!item.listInfo && !!item.property) {
            ListUtil.addIfNotPresent(this.coreImports, "BoxUtil");
            const joinEntry = this.getJoinEntry(item.listInfo);
            if (item.listInfo.direction === FreEditProjectionDirection.Vertical) {
                return `BoxUtil.verticalPartListBox(${elementVarName}, ${elementVarName}.${item.property.name}, "${propertyConcept.name}", ${joinEntry}, this.mainHandler)`;
            } // else
            return `BoxUtil.horizontalPartListBox(${elementVarName}, ${elementVarName}.${item.property.name}, "${propertyConcept.name}", ${joinEntry}, this.mainHandler)`;
        } else {
            return '';
        }
    }

    private generateReferenceProjection(language: FreMetaLanguage, appliedFeature: FreMetaConceptProperty, element: string) {
        const featureType = Names.classifier(appliedFeature.type);
        ListUtil.addIfNotPresent(this.modelImports, featureType);
        ListUtil.addIfNotPresent(this.configImports, Names.environment(language));
        ListUtil.addIfNotPresent(this.coreImports, Names.FreNodeReference);
        ListUtil.addIfNotPresent(this.coreImports, "BoxUtil");
        return `BoxUtil.referenceBox(
                                ${element},
                                "${appliedFeature.name}",
                                (selected: string) => {
                                    ${element}.${appliedFeature.name} = ${Names.FreNodeReference}.create<${featureType}>(
                                       ${Names.environment(language)}.getInstance().scoper.getFromVisibleElements(
                                            ${element},
                                            selected,
                                            "${featureType}"
                                       ) as ${featureType}, "${featureType}");
                                },
                                ${Names.environment(language)}.getInstance().scoper
               )`;
    }

    private generateReferenceAsList(language: FreMetaLanguage, listJoin: ListInfo, reference: FreMetaConceptProperty, element: string) {
        ListUtil.addIfNotPresent(this.coreImports, "BoxUtil");
        ListUtil.addIfNotPresent(this.configImports, Names.environment(language));
        const joinEntry = this.getJoinEntry(listJoin);
        if (listJoin.direction === FreEditProjectionDirection.Vertical) {
            return `BoxUtil.verticalReferenceListBox(${element}, "${reference.name}", ${Names.environment(language)}.getInstance().scoper, ${joinEntry})`;
        } // else
        return `BoxUtil.horizontalReferenceListBox(${element}, "${reference.name}", ${Names.environment(language)}.getInstance().scoper, ${joinEntry})`;
    }

    private getJoinEntry(listJoin: ListInfo) {
        let joinEntry: string = `{ text:"${listJoin.joinText}", type:"${listJoin.joinType}" }`;
        if (listJoin.joinType === ListJoinType.NONE || !(listJoin.joinText?.length > 0)) {
            joinEntry = "null";
        }
        return joinEntry;
    }

    private primitivePropertyProjection(property: FreMetaPrimitiveProperty, element: string, boolDisplayType?: string, boolInfo?: BoolKeywords, listInfo?: ListInfo): string {
        if (property.isList) {
            return this.listPrimitivePropertyProjection(property, element, boolDisplayType, boolInfo, listInfo);
        } else {
            return this.singlePrimitivePropertyProjection(property, element, boolDisplayType, boolInfo);
        }
    }

    private singlePrimitivePropertyProjection(property: FreMetaPrimitiveProperty, element: string, boolDisplayType?: string, boolInfo?: BoolKeywords): string {
        ListUtil.addIfNotPresent(this.coreImports, "BoxUtil");
        const listAddition: string = `${property.isList ? `, index` : ``}`;
        switch (property.type) {
            case FreMetaPrimitiveType.string:
            case FreMetaPrimitiveType.identifier:
                return `BoxUtil.textBox(${element}, "${property.name}"${listAddition})`;
            case FreMetaPrimitiveType.number:
                ListUtil.addIfNotPresent(this.coreImports, "NumberDisplay");
                return `BoxUtil.numberBox(${element}, "${property.name}"${listAddition}, NumberDisplay.SELECT)`;
            case FreMetaPrimitiveType.boolean:
                let trueKeyword: string = this.trueKeyword;
                let falseKeyword: string = this.falseKeyword;
                let displayType: string = '';
                displayType = this.getDisplayTypeFrom(this.stdBoolDisplayType);
                if (!!boolInfo) {
                    trueKeyword = boolInfo.trueKeyword;
                    falseKeyword = boolInfo.falseKeyword ? boolInfo.falseKeyword : "undefined";
                    displayType = this.getDisplayTypeFrom(boolDisplayType);
                }
                ListUtil.addIfNotPresent(this.coreImports, "BoolDisplay");
                return `BoxUtil.booleanBox(${element}, "${property.name}", {yes:"${trueKeyword}", no:"${falseKeyword}"}${listAddition}, ${displayType})`;
            default:
                return `BoxUtil.textBox(${element}, "${property.name}"${listAddition})`;
        }
    }

    private getDisplayTypeFrom(inType: string | undefined): string {
        let result: string;
        switch (inType) {
            // "text" / "checkbox" / "radio" / "switch" / "inner-switch"
            case "text":
                result = "BoolDisplay.SELECT";
                break;
            case "checkbox":
                result = "BoolDisplay.CHECKBOX";
                break;
            case "radio":
                result = "BoolDisplay.RADIO_BUTTON";
                break;
            case "switch":
                result = "BoolDisplay.SWITCH";
                break;
            case "inner-switch":
                result = "BoolDisplay.INNER_SWITCH";
                break;
            default:
                result = "BoolDisplay.SELECT";
        }
        return result;
    }

    private listPrimitivePropertyProjection(property: FreMetaPrimitiveProperty, element: string, boolDisplayType?: string, boolInfo?: BoolKeywords, listInfo?: ListInfo): string {
        let direction: string = "verticalList";
        if (!!listInfo && listInfo.direction === FreEditProjectionDirection.Horizontal) {
            direction = "horizontalList";
        }
        // TODO also adjust role '..-hlist' to '..-vlist'?
        ListUtil.addIfNotPresent(this.coreImports, "BoxFactory");
        ListUtil.addIfNotPresent(this.coreImports, "Box");
        // TODO Create Action for the role to actually add an element.
        return `BoxFactory.${direction}(${element}, "${Roles.property(property)}-hlist", "",
                            (${element}.${property.name}.map( (item, index)  =>
                                ${this.singlePrimitivePropertyProjection(property, element, boolDisplayType, boolInfo)}
                            ) as Box[]).concat( [
                                BoxFactory.action(${element}, "new-${Roles.property(property)}-hlist", "<+ ${property.name}>")
                            ])
                        )`;
    }

    private generateSuperProjection(item: FreEditSuperProjection) {
        const myClassifier: FreMetaClassifier | undefined = item.superRef?.referred; // to avoid the lookup by '.referred' to happen more than once
        if (myClassifier === undefined || myClassifier === null) {
            return '';
        }
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
