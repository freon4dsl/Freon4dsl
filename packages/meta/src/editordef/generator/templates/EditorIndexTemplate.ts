import { Names } from "../../../utils/Names";
import { PiLanguageUnit } from "../../../languagedef/metalanguage/PiLanguage";

export class EditorIndexTemplate {
    constructor() {
    }

    generateGenIndex(language: PiLanguageUnit): string {
        return `
        export * from "./${Names.actions(language)}";
        export * from "./${Names.defaultActions(language)}";
        export * from "./${Names.context(language)}";
        export * from "./${Names.projectionDefault(language)}";
        export * from "./${Names.mainProjectionalEditor}";
        `;
    }

    generateIndex(language: PiLanguageUnit): string {
        return `
        export * from "./gen";
        export * from "./${Names.projection(language)}";
        export * from "./${Names.manualActions(language)}";
        `;
    }

}
