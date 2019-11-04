import { Names } from "./Names";
import { PiLanguage } from "../PiLanguage";

export class EditorIndexTemplate {
    constructor() {
    }

    generateIndex(language: PiLanguage): string {
        return `
        export * from "./${Names.actions(language)}";
        export * from "./${Names.context(language)}";
        export * from "./${Names.projection(language)}";
        export * from "./${Names.mainProjectionalEditor(language)}";
        `;
    }

}
