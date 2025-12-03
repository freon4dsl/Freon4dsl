import {
    FreEditExtraClassifierInfo,
    FreEditClassifierProjection,
    FreEditNormalProjection,
    FreEditProjectionGroup,
    FreEditProjectionLine,
    FreEditTableProjection,
    FreEditUnit,
} from "../../metalanguage/index.js";
import {
    FreMetaBinaryExpressionConcept,
    FreMetaClassifier,
    FreMetaExpressionConcept,
    FreMetaLanguage,
} from "../../../languagedef/metalanguage/index.js";
import { ListUtil } from "../../../utils/no-dependencies/index.js";
import { Names, Imports } from "../../../utils/on-lang/index.js";
import { NamesForEditor } from "../../../utils/on-lang-and-editor/index.js";
import {
    PrimitivePropertyBoxesHelper,
    LimitedBoxHelper,
    BoxProviderCoreTextTemplate,
    TableBoxHelper,
    ItemBoxHelper,
    ListPropertyBoxHelper,
    PartPropertyBoxHelper,
    ExternalBoxesHelper,
} from "./boxproviderhelpers/index.js";

export class BoxProviderTemplate {
    // To be able to add a projections for showing/hiding brackets to binary expression, this projection is used.
    private static bracketProjection: FreEditNormalProjection = new FreEditNormalProjection();
    // The classes, functions, etc. to import are collected during the creation of the content for the generated file,
    // to avoid unused imports. All imports are stored in the following three variables.
    public imports = new Imports()
    // Fragments are generated as two strings: a separate method and a call to this method in the box provider method(s).
    // The methods are stored in 'fragmentMethods'.
    public fragmentMethods: string[] = [];
    // Information about the use of projections from super concepts or interfaces is also collected during the content
    // creation. This avoids the generation of unused classes and methods.
    private useSuper: boolean = false; // indicates whether one or more super projection(s) are being used
    private supersUsed: FreMetaClassifier[] = []; // holds the names of the supers (concepts/interfaces) that are being used
    private readonly _myPrimitiveHelper: PrimitivePropertyBoxesHelper;
    private readonly _myItemHelper: ItemBoxHelper;
    private readonly _myTableBoxHelper: TableBoxHelper;
    private readonly _myLimitedHelper: LimitedBoxHelper;
    private readonly _myListPropHelper: ListPropertyBoxHelper;
    private readonly _myPartPropHelper: PartPropertyBoxHelper;

    constructor(editorDef: FreEditUnit) {
        // set up the configuration of all box provider generation helpers
        this._myListPropHelper = new ListPropertyBoxHelper(this);
        let externalBoxesHelper: ExternalBoxesHelper = new ExternalBoxesHelper(this);
        this._myPartPropHelper = new PartPropertyBoxHelper(this);
        this._myPrimitiveHelper = new PrimitivePropertyBoxesHelper(this, externalBoxesHelper);
        this._myLimitedHelper = new LimitedBoxHelper(this, this._myListPropHelper, this._myPartPropHelper);
        this._myItemHelper = new ItemBoxHelper(
            this,
            this._myPrimitiveHelper,
            this._myLimitedHelper,
            this._myListPropHelper,
            this._myPartPropHelper,
            externalBoxesHelper,
        );
        this._myTableBoxHelper = new TableBoxHelper(this, this._myItemHelper);
        this._myItemHelper.tableBoxHelper = this._myTableBoxHelper;
        // get the global labels for true and false, and the global display type (checkbox, radio, text, etc.) for boolean values
        const defProjGroup: FreEditProjectionGroup | undefined = editorDef.getDefaultProjectiongroup();
        if (!!defProjGroup) {
            this._myPrimitiveHelper.setGlobals(defProjGroup);
            this._myLimitedHelper.setGlobals(defProjGroup);
        }
    }

    generateBoxProvider(
        language: FreMetaLanguage,
        concept: FreMetaClassifier,
        editDef: FreEditUnit,
        extraClassifiers: FreMetaClassifier[],
        relativePath: string,
    ): string {
        // init the imports
        this.imports = new Imports(relativePath)
        this.imports.language.add(Names.classifier(concept));
        this.imports.core.add("Box")
            .add("BoxUtil")
            .add("FreBoxProvider")
            .add("FreProjectionHandler")

        // see which projections there are for this concept
        // myBoxProjections: all non table projections
        // myTableProjections: all table projections
        const myBoxProjections: FreEditClassifierProjection[] = editDef
            .findProjectionsForType(concept)
            .filter((proj) => !(proj instanceof FreEditTableProjection));
        const myTableProjections: FreEditTableProjection[] = editDef.findTableProjectionsForType(concept);
        const allProjections: FreEditClassifierProjection[] = [];
        ListUtil.addListIfNotPresent(allProjections, myBoxProjections);
        ListUtil.addListIfNotPresent(allProjections, myTableProjections);

        if (concept instanceof FreMetaBinaryExpressionConcept) {
            // if concept is a binary expression, handle it differently
            // add the projection to show/hide brackets
            BoxProviderTemplate.bracketProjection.name = Names.brackets;
            myBoxProjections.splice(0, 0, BoxProviderTemplate.bracketProjection);
        }
        ListUtil.addListIfNotPresent(allProjections, myBoxProjections);
        ListUtil.addListIfNotPresent(allProjections, myTableProjections);

        // build the core of the box provider class, to be used in the template
        const coreText: string = new BoxProviderCoreTextTemplate().generateCoreTemplate(
            myBoxProjections,
            myTableProjections,
            allProjections,
            concept,
        );

        // build the text for any table projections
        let tableText: string = "";
        if (myTableProjections.length > 0) {
            tableText = myTableProjections
                .map((proj) => this._myTableBoxHelper.generateTableProjection(language, concept, proj, 1))
                .join("\n\n");
        }

        // build the text for the box projections or the special text for the binary expressions
        let boxText: string;
        if (concept instanceof FreMetaBinaryExpressionConcept) {
            boxText = this.generateForBinExp(language, editDef.getDefaultProjectiongroup()?.findExtrasForType(concept));
        } else {
            boxText = myBoxProjections
                .map((proj) => this.generateProjectionForClassifier(language, concept, proj))
                .join("\n\n");
        }

        // If 'concept' extends a super concept or implements interfaces, create the method to produce the box for the super projection
        // It is added to the generated class, only if it is used, which is indicated by 'this.useSuper'.
        // Note, this should be done after generating 'boxText', because during generation 'this.useSuper' and 'this.supersUsed' are set
        let superMethod: string = "";
        if (this.useSuper && this.supersUsed.length > 0) {
            const elementVarName: string = `(this._node as ${Names.classifier(concept)})`;
            superMethod = this.createdGetSuperMethod(this.supersUsed, elementVarName);
            ListUtil.addListIfNotPresent(extraClassifiers, this.supersUsed);
        }

        if (this.supersUsed.length > 0) {
            this.supersUsed.forEach((c) => {
                this.imports.editor.add(NamesForEditor.boxProvider(c))
            })
        }

        // create the complete box provider class based on the parts created above
        const classText: string = `
            // TEMPLATE BoxProviderTemplate.generateBoxProvider(...)
            ${this.imports.makeImports(language)}
            /**
             * This class implements the box provider for a single node of type ${Names.classifier(concept)}.
             * The box provider is able to create the (tree of) boxes for the node, based
             * on the projections that are currently selected by the user.
             * The top of the tree of boxes is always a box of type ElementBox, which is
             * a box that will never be rendered itself, only its content will. Thus, we
             * have a stable entry in the complete box tree for every ${Names.FreNode} node.
             */
            export class ${NamesForEditor.boxProvider(concept)} extends FreBoxProvider {
                ${coreText}
                
                ${tableText}

                ${boxText}
                
                ${this.useSuper ? superMethod : ""}
                
                ${this.fragmentMethods.map((meth: string) => meth).join("\n\n")}
            }`;
        // reset the fragmentMethods
        this.fragmentMethods = [];

        // reset the variables for super projections
        this.useSuper = false;
        this.supersUsed = [];

        // return the generated text
        return classText;
    }

    // @ts-ignore
    private generateForBinExp(language: FreMetaLanguage, extras: FreEditExtraClassifierInfo | undefined): string {
        let symbol: string = "";
        if (!!extras) {
            symbol = extras.symbol;
        }
        this.imports.core.add("createDefaultBinaryBox").add("isFreBinaryExpression").add(Names.FreBinaryExpression).add("BoxFactory");
        this.imports.root.add(Names.LanguageEnvironment);
        // todo the current implementation does not work on non-global projections, is this a problem?
        return ` /**
                     *  Create a global binary box to ensure binary expressions can be edited easily
                     */
                    private getDefault(): Box {
                        return createDefaultBinaryBox(
                            this._node as ${Names.FreBinaryExpression},
                            "${symbol}",
                            ${Names.LanguageEnvironment}.getInstance().editor,
                            this.mainHandler
                        );
                    }

                    private getBrackets(): Box {
                        const binBox = this.getDefault();
                        if (!!this._node.freOwnerDescriptor().owner &&
                            isFreBinaryExpression(this._node.freOwnerDescriptor().owner)
                        ) {
                            return BoxFactory.horizontalLayout(this._node, "brackets", '', [
                                BoxUtil.labelBox(this._node, "(", "bracket-open", {selectable: false, cssClass: "brackets"} ),
                                binBox,
                                BoxUtil.labelBox(this._node, ")", "bracket-close", {selectable: false, cssClass: "brackets"} )
                            ]);
                        } else {
                            return binBox;
                        }
                    }`;
    }

    private createdGetSuperMethod(supers: FreMetaClassifier[], elementVarName: string): string {
        this.imports.core.add("FreBoxProvider").add("notNullOrUndefined");
        return `
                /**
                 * This method returns the content for one of the super concepts or interfaces of 'this._node'.
                 * Based on the name of the super concept/interface, a temporary BoxProvider is created. This BoxProvider
                 * then returns the result of its 'getContent' method, using 'projectionName' as parameter.
                 *
                 * @param superName         The name of the super concept or interface for which the projection is requested.
                 * @param projectionName    The name of projection that is requested.
                 * @private
                 */
                private getSuper(superName: string, projectionName?: string): Box {
                    let superBoxProvider: FreBoxProvider | null = null;
                    switch (superName) {
                        ${supers
                            .map(
                                (s) => `case "${s.name}": {
                            superBoxProvider = new ${NamesForEditor.boxProvider(s)}(this.mainHandler);
                            break;
                        }`,
                            )
                            .join("\n")}
                    }
                    if (notNullOrUndefined(superBoxProvider)) {
                        superBoxProvider.node = ${elementVarName};
                        if (notNullOrUndefined(projectionName)) {
                            return superBoxProvider.getContentForSuper(projectionName);
                        } else {
                            return BoxUtil.labelBox(
                              ${elementVarName},
                              "ERROR: no projection name provided for a super concept or interface",
                              "super-projection-error-box1",
                            );              
                        }
                    } else {
                        return BoxUtil.labelBox(${elementVarName},
                            "ERROR: '" + superName + "' is not a super concept or interface for element of type '" + ${elementVarName}.freLanguageConcept() + "'",
                            'super-projection-error-box2'
                        );
                    }
                }`;
    }

    private generateProjectionForClassifier(
        language: FreMetaLanguage,
        concept: FreMetaClassifier,
        projection: FreEditClassifierProjection,
    ): string {
        this.imports.language.add(Names.classifier(concept));
        if (projection instanceof FreEditNormalProjection) {
            const elementVarName: string = `(this._node as ${Names.classifier(concept)})`;
            const result: string = this.generateLines(projection.lines, elementVarName, concept.name, language, 1);
            if (concept instanceof FreMetaExpressionConcept) {
                this.imports.core.add("createDefaultExpressionBox");
                return `private ${NamesForEditor.projectionMethod(projection)} () : Box {
                    return createDefaultExpressionBox( ${elementVarName}, [${result}], { selectable: false } );
                }`;
            } else {
                return `private ${NamesForEditor.projectionMethod(projection)} () : Box {
                    return ${result};
                }`;
            }
            // else if (projection instanceof FreEditTableProjection) => should not occur. Filtered out of 'allClassifiersWithProjection'
        }
        return "";
    }

    /**
     *
     * @param lines
     * @param elementVarName
     * @param boxLabel
     * @param language
     * @param topIndex
     */
    public generateLines(
        lines: FreEditProjectionLine[],
        elementVarName: string,
        boxLabel: string,
        language: FreMetaLanguage,
        topIndex: number,
    ): string {
        let result: string = "";
        // do all lines, separate them with a comma
        lines.forEach((line, index) => {
            result += this.generateLine(line, elementVarName, index, boxLabel, language, topIndex);
            if (index !== lines.length - 1) {
                // add a comma
                result += ",";
            }
        });
        if (lines.length > 1) {
            // multi-line projection, so surround with vertical box
            this.imports.core.add("BoxFactory");
            result = `BoxFactory.verticalLayout(${elementVarName}, "${boxLabel}-overall", '', [
                ${result}
            ], {cssClass: "${boxLabel}"})`;
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
    ): string {
        let result: string = "";
        if (line.isEmpty()) {
            this.imports.core.add("BoxUtil");
            result = `BoxUtil.emptyLineBox(${elementVarName}, "${boxLabel}-empty-line-${index}")`;
        } else {
            // do all projection items in the line, separate them with a comma
            line.items.forEach((item, itemIndex) => {
                result += this._myItemHelper.generateItem(
                    item,
                    elementVarName,
                    index,
                    itemIndex,
                    boxLabel,
                    language,
                    topIndex,
                );
                if (itemIndex < line.items.length - 1) {
                    result += ",";
                }
            });
            if (line.items.length > 1) {
                // surround with horizontal box
                // TODO Too many things are now selectable, but if false, you cannot select e.g. an attribute
                this.imports.core.add("BoxFactory");
                result = `BoxFactory.horizontalLayout(${elementVarName}, "${boxLabel}-hlist-line-${index}", '', [ ${result} ], { selectable: false } ) `;
            }
            if (line.indent > 0) {
                // surround with indentBox
                this.imports.core.add("BoxUtil");
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
