import { Names } from "../../../utils";
import { FreMetaClassifier, FreMetaLanguage, FreMetaLimitedConcept } from "../../../languagedef/metalanguage";
import { FreEditUnit } from "../../metalanguage";

export class EditorIndexTemplate {

    generateGenIndex(language: FreMetaLanguage, editorDef: FreEditUnit, extraClassifiers: FreMetaClassifier[]): string {
        const boxProviderConcepts: FreMetaClassifier[] = [];
        language.concepts.forEach(concept => {
            if (!(concept instanceof FreMetaLimitedConcept) && !concept.isAbstract) {
                boxProviderConcepts.push(concept);
            }
        });
        language.units.forEach(concept => {
            boxProviderConcepts.push(concept);
        });
        boxProviderConcepts.push(...extraClassifiers);
        return ` ${language.usedLanguages.map(lang => `  
            export * from "./${Names.actions(language)}";
            export * from "./${Names.defaultActions(language)}";`).join("")} 
        ${boxProviderConcepts.map(cls => `export * from "./${Names.boxProvider(cls)}";` ).join("")} 
            export * from "./EditorDef"; `;
    }

    generateIndex(language: FreMetaLanguage, editorDef: FreEditUnit): string {
        return `
        export * from "./gen";
        export * from "./${Names.customProjection(language)}";
        export * from "./${Names.customActions(language)}";
        `;
    }

}
