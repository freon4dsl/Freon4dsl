import { Names } from "../../../utils";
import { PiClassifier, PiLanguage, PiLimitedConcept } from "../../../languagedef/metalanguage";
import { PiEditUnit } from "../../metalanguage";

export class EditorIndexTemplate {

    generateGenIndex(language: PiLanguage, editorDef: PiEditUnit, extraClassifiers: PiClassifier[]): string {
        let boxProviderConcepts: PiClassifier[] = [];
        language.concepts.forEach(concept => {
            if (!(concept instanceof PiLimitedConcept) && !concept.isAbstract) {
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

    generateIndex(language: PiLanguage, editorDef: PiEditUnit): string {
        return `
        export * from "./gen";
        export * from "./${Names.customProjection(language)}";
        export * from "./${Names.customActions(language)}";
        `;
    }

}
