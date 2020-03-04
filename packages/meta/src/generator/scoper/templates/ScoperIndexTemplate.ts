import { Names } from "../../Names";
import { PiLanguage } from "../../../metalanguage/PiLanguage";

export class ScoperIndexTemplate {
    constructor() {
    }

    generateIndex(language: PiLanguage): string {
        return `
        export * from "./${Names.namespace(language)}";
        export * from "./${Names.scoper(language)}";
        `;
    }

}
