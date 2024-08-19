import { Names } from "../../../utils/index.js";
import { FreMetaClassifier, FreMetaLanguage, FreMetaLimitedConcept } from "../../../languagedef/metalanguage/index.js";

export class EditorIndexTemplate {
    generateGenIndex(language: FreMetaLanguage, extraClassifiers: FreMetaClassifier[]): string {
        const boxProviderConcepts: FreMetaClassifier[] = [];
        language.concepts.forEach((concept) => {
            if (!(concept instanceof FreMetaLimitedConcept) && !concept.isAbstract) {
                boxProviderConcepts.push(concept);
            }
        });
        language.units.forEach((concept) => {
            boxProviderConcepts.push(concept);
        });
        boxProviderConcepts.push(...extraClassifiers);
        // todo remove the loop over usedLanguages, it is unused
        // @ts-expect-error
        return ` ${language.usedLanguages.map(lang => `  
            export * from "./${Names.actions(language)}";
            export * from "./${Names.defaultActions(language)}";`).join("")} 
        ${boxProviderConcepts.map(cls => `export * from "./${Names.boxProvider(cls)}";` ).join("")} 
            export * from "./EditorDef"; `;
    }

    generateIndex(language: FreMetaLanguage): string {
        return `
        export * from "./gen";
        export * from "./${Names.customProjection(language)}";
        export * from "./${Names.customActions(language)}";
        `;
    }
}
