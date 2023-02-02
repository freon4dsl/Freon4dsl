import { Names } from "../../../utils";
import { FreClassifier, FreLanguage, FreLimitedConcept } from "../../../languagedef/metalanguage";
import { FreEditUnit } from "../../metalanguage";

export class EditorIndexTemplate {

    generateGenIndex(language: FreLanguage, editorDef: FreEditUnit, extraClassifiers: FreClassifier[]): string {
        let boxProviderConcepts: FreClassifier[] = [];
        language.concepts.forEach(concept => {
            if (!(concept instanceof FreLimitedConcept) && !concept.isAbstract) {
                boxProviderConcepts.push(concept);
            }
        });
        language.units.forEach(concept => {
            boxProviderConcepts.push(concept);
        });
        boxProviderConcepts.push(...extraClassifiers);
        return `
        export * from "./${Names.actions(language)}";
        export * from "./${Names.defaultActions(language)}";
        ${boxProviderConcepts.map(cls => 
            `export * from "./${Names.boxProvider(cls)}";`
        ).join("")}
        export * from "./EditorDef";
        `;
    }

    generateIndex(language: FreLanguage, editorDef: FreEditUnit): string {
        return `
        export * from "./gen";
        export * from "./${Names.customProjection(language)}";
        export * from "./${Names.customActions(language)}";
        `;
    }

}
