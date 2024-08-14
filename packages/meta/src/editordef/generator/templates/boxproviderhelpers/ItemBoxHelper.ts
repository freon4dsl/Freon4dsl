import {
    FreEditButtonDef,
    FreEditFragmentDefinition,
    FreEditProjectionItem,
    FreEditProjectionText,
    FreEditPropertyProjection,
    FreEditSimpleExternal,
    FreEditSuperProjection,
    FreOptionalPropertyProjection
} from "../../../metalanguage/index.js";
import {
    FreMetaClassifier,
    FreMetaConceptProperty,
    FreMetaLanguage, FreMetaLimitedConcept,
    FreMetaPrimitiveProperty,
    FreMetaProperty
} from "../../../../languagedef/metalanguage/index.js";
import {ListUtil, LOG2USER, Names} from "../../../../utils/index.js";
import {ParserGenUtil} from "../../../../parsergen/parserTemplates/ParserGenUtil.js";
import {PrimitivePropertyBoxesHelper} from "./PrimitivePropertyBoxesHelper.js";
import {ExternalBoxesHelper} from "./ExternalBoxesHelper.js";
import {TableBoxHelper} from "./TableBoxHelper.js";
import {ListPropertyBoxHelper} from "./ListPropertyBoxHelper.js";
import {LimitedBoxHelper} from "./LimitedBoxHelper.js";
import {PartPropertyBoxHelper} from "./PartPropertyBoxHelper.js";
import {BoxProviderTemplate} from "../BoxProviderTemplate.js";

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
    
    constructor(myTemplate: BoxProviderTemplate,
                myPrimitiveHelper: PrimitivePropertyBoxesHelper,
                myLimitedHelper: LimitedBoxHelper,
                myListPropHelper: ListPropertyBoxHelper,
                myPartPropHelper: PartPropertyBoxHelper,
                myExternalBoxesHelper: ExternalBoxesHelper) {
        this._myTemplate = myTemplate;
        this._myPrimitiveHelper = myPrimitiveHelper;
        this._myLimitedHelper = myLimitedHelper;
        this._myListPropHelper = myListPropHelper;
        this. _myPartPropHelper = myPartPropHelper;
        this._myExternalHelper = myExternalBoxesHelper;
    }

    public generateItem(item: FreEditProjectionItem,
                               elementVarName: string,
                               lineIndex: number,
                               itemIndex: number,
                               mainBoxLabel: string,
                               language: FreMetaLanguage,
                               topIndex: number,
                               externalChildDefs: FreEditFragmentDefinition[]
    ): string {
        let result: string = "";
        if (item instanceof FreEditProjectionText) {
            ListUtil.addIfNotPresent(this._myTemplate.coreImports, "BoxUtil");
            result += ` BoxUtil.labelBox(${elementVarName}, "${ParserGenUtil.escapeRelevantChars(item.text.trim())}", "top-${topIndex}-line-${lineIndex}-item-${itemIndex}") `;
        } else if (item instanceof FreEditButtonDef) {
            ListUtil.addIfNotPresent(this._myTemplate.coreImports, "BoxUtil");
            result += ` BoxUtil.buttonBox(${elementVarName}, "${ParserGenUtil.escapeRelevantChars(item.text.trim())}", "${ParserGenUtil.escapeRelevantChars(item.boxRole.trim())}") `;
        } else if (item instanceof FreOptionalPropertyProjection) {
            result += this.generateOptionalProjection(item, elementVarName, mainBoxLabel, language, externalChildDefs);
        } else if (item instanceof FreEditPropertyProjection) {
            // Note: this condition must come after FreOptionalPropertyProjection,
            // because FreOptionalPropertyProjection is a subclass of FreEditPropertyProjection
            result += this.generatePropertyProjection(item, elementVarName, language);
        } else if (item instanceof FreEditSuperProjection) {
            result += this.generateSuperProjection(item);
        } else if (item instanceof FreEditSimpleExternal) {
            result += this.generateExternalFragmentProjection(item, elementVarName, mainBoxLabel, externalChildDefs, elementVarName, language);
        }
        return result;
    }

    private generateOptionalProjection(optional: FreOptionalPropertyProjection, 
                                              elementVarName: string, 
                                              mainBoxLabel: string, 
                                              language: FreMetaLanguage, 
                                              externalChildDefs: FreEditFragmentDefinition[]
    ): string {
        const propertyProjection: FreEditPropertyProjection | undefined = optional.findPropertyProjection();
        const property: FreMetaProperty | undefined = optional.property?.referred;
        if (!!propertyProjection && !!property && !!propertyProjection.property) {
            const optionalPropertyName: string = propertyProjection.property.name;
            const myLabel: string = `${mainBoxLabel}-optional-${optionalPropertyName}`;

            // reuse the general method to handle lines
            let result: string = this._myTemplate.generateLines(optional.lines, elementVarName, myLabel, language, 2, externalChildDefs);

            // surround with optional box, and add "BoxFactory" to imports
            ListUtil.addIfNotPresent(this._myTemplate.coreImports, "BoxFactory");
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
    private generatePropertyProjection(item: FreEditPropertyProjection, 
                                              elementVarName: string, 
                                              language: FreMetaLanguage) {
        let result: string = "";
        const property: FreMetaProperty | undefined = item.property?.referred;
        if (property === null || property === undefined) {
            return '';
        }
        if (property instanceof FreMetaPrimitiveProperty) {
            let singleResult: string = this._myPrimitiveHelper.primitivePropertyProjection(property, elementVarName, this._myTemplate.coreImports, item.displayType, item.boolKeywords, item.listInfo);
            if (!!item.externalInfo) { // there is information on how to project the property as an external component, wrap the result in an ExternalBox
                result += this._myExternalHelper.generatePrimAsExternal(item, property, elementVarName);
            } else {
                result += singleResult;
            }
        } else if (property instanceof FreMetaConceptProperty) {
            if (property.isPart) {
                if (property.isList) {
                    if (!!item.listInfo && item.listInfo.isTable) {  // if there is information on how to project the property as a table, make it a table
                        result += this._tableBoxHelper.generatePropertyAsTable(item.listInfo.direction, property, elementVarName, language);
                    } else if (!!item.listInfo) { // if there is information on how to project the property as a list, make it a list
                        result += this._myListPropHelper.generatePartAsList(item, property, elementVarName);
                    } else if (!!item.externalInfo) { // there is information on how to project the property as an external component
                        result += this._myExternalHelper.generateListAsExternal(item, property, elementVarName);
                    }
                } else { // single element
                    ListUtil.addIfNotPresent(this._myTemplate.coreImports, "BoxUtil");
                    if (!!item.externalInfo) { // there is information on how to project the property as an external component, wrap the result in an ExternalBox
                        result += this._myExternalHelper.generateSingleAsExternal(item, property, elementVarName);
                    } else {
                        result += `BoxUtil.getBoxOrAction(${elementVarName}, "${property.name}", "${property.type.name}", this.mainHandler) `;
                    }
                }
            } else { // reference
                if (property.type instanceof FreMetaLimitedConcept){
                    result += this._myLimitedHelper.generateLimited(property, elementVarName, language, item.listInfo, item.displayType)
                } else if (property.isList) {
                    if (!!item.listInfo && item.listInfo.isTable) { // if there is information on how to project the property as a table, make it a table
                        // no table projection for references - for now
                        result += this._myListPropHelper.generateReferenceAsList(language, item.listInfo, property, elementVarName);
                    } else if (!!item.listInfo) { // if there is information on how to project the property as a list, make it a list
                        result += this._myListPropHelper.generateReferenceAsList(language, item.listInfo, property, elementVarName);
                    }
                } else { // single element
                    if (!!item.externalInfo) { // there is information on how to project the property as an external component, wrap the result in an ExternalBox
                        result += this._myExternalHelper.generateSingleAsExternal(item, property, elementVarName);
                    } else {
                        result += this._myPartPropHelper.generateReferenceProjection(language, property, elementVarName);
                    }
                }
            }
        } else {
            result += `/* ERROR unknown property box here for ${property.name} */ `;
        }
        return result;
    }

    private generateSuperProjection(item: FreEditSuperProjection) {
        const myClassifier: FreMetaClassifier | undefined = item.superRef?.referred; // to avoid the lookup by '.referred' to happen more than once
        if (myClassifier === undefined || myClassifier === null) {
            return '';
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

    private generateExternalFragmentProjection(
        item: FreEditSimpleExternal,
        element: string,
        mainBoxLabel: string,
        fragmentDefinitions: FreEditFragmentDefinition[],
        elementVarName: string,
        language: FreMetaLanguage
    ): string {
        // todo change here external
        // create role todo make sure this is the right role
        const myRole: string = `${mainBoxLabel}-external-${item.name!}`;
        // build the initializer with parameters to the external component
        let initializer: string = '';
        if (!!item.params && item.params.length > 0) {
            initializer = `, { params: [${item.params.map(x => `{key: "${x.key}", value: "${x.value}"}`).join(", ")}] }`;
        }
        // see if there is a child projection and add it as child
        let childStr: string = '';
        const myChildDef: FreEditFragmentDefinition | undefined = fragmentDefinitions.find(def =>
            def.name === item.name
        );
        if (!!myChildDef) {
            childStr = `, ${this._myTemplate.generateLines(myChildDef.childProjection.lines, elementVarName, myRole, language, 1000, fragmentDefinitions)}`;
        } else {
            ListUtil.addIfNotPresent(this._myTemplate.coreImports, "ExternalSimpleBox");
            return `new ExternalSimpleBox("${item.name}", ${element}, "${myRole}"${childStr}${initializer})`;
        }
        ListUtil.addIfNotPresent(this._myTemplate.coreImports, "ExternalFragmentBox");
        return `new ExternalFragmentBox("${item.name}", ${element}, "${myRole}"${childStr}${initializer})`;
    }
}
