import { Names } from "../../../utils/index.js"
import { FreMetaLanguage } from "../../metalanguage/index.js"

export class RootIndexTemplate {
    generateRootIndex(language: FreMetaLanguage): string {
        // the template starts here
        return `export { ${Names.environment(language)} as LanguageEnvironment } from "./config/gen/${Names.environment(language)}.js"
                export * from "./language/gen/index.js"`
    }
}
