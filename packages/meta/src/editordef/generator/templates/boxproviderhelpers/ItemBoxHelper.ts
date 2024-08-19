import {
    FreEditButtonDef,
    FreEditFragmentDefinition,
    FreEditProjectionItem,
    FreEditProjectionText,
    FreEditPropertyProjection,
    FreEditSimpleExternal,
    FreEditSuperProjection,
    FreOptionalPropertyProjection,
    FreEditFragmentProjection,
} from "../../../metalanguage/index.js";
import {
    FreMetaClassifier,
    FreMetaConceptProperty,
    FreMetaLanguage,
    FreMetaLimitedConcept,
    FreMetaPrimitiveProperty,
    FreMetaProperty,
} from "../../../../languagedef/metalanguage/index.js";
import { ListUtil, LOG2USER, Names } from "../../../../utils/index.js";
import { ParserGenUtil } from "../../../../parsergen/parserTemplates/ParserGenUtil.js";
import {
    PrimitivePropertyBoxesHelper,
    ExternalBoxesHelper,
    TableBoxHelper,
    ListPropertyBoxHelper,
    LimitedBoxHelper,
    PartPropertyBoxHelper,
} from "./index.js";
import { BoxProviderTemplate } from "../BoxProviderTemplate.js";

export class ItemBoxHelper {
    set tableBoxHelper(value: TableBoxHelper) {
        this._tableBoxHelper = value;
    }
    private readonly _myTemplate: BoxProviderTemplate;
    private readonly _myPrimitiveHelper: any;
    private readonly _myLimitedHelper: LimitedBoxHelper;
    private readonly _myListPropHelper: ListPropertyBoxHelper;
    private readonly _myExternalHelper: ExternalBoxesHelper;
    private readonly _myPartPropHelper: PartPropertyBoxHelper;
    // @ts-ignore
    private _tableBoxHelper: TableBoxHelper;

    constructor(
        myTemplate: BoxProviderTemplate,
        myPrimitiveHelper: PrimitivePropertyBoxesHelper,
        myLimitedHelper: LimitedBoxHelper,
        myListPropHelper: ListPropertyBoxHelper,
        myPartPropHelper: PartPropertyBoxHelper,
        myExternalBoxesHelper: ExternalBoxesHelper,
    ) {
        this._myTemplate = myTemplate;
        this._myPrimitiveHelper = myPrimitiveHelper;
        this._myLimitedHelper = myLimitedHelper;
        this._myListPropHelper = myListPropHelper;
        this._myPartPropHelper = myPartPropHelper;
        this._myExternalHelper = myExternalBoxesHelper;
    }

    /**
     *
     * @param item
     * @param elementVarName
     * @param lineIndex             used to generate a box label
     * @param itemIndex             used to generate a box label
     * @param mainBoxLabel
     * @param language
     * @param topIndex              used to generate a box label
     */
    public generateItem(
        item: FreEditProjectionItem,
        elementVarName: string,
        lineIndex: number,
        itemIndex: number,
        mainBoxLabel: string,
        language: FreMetaLanguage,
        topIndex: number,
    ): string {
        let result: string = "";
        if (item instanceof FreEditProjectionText) {
            ListUtil.addIfNotPresent(this._myTemplate.coreImports, "BoxUtil");
            result += ` BoxUtil.labelBox(${elementVarName}, "${ParserGenUtil.escapeRelevantChars(item.text.trim())}", "top-${topIndex}-line-${lineIndex}-item-${itemIndex}") `;
        } else if (item instanceof FreEditButtonDef) {
            ListUtil.addIfNotPresent(this._myTemplate.coreImports, "BoxUtil");
            result += ` BoxUtil.buttonBox(${elementVarName}, "${ParserGenUtil.escapeRelevantChars(item.text.trim())}", "${ParserGenUtil.escapeRelevantChars(item.boxRole.trim())}") `;
        } else if (item instanceof FreOptionalPropertyProjection) {
            result += this.generateOptionalProjection(item, elementVarName, mainBoxLabel, language);
        } else if (item instanceof FreEditPropertyProjection) {
            // Note: this condition must come after FreOptionalPropertyProjection,
            // because FreOptionalPropertyProjection is a subclass of FreEditPropertyProjection
            result += this.generatePropertyProjection(item, elementVarName, language);
        } else if (item instanceof FreEditSuperProjection) {
            result += this.generateSuperProjection(item);
        } else if (item instanceof FreEditFragmentProjection) {
            console.log("generating fragment: " + item.name + ", which belongs to " + item.belongsTo.classifier?.name)
             let innerResult = this.generateFragmentProjection(item, elementVarName, mainBoxLabel, language, topIndex);
            console.log("result of generation: " + innerResult)
            result += innerResult;
        } else if (item instanceof FreEditSimpleExternal) {
            result += this._myExternalHelper.generateSimpleExternal(item, elementVarName, mainBoxLabel);
        }
        return result;
    }

    private generateOptionalProjection(
        optional: FreOptionalPropertyProjection,
        elementVarName: string,
        mainBoxLabel: string,
        language: FreMetaLanguage,
    ): string {
        const propertyProjection: FreEditPropertyProjection | undefined = optional.findPropertyProjection();
        const property: FreMetaProperty | undefined = optional.property?.referred;
        if (!!propertyProjection && !!property && !!propertyProjection.property) {
            const optionalPropertyName: string = propertyProjection.property.name;
            const myLabel: string = `${mainBoxLabel}-optional-${optionalPropertyName}`;

            // reuse the general method to handle lines
            let result: string = this._myTemplate.generateLines(optional.lines, elementVarName, myLabel, language, 2);

            // surround with optional box, and add "BoxFactory" to imports
            ListUtil.addIfNotPresent(this._myTemplate.coreImports, "BoxFactory");
            const condition: string = property.isList
                ? `() => (!!${elementVarName}.${optionalPropertyName}) && (${elementVarName}.${optionalPropertyName}).length !== 0`
                : `() => (!!${elementVarName}.${optionalPropertyName})`;
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
    private generatePropertyProjection(
        item: FreEditPropertyProjection,
        elementVarName: string,
        language: FreMetaLanguage,
    ) {
        let result: string = "";
        const property: FreMetaProperty | undefined = item.property?.referred;
        if (property === null || property === undefined) {
            return "";
        }
        if (property instanceof FreMetaPrimitiveProperty) {
            result = this._myPrimitiveHelper.generatePrimitivePropery(property, elementVarName, item, result);
        } else if (property instanceof FreMetaConceptProperty) {
            if (property.isPart) {
                result = this.generatePartProperty(property, item, elementVarName, language);
            } else {
                // reference
                result = this.generateRefProperty(property, elementVarName, language, item);
            }
        } else {
            result += `/* ERROR unknown property box here for ${property.name} */ `;
        }
        return result;
    }

    private generateRefProperty(
        property: FreMetaConceptProperty,
        elementVarName: string,
        language: FreMetaLanguage,
        item: FreEditPropertyProjection,
    ): string {
        let result: string = "";
        if (property.type instanceof FreMetaLimitedConcept) {
            result += this._myLimitedHelper.generateLimited(
                property,
                elementVarName,
                language,
                item.listInfo,
                item.displayType,
            );
        } else if (property.isList) {
            let innerResult: string = "";
            if (!!item.listInfo && item.listInfo.isTable) {
                // if there is information on how to project the property as a table, make it a table
                // no table projection for references - for now
                innerResult = this._myListPropHelper.generateReferenceAsList(
                    language,
                    item.listInfo,
                    property,
                    elementVarName,
                );
            } else if (!!item.listInfo) {
                // if there is information on how to project the property as a list, make it a list
                innerResult = this._myListPropHelper.generateReferenceAsList(
                    language,
                    item.listInfo,
                    property,
                    elementVarName,
                );
            }
            if (!!item.externalInfo) {
                // there is information on how to project the property as an external component, wrap the result in an ExternalBox
                result += this._myExternalHelper.generateListAsExternal(
                    item,
                    property,
                    elementVarName,
                    innerResult,
                    language,
                );
            } else {
                result += innerResult;
            }
        } else {
            // single element
            let innerResult: string = this._myPartPropHelper.generateReferenceProjection(
                language,
                property,
                elementVarName,
            );
            if (!!item.externalInfo) {
                // there is information on how to project the property as an external component, wrap the result in an ExternalBox
                result += this._myExternalHelper.generateSingleAsExternal(item, property, elementVarName, innerResult);
            } else {
                result += innerResult;
            }
        }
        return result;
    }

    private generatePartProperty(
        property: FreMetaConceptProperty,
        item: FreEditPropertyProjection,
        elementVarName: string,
        language: FreMetaLanguage,
    ): string {
        let result: string = "";
        if (property.isList) {
            let innerResult: string = "";
            if (!!item.listInfo && item.listInfo.isTable) {
                // if there is information on how to project the property as a table, make it a table
                innerResult = this._tableBoxHelper.generatePropertyAsTable(
                    item.listInfo.direction,
                    property,
                    elementVarName,
                    language,
                );
            } else if (!!item.listInfo) {
                // if there is information on how to project the property as a list, make it a list
                innerResult = this._myListPropHelper.generatePartAsList(item, property, elementVarName);
            }
            if (!!item.externalInfo) {
                // there is information on how to project the property as an external component, wrap the result in an ExternalBox
                result += this._myExternalHelper.generateListAsExternal(
                    item,
                    property,
                    elementVarName,
                    innerResult,
                    language,
                );
            } else {
                result += innerResult;
            }
        } else {
            // single element
            ListUtil.addIfNotPresent(this._myTemplate.coreImports, "BoxUtil");
            let innerResult: string = `BoxUtil.getBoxOrAction(${elementVarName}, "${property.name}", "${property.type.name}", this.mainHandler) `;
            if (!!item.externalInfo) {
                // there is information on how to project the property as an external component, wrap the result in an ExternalBox
                result += this._myExternalHelper.generateSingleAsExternal(item, property, elementVarName, innerResult);
            } else {
                result += innerResult;
            }
        }
        return result;
    }

    private generateSuperProjection(item: FreEditSuperProjection): string {
        const myClassifier: FreMetaClassifier | undefined = item.superRef?.referred; // to avoid the lookup by '.referred' to happen more than once
        if (myClassifier === undefined || myClassifier === null) {
            return "";
        }
        // indicate that the super method must be added and remember that a box provider for the super concept/interface must be created
        this._myTemplate.useSuperFor(myClassifier);
        // return the call to the extra method
        if (item.projectionName !== null && item.projectionName !== undefined && item.projectionName.length > 0) {
            // a specific projectName is requested, use it as parameter to the 'getSuper' method
            return `this.getSuper("${Names.classifier(myClassifier)}", "${item.projectionName}")`;
        } else {
            return `this.getSuper("${Names.classifier(myClassifier)}")`;
        }
    }

    private generateFragmentProjection(
        item: FreEditFragmentProjection,
        elementVarName: string,
        mainBoxLabel: string,
        language: FreMetaLanguage,
        topIndex: number,
    ): string {
        console.log("all fragments in \n[[" + item.belongsTo + "]]\n: " + item.belongsTo.fragmentDefinitions.map(fr => fr.name))
        let fragmentDefinition: FreEditFragmentDefinition | undefined = item.belongsTo.fragmentDefinitions.find(
            (def) => def.name === item.name,
        );
        if (!!fragmentDefinition) {
            // create role todo make sure this is the right role
            const myRole: string = `${mainBoxLabel}-fragment-${item.name!}`;
            console.log("Lines: "+ fragmentDefinition.childProjection.lines)
            const fragmentDefinitionStr: string = this._myTemplate.generateLines(
                fragmentDefinition.childProjection.lines,
                elementVarName,
                myRole,
                language,
                topIndex,
            );
            ListUtil.addIfNotPresent(this._myTemplate.coreImports, "FragmentBox");
            return `new FragmentBox(${elementVarName}, "${myRole}", ${fragmentDefinitionStr})`;
        } else {
            return "";
        }
    }
}
