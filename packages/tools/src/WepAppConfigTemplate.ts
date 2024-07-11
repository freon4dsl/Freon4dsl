export class WebAppConfigTemplate {

    generate(languageName: string): string {
        const name = this.toFirstUpper(languageName);
        return `import type { FreEnvironment, IServerCommunication } from "@freon4dsl/core";
import { LanguageInitializer } from "../language/LanguageInitializer";
import { ServerCommunication } from "@freon4dsl/core";

/**
 * The one and only reference to the actual language for which this editor runs
 */
import { ${name}Environment } from "../../${languageName}/config/gen/${name}Environment";
export const editorEnvironment: FreEnvironment = ${name}Environment.getInstance();
LanguageInitializer.initialize();

/**
 * The one and only reference to the server on which the models are stored
 */
export const serverCommunication: IServerCommunication = ServerCommunication.getInstance();
// export const serverCommunication: IServerCommunication = MpsServerCommunication.getInstance();
`
    }

    protected toFirstUpper(text: string): string {
        return text[0].toUpperCase().concat(text.substr(1));
    }
}
