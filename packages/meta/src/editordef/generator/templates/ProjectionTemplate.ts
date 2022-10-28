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

export class ProjectionTemplate {
    // The values for the boolean keywords are set on initialization (by a call to 'setStandardBooleanKeywords').
    private trueKeyword: string = "true";
    private falseKeyword: string = "false";
    // The classes, functions, etc. to import are collected during the creation of the content for the generated file,
    // to avoid unused imports. All imports are stored in the following two variables, one for the imports that
    // come from '@projectit/core', and one for the import that come from other parts of the generated code.
    private modelImports: string[] = [];
    private coreImports: string[] = [];
    private configImports: string[] = [];
    // Information about the use of projections from superconcepts or interfaces is also collected during the content
    // creation. This avoids the generation of unused classes and methods.
    private useSuper: boolean = false;  // indicates whether one or more super projection(s) are being used
    private supersUsed: PiClassifier[] = [];  // holds the names of the supers (concepts/interfaces) that are being used



    setStandardBooleanKeywords(editorDef: PiEditUnit) {
        // get the standard labels for true and false
        const stdLabels: BoolKeywords = editorDef.getDefaultProjectiongroup().standardBooleanProjection;
        if (!!stdLabels) {
            this.trueKeyword = stdLabels.trueKeyword;
            this.falseKeyword = stdLabels.falseKeyword;
        }
    }

    // generateBoxProviderCache(language: PiLanguage, editDef: PiEditUnit, relativePath: string): string {
    //     // get the imports
    //     let imports: string[] = [];
    //     language.concepts.forEach(concept => {
    //         if (!(concept instanceof PiLimitedConcept) && !concept.isAbstract) {
    //             imports.push(`import { ${Names.boxProvider(concept)}  } from "./${Names.boxProvider(concept)}";`);
    //         }
    //     });
    //     language.units.forEach(unit => {
    //         imports.push(`import { ${Names.boxProvider(unit)}  } from "./${Names.boxProvider(unit)}";`);
    //     });
    //
    //     // get all the constructors
    //     let constructors: string[] = [];
    //     language.concepts.forEach(concept => {
    //         if (!(concept instanceof PiLimitedConcept) && !concept.isAbstract) {
    //             constructors.push(`["${Names.concept(concept)}", () => {
    //                     return new ${Names.boxProvider(concept)}()
    //                 }]`);
    //         }
    //     });
    //     language.units.forEach(unit => {
    //         constructors.push(`["${Names.classifier(unit)}", () => {
    //                     return new ${Names.boxProvider(unit)}()
    //                 }]`);
    //     });
    //
    //     // todo add methods for the projections names
    //
    //     // template starts here
    //     return '';
    //     // return `
    //     // import { isNullOrUndefined, PiBoxProvider, PiBoxProviderCache, PiElement, PiTableDefinition } from "@projectit/core";
    //     // ${imports.map(imp => imp).join("\n")}
    //     //
    //     // export class ${Names.boxProviderCache(language)} implements PiBoxProviderCache {
    //     //     private static theInstance: ${Names.boxProviderCache(language)} = null; // the only instance of this class
    //     //
    //     //     /**
    //     //      * This method implements the singleton pattern
    //     //      */
    //     //     public static getInstance(): ${Names.boxProviderCache(language)} {
    //     //         if (this.theInstance === undefined || this.theInstance === null) {
    //     //             this.theInstance = new ${Names.boxProviderCache(language)}();
    //     //         }
    //     //         return this.theInstance;
    //     //     }
    //     //
    //     //     /**
    //     //      * A private constructor, as demanded by the singleton pattern.
    //     //      */
    //     //     private constructor() {
    //     //     }
    //     //
    //     //     private elementToProvider: Map<string, PiBoxProvider> = new Map<string, PiBoxProvider>();
    //     //     private conceptNameToProviderConstructor: Map<string, () => PiBoxProvider> = new Map<string, () => PiBoxProvider>(
    //     //         [
    //     //             ${constructors.map(constr => constr).join(",\n")}
    //     //         ]);
    //     //
    //     //     addBoxProvider(elementId: string, provider: PiBoxProvider) {
    //     //         this.elementToProvider.set(elementId, provider);
    //     //     }
    //     //
    //     //     getBoxProvider(element: PiElement): PiBoxProvider {
    //     //         if (isNullOrUndefined(element)) {
    //     //             throw Error('${Names.boxProviderCache(language)}.getBoxProvider: element is null/undefined');
    //     //         }
    //     //
    //     //         // return if present, else create a new provider based on the language concept
    //     //         let boxProvider = this.elementToProvider.get(element.piId());
    //     //         if (isNullOrUndefined(boxProvider)) {
    //     //             boxProvider = this.conceptNameToProviderConstructor.get(element.piLanguageConcept())();
    //     //             this.elementToProvider.set(element.piId(), boxProvider);
    //     //             boxProvider.element = element;
    //     //         }
    //     //         return boxProvider;
    //     //     }
    //     //
    //     //     getProjectionNames(): string[] {
    //     //         return ['default'];
    //     //     }
    //     //
    //     //     getConstructor(conceptName: string): () => PiBoxProvider {
    //     //         return this.conceptNameToProviderConstructor.get(conceptName);
    //     //     }
    //     //
    //     //     getTableDefinition(conceptName: string): PiTableDefinition {
    //     //         let boxProvider: PiBoxProvider = this.conceptNameToProviderConstructor.get(conceptName)();
    //     //         const result = boxProvider.getTableDefinition();
    //     //         if (result !== null) {
    //     //             return result;
    //     //         }
    //     //         // return a default box if nothing has been found.
    //     //         return {
    //     //             headers: [conceptName],
    //     //             cells: [(element: PiElement) => {
    //     //                 return this.getBoxProvider(element).box;
    //     //             }]
    //     //         };
    //     //     }
    //     // }`;
    // }

    generateBoxProvider(language: PiLanguage, concept: PiClassifier, editDef: PiEditUnit, extraClassifiers: PiClassifier[], relativePath: string): string {
        // init the imports
        ListUtil.addIfNotPresent(this.modelImports, Names.classifier(concept));
        this.coreImports.push(...['Box', 'BoxUtils', 'BoxFactory', 'PiElement', 'FreBoxProviderBase', 'FreProjectionHandler', 'PiTableDefinition', 'Language']);

        // see which projections there are for this concept
        // myProjections: all non table projections
        // myTableProjections: all table projections
        const myProjections: PiEditClassifierProjection[] = editDef.findProjectionsForType(concept).filter(proj => !(proj instanceof PiEditTableProjection));
        const myTableProjections: PiEditTableProjection[] = editDef.findTableProjectionsForType(concept);

        // if concept is a binary expression, handle it differently
        let isBinExp: boolean = false;
        let symbol: string = '';
        if (concept instanceof PiBinaryExpressionConcept) {
            isBinExp = true;
            symbol = editDef.getDefaultProjectiongroup().findExtrasForType(concept).symbol;
            this.coreImports.push(...['createDefaultBinaryBox', 'isPiBinaryExpression', Names.PiBinaryExpression]);
        }

        // start template
        // todo adjust knownProjections
        const coreText: string = ` 
                private knownProjections: string[] = ['default'];
                
                constructor(mainHandler: FreProjectionHandler) {
                    super(mainHandler);
                }
            
                set element(element: PiElement) {
                    if (Language.getInstance().metaConformsToType(element, '${Names.classifier(concept)}')) {
                        this._element = element as ${Names.classifier(concept)};
                    } else {
                        console.log('setelement: wrong type (' + element.piLanguageConcept() + ' != ${Names.classifier(concept)})')
                    }
                }
                       
                public getContent(projectionName?: string): Box {
                    // see if we need to use a custom projection
                    let BOX: Box = this.mainHandler.executeCustomProjection(this._element, projectionName);
                    if (!!BOX) { // found one, so return it
                        return BOX;                 
                    ${myProjections.length > 0 ?
                        `} else { // get one of the generated methods to create the content box
                        let projToUse: string;
                        if (projectionName !== null && projectionName !== undefined && projectionName.length > 0) {
                            // if present, select the projection named 'projectionName'
                            projToUse = projectionName;
                        } else {
                            // from the list of projections that are enabled, select the first one that is available for this type of Freon node 
                            projToUse = this.mainHandler.enabledProjections().filter(p => this.knownProjections.includes(p))[0];
                        }
                        // select the box to return based on the chosen selection
                            ${myProjections.map(proj => `if ( projToUse === '${proj.name}') {
                                return this.${Names.projectionMethod(proj)}();
                            }`).join(" else ")}   
                            }               
                            // in all other cases, return the default`
                        : `}`
                        }
                    return this.getDefault();
                }
            
                ${!isBinExp ?
                    `${myProjections.map(proj => `${this.generateProjectionForClassfier(language, concept, proj)}`).join("\n\n")}
                    ${myTableProjections.map(proj => `${this.generateTableDefinition(language, concept, proj)}`).join("\n\n")}`
                : ` /**
                     *  Create a standard binary box to ensure binary expressions can be edited easily
                     */
                    private getDefault(): Box {
                        const binBox = createDefaultBinaryBox(this._element as ${Names.PiBinaryExpression}, "${symbol}", ${Names.environment(language)}.getInstance().editor, this.mainHandler);
                        if (
                            ${Names.environment(language)}.getInstance().editor.showBrackets &&
                            !!this._element.piOwnerDescriptor().owner &&
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
                } 
    
                getTableDefinition(): PiTableDefinition {
                    // from the list of projections that must be shown, select the first one for this type of Freon node
                    let projToUse = this.mainHandler
                        .enabledProjections()
                        .filter(p => this.knownProjections.includes(p))[0];
                    
                    ${myTableProjections.length > 0 ?
                        `// select the table definition to return based on the chosen selection
                         ${myTableProjections.map(proj => `if ( projToUse === '${proj.name}') {
                            return this.${Names.tabelDefinitionFunctionNew(proj.name)}();
                         }`).join(" else ")}                  
                         // in all other cases, return null`
                        : ``
                    }
                    return null;
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
            export class ${Names.boxProvider(concept)} extends FreBoxProviderBase {
                ${coreText}
                ${this.useSuper ? superMethod : ''}       
            }`;

        // reset the imports
        this.modelImports = [];
        this.coreImports = [];

        // reset the variables for super projections
        this.useSuper = false;
        this.supersUsed = [];

        // return the generated text
        return classText;
    }

    private createdGetSuperMethod(supers: PiClassifier[], elementVarName: string): string {
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
                            superBoxProvider = new ${Names.boxProvider(s)}();
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

    private generateProjectionForClassfier(language: PiLanguage, concept: PiClassifier, projection: PiEditClassifierProjection): string {
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
        ListUtil.addIfNotPresent(this.coreImports, "TableUtil");
        // return the projection based on the orientation of the table
        if (orientation === PiEditProjectionDirection.Vertical) {
            return `TableUtil.tableBoxColumnOriented(
                ${elementVarName},
                "${property.name}",
                this.mainHandler.getTableDefinition("${property.type.name}").headers,
                this.mainHandler.getTableDefinition("${property.type.name}").cells,
                ${Names.environment(language)}.getInstance().editor)`;
        } else {
            return `TableUtil.tableBoxRowOriented(
                ${elementVarName},
                "${property.name}",
                this.mainHandler.getTableDefinition("${property.type.name}").headers,
                this.mainHandler.getTableDefinition("${property.type.name}").cells,
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

    private generateTableDefinition(language: PiLanguage, c: PiClassifier, myTableProjection: PiEditTableProjection): string {
        // TODO Check whether 999 argument to generateItem()n should be different.
        if (!!myTableProjection) {
            // create the cell getters
            let cellGetters: string = '';
            myTableProjection.cells.forEach((cell, index) => {
                ListUtil.addIfNotPresent(this.modelImports, Names.classifier(c));
                cellGetters += `(cell${index}: ${Names.classifier(c)}): Box => {
                        return ${this.generateItem(cell, `cell${index}`, index, index, c.name + "_table", language, 999)}
                    },\n`;
            });

            return `${Names.tabelDefinitionFunctionNew(myTableProjection.name)}(): PiTableDefinition {
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
