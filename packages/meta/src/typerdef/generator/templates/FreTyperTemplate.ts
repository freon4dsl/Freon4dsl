import { Names } from "../../../utils/on-lang/index.js"
import type { FreMetaLanguage } from "../../../languagedef/metalanguage/index.js";
import { LOG2USER } from '../../../utils/basic-dependencies/index.js';

/**
 * This class generates the index files for the 'gen' folder and the folder with the custom typer.
 */
export class FreTyperTemplate {

    generateGenIndex(language: FreMetaLanguage): string {
        if (language === undefined || language === null) {
            LOG2USER.error("Could not create index, because language was not set.");
            return "";
        }
        return `
        export * from "./${Names.typerPart(language)}.js";
        export * from "./${Names.typerDef(language)}.js";
        `;
    }

    generateIndex(language: FreMetaLanguage): string {
        if (language === undefined || language === null) {
            LOG2USER.error("Could not create index, because language was not set.");
            return "";
        }
        return `
        export * from "./index.js";
        `;
    }
}
