import { Names } from "../../../utils";
import { PiLanguage } from "../../../languagedef/metalanguage";
import { PiEditUnit } from "../../metalanguage";

export class EditorIndexTemplate {

    generateGenIndex(language: PiLanguage, editorDef: PiEditUnit): string {
        return `
        export * from "./${Names.actions(language)}";
        export * from "./${Names.defaultActions(language)}";
        ${editorDef.projectiongroups.map(group => 
            `export * from "./${Names.projection(group)}";`
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
