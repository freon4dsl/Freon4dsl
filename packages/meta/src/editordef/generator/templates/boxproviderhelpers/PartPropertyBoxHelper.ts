import { FreMetaConceptProperty, FreMetaLanguage } from "../../../../languagedef/metalanguage/index.js";
import { ListUtil, Names } from "../../../../utils/index.js";
import { BoxProviderTemplate } from "../BoxProviderTemplate.js";

export class PartPropertyBoxHelper {
    private _myTemplate: BoxProviderTemplate;

    constructor(myTemplate: BoxProviderTemplate) {
        this._myTemplate = myTemplate;
    }

    public generateReferenceProjection(
        language: FreMetaLanguage,
        appliedFeature: FreMetaConceptProperty,
        element: string,
    ): string {
        const featureType = Names.classifier(appliedFeature.type);
        ListUtil.addIfNotPresent(this._myTemplate.modelImports, featureType);
        ListUtil.addIfNotPresent(this._myTemplate.configImports, Names.environment(language));
        ListUtil.addListIfNotPresent(this._myTemplate.coreImports, [Names.FreNodeReference, "BoxUtil"]);
        return `BoxUtil.referenceBox(
                                ${element},
                                "${appliedFeature.name}",
                                (selected: string) => {
                                    ${element}.${appliedFeature.name} = ${Names.FreNodeReference}.create<${featureType}>(
                                               selected, "${featureType}" );
                                },
                                ${Names.environment(language)}.getInstance().scoper
               )`;
    }
}
