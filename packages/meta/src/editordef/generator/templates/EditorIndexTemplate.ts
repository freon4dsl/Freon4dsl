import { Names } from "../../../utils/on-lang/index.js";
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
            export * from "./${Names.actions(language)}.js";
            export * from "./${Names.defaultActions(language)}.js";`).join("")} 
        ${boxProviderConcepts.map(cls => `export * from "./${Names.boxProvider(cls)}.js";` ).join("")} 
            export * from "./EditorDef.js"; `;
    }

    generateIndex(language: FreMetaLanguage): string {
        return `
        export * from "./gen/index.js";
        export * from "./${Names.customProjection(language)}.js";
        export * from "./${Names.customActions(language)}.js";
        `;
    }
}
