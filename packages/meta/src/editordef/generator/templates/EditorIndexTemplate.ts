import { Names } from "../../../utils/Names";
import { PiLanguage } from "../../../languagedef/metalanguage/PiLanguage";
import { PiEditUnit } from "../../metalanguage";

export class EditorIndexTemplate {
    constructor() {
    }

    generateGenIndex(language: PiLanguage, editorDef: PiEditUnit): string {
        return `
        export * from "./${Names.actions(language)}";
        export * from "./${Names.defaultActions(language)}";
        export * from "./${Names.projectionDefault(language)}";
        `;
    }

    generateIndex(language: PiLanguage, editorDef: PiEditUnit): string {
        return `
        export * from "./gen";
        export * from "./${Names.customProjection(language)}";
        export * from "./${Names.customActions(language)}";
        export * from "./${Names.initialization(language)}";
        `;
    }

}
