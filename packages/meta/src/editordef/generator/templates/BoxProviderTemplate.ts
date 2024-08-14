import {
    FreEditExtraClassifierInfo,
    FreEditClassifierProjection,
    FreEditNormalProjection,
    FreEditProjectionGroup,
    FreEditProjectionLine,
    FreEditTableProjection,
    FreEditUnit,
    FreEditFragmentDefinition
} from "../../metalanguage/index.js";
import {
    FreMetaBinaryExpressionConcept,
    FreMetaClassifier,
    FreMetaExpressionConcept,
    FreMetaLanguage,
} from "../../../languagedef/metalanguage/index.js";
import {
    CONFIGURATION_GEN_FOLDER,
    EDITOR_GEN_FOLDER,
    FREON_CORE,
    LANGUAGE_GEN_FOLDER,
    ListUtil,
    Names
} from "../../../utils/index.js";
import {PrimitivePropertyBoxesHelper} from "./boxproviderhelpers/PrimitivePropertyBoxesHelper.js";
import {LimitedBoxHelper} from "./boxproviderhelpers/LimitedBoxHelper.js";
import {BoxProviderCoreTextTemplate} from "./boxproviderhelpers/BoxProviderCoreTextTemplate.js";
import {TableBoxHelper} from "./boxproviderhelpers/TableBoxHelper.js";
import {ItemBoxHelper} from "./boxproviderhelpers/ItemBoxHelper.js";
import {ListPropertyBoxHelper} from "./boxproviderhelpers/ListPropertyBoxHelper.js";
import {PartPropertyBoxHelper} from "./boxproviderhelpers/PartPropertyBoxHelper.js";
import {ExternalBoxesHelper} from "./boxproviderhelpers/ExternalBoxesHelper.js";

export class BoxProviderTemplate {
    // To be able to add a projections for showing/hiding brackets to binary expression, this dummy projection is used.
    private static dummyProjection: FreEditNormalProjection = new FreEditNormalProjection();
    // The classes, functions, etc. to import are collected during the creation of the content for the generated file,
    // to avoid unused imports. All imports are stored in the following three variables.
    public modelImports: string[] = [];    // imports from ../language/gen
    public coreImports: string[] = [];     // imports from @freon4dsl/core
    public configImports: string[] = [];   // imports from ../config/gen
    // Information about the use of projections from superconcepts or interfaces is also collected during the content
    // creation. This avoids the generation of unused classes and methods.
    private useSuper: boolean = false;  // indicates whether one or more super projection(s) are being used
    private supersUsed: FreMetaClassifier[] = [];  // holds the names of the supers (concepts/interfaces) that are being used
    private readonly _myPrimitiveHelper: PrimitivePropertyBoxesHelper;
    private readonly _myItemHelper: ItemBoxHelper;
    private readonly _myTabelBoxHelper: TableBoxHelper;
    private readonly _myLimitedHelper: LimitedBoxHelper;
    private readonly _myListPropHelper: ListPropertyBoxHelper;
    private readonly _myPartPropHelper: PartPropertyBoxHelper;

    constructor(editorDef: FreEditUnit) {
        this._myListPropHelper = new ListPropertyBoxHelper(this);
        this._myPrimitiveHelper = new PrimitivePropertyBoxesHelper(this);
        this._myPartPropHelper = new PartPropertyBoxHelper(this);
        this._myLimitedHelper = new LimitedBoxHelper(this, this._myListPropHelper, this._myPartPropHelper);
        this._myItemHelper = new ItemBoxHelper(
            this,
            this._myPrimitiveHelper,
            this._myLimitedHelper,
            this._myListPropHelper,
            this._myPartPropHelper,
            new ExternalBoxesHelper(this));
        this._myTabelBoxHelper = new TableBoxHelper(this, this._myItemHelper);
        this._myItemHelper.tableBoxHelper = this._myTabelBoxHelper;
        // get the global labels for true and false, and the global display type (checkbox, radio, text, etc.) for boolean values
        const defProjGroup: FreEditProjectionGroup | undefined = editorDef.getDefaultProjectiongroup();
        if (!!defProjGroup) {
            this._myPrimitiveHelper.setGlobals(defProjGroup);
            this._myLimitedHelper.setGlobals(defProjGroup);
        }
    }

    generateBoxProvider(language: FreMetaLanguage, concept: FreMetaClassifier, editDef: FreEditUnit, extraClassifiers: FreMetaClassifier[], relativePath: string): string {
        // init the imports
        ListUtil.addIfNotPresent(this.modelImports, Names.classifier(concept));
        ListUtil.addListIfNotPresent(this.coreImports, ["Box", "BoxUtil", "BoxFactory", Names.FreNode, "FreBoxProvider", "FreProjectionHandler", Names.FreLanguage]);

        // see which projections there are for this concept
        // myBoxProjections: all non table projections
        // myTableProjections: all table projections
        const myBoxProjections: FreEditClassifierProjection[] = editDef.findProjectionsForType(concept)
            .filter(proj => !(proj instanceof FreEditTableProjection));
        const myTableProjections: FreEditTableProjection[] = editDef.findTableProjectionsForType(concept);
        const allProjections: FreEditClassifierProjection[] = [];
        ListUtil.addListIfNotPresent(allProjections, myBoxProjections);
        ListUtil.addListIfNotPresent(allProjections, myTableProjections);

        // build the core of the box provider class, to be used in the template
        const coreText: string = new BoxProviderCoreTextTemplate().generateCoreTemplate(myBoxProjections, myTableProjections, allProjections, concept);

        // build the text for any table projections
        let tableText: string = '';
        if (myTableProjections.length > 0) {
            tableText = myTableProjections.map(proj =>
                this._myTabelBoxHelper.generateTableProjection(language, concept, proj)
            ).join("\n\n")
        }

        // build the text for the box projections or the special text for the binary expressions
        let boxText: string;
        if (concept instanceof FreMetaBinaryExpressionConcept) {
            // if concept is a binary expression, handle it differently
            // add the projection to show/hide brackets
            BoxProviderTemplate.dummyProjection.name = Names.brackets;
            myBoxProjections.splice(0, 0, BoxProviderTemplate.dummyProjection);
            boxText = this.generateForBinExp(language, editDef.getDefaultProjectiongroup()?.findExtrasForType(concept));
        } else {
            boxText = myBoxProjections.map(proj => this.generateProjectionForClassifier(language, concept, proj)).join("\n\n");
        }

        // If 'concept' extends a superconcept or implements interfaces, create the method to produce the box for the superprojection
        // It is added to the generated class, only if it is used, which is indicated by 'this.useSuper'.
        // Note, this should be done after generating 'boxText', because during generation 'this.useSuper' and 'this.supersUsed' are set
        let superMethod: string = "";
        if (this.useSuper && this.supersUsed.length > 0) {
            const elementVarName: string = `(this._node as ${Names.classifier(concept)})`;
            superMethod = this.createdGetSuperMethod(this.supersUsed, elementVarName);
            ListUtil.addListIfNotPresent(extraClassifiers, this.supersUsed);
        }

        // create a string for the collected imports
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

        // create the complete box provider class based on the parts created above
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
                
                ${tableText}

                ${boxText}
                
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

    private generateForBinExp(language: FreMetaLanguage, extras: FreEditExtraClassifierInfo | undefined): string {
        let symbol: string = "";
        if (!!extras) {
            symbol = extras.symbol;
        }
        this.coreImports.push(...["createDefaultBinaryBox", "isFreBinaryExpression", Names.FreBinaryExpression]);
        this.configImports.push(Names.environment(language));
        // todo the current implementation does not work on non-global projections, is this a problem?
        return ` /**
                     *  Create a global binary box to ensure binary expressions can be edited easily
                     */
                    private getDefault(): Box {
                        return createDefaultBinaryBox(
                            this._node as ${Names.FreBinaryExpression},
                            "${symbol}",
                            ${Names.environment(language)}.getInstance().editor,
                            this.mainHandler
                        );
                    }

                    private getBrackets(): Box {
                        const binBox = this.getDefault();
                        if (!!this._node.freOwnerDescriptor().owner &&
                            isFreBinaryExpression(this._node.freOwnerDescriptor().owner)
                        ) {
                            return BoxFactory.horizontalLayout(this._node, "brackets", '', [
                                BoxUtil.labelBox(this._node, "(", "bracket-open", {selectable: true} ),
                                binBox,
                                BoxUtil.labelBox(this._node, ")", "bracket-close", {selectable: true} )
                            ]);
                        } else {
                            return binBox;
                        }
                    }`
    }

    private createdGetSuperMethod(supers: FreMetaClassifier[], elementVarName: string): string {
        ListUtil.addIfNotPresent(this.coreImports, "FreBoxProvider");
        return `
                /**
                 * This method returns the content for one of the superconcepts or interfaces of 'this._node'.
                 * Based on the name of the superconcept/interface, a temporary BoxProvider is created. This BoxProvider
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
                        superBoxProvider.node = ${elementVarName};
                        return superBoxProvider.getContentForSuper(projectionName);
                    } else {
                        return BoxUtil.labelBox(${elementVarName},
                            "ERROR: '" + superName + "' is not a super concept or interface for element of type '" + ${elementVarName}.freLanguageConcept() + "'",
                            'super-projection-error-box'
                        );
                    }
                }`;
    }

    private generateProjectionForClassifier(language: FreMetaLanguage, concept: FreMetaClassifier, projection: FreEditClassifierProjection): string {
        ListUtil.addIfNotPresent(this.modelImports, Names.classifier(concept));
        if (projection instanceof FreEditNormalProjection) {
            const elementVarName: string = `(this._node as ${Names.classifier(concept)})`;
            const result: string = this.generateLines(projection.lines, elementVarName, concept.name, language, 1, projection.fragments);
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

    public generateLines(lines: FreEditProjectionLine[], elementVarName: string, boxLabel: string, language: FreMetaLanguage, topIndex: number, externalChildDefs: FreEditFragmentDefinition[]) {
        let result: string = "";
        // do all lines, separate them with a comma
        lines.forEach((line, index) => {
            result += this.generateLine(line, elementVarName, index, boxLabel, language, topIndex, externalChildDefs);
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
        topIndex: number,
        externalChildDefs: FreEditFragmentDefinition[]
    ): string {
        let result: string = "";
        if (line.isEmpty()) {
            ListUtil.addIfNotPresent(this.coreImports, "BoxUtil");
            result = `BoxUtil.emptyLineBox(${elementVarName}, "${boxLabel}-empty-line-${index}")`;
        } else {
            // do all projection items in the line, separate them with a comma
            line.items.forEach((item, itemIndex) => {
                result += this._myItemHelper.generateItem(item, elementVarName, index, itemIndex, boxLabel, language, topIndex, externalChildDefs);
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

    public useSuperFor(myClassifier: FreMetaClassifier) {
        // indicate that the super method must be added and remember that a box provider for the super concept/interface must be created
        this.useSuper = true;
        ListUtil.addIfNotPresent(this.supersUsed, myClassifier);
    }

}
