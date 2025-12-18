import { Names } from "../../../utils/on-lang/index.js";
import type { FreMetaClassifier, FreMetaLanguage} from "../../../languagedef/metalanguage/index.js";
import { FreMetaLimitedConcept } from "../../../languagedef/metalanguage/index.js";
import { NamesForEditor } from '../../../utils/on-lang-and-editor/index.js';

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
        ${boxProviderConcepts.map(cls => `export * from "./${NamesForEditor.boxProvider(cls)}.js";` ).join("")} 
            export * from "./EditorDef.js"; `;
    }
}
