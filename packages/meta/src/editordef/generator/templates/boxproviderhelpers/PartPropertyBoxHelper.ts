import { FreMetaConceptProperty, FreMetaLanguage } from "../../../../languagedef/metalanguage/index.js";
import { Names } from "../../../../utils/on-lang/index.js";
import { BoxProviderTemplate } from "../BoxProviderTemplate.js";

export class PartPropertyBoxHelper {
    private _myTemplate: BoxProviderTemplate;

    constructor(myTemplate: BoxProviderTemplate) {
        this._myTemplate = myTemplate;
    }

    public generateReferenceProjection(
        // @ts-ignore
        language: FreMetaLanguage,
        appliedFeature: FreMetaConceptProperty,
        element: string,
    ): string {
        const featureType = Names.classifier(appliedFeature.type);
        this._myTemplate.imports.language.add(featureType);
        this._myTemplate.imports.root.add(Names.LanguageEnvironment);
        this._myTemplate.imports.core.add(Names.FreNodeReference).add("BoxUtil"). add("FreNamedNode");
        return `BoxUtil.referenceBox(
                                ${element},
                                "${appliedFeature.name}",
                                (selected: string | FreNamedNode) => {
                                const ref =
                                    typeof selected === "string"
                                    ? ${Names.FreNodeReference}.create<${featureType}>(selected, "${featureType}")
                                    : ${Names.FreNodeReference}.create<${featureType}>(selected as ${featureType}, "${featureType}");
                                    ${element}.${appliedFeature.name} = ref;
                                },
                                ${Names.LanguageEnvironment}.getInstance().scoper
               )`;
    }
}
