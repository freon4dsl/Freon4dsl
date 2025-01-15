import { type FreEnvironment, type IServerCommunication } from "@freon4dsl/core";
import { LanguageInitializer } from "./language/LanguageInitializer.js";

/**
 * Web configuration singleton.
 */
export class WebappConfigurator {
    private static instance: WebappConfigurator = null;

    static getInstance(): WebappConfigurator {
        if (WebappConfigurator.instance === null) {
            WebappConfigurator.instance = new WebappConfigurator();
        }
        return WebappConfigurator.instance;
    }

    serverCommunication: IServerCommunication;
    editorEnvironment: FreEnvironment;

    /**
     * Sets the object that will perform the communication with the server
     * @param serverCommunication
     */
    setServerCommunication(serverCommunication: IServerCommunication): void {
        WebappConfigurator.getInstance().serverCommunication = serverCommunication;
    }

    /**
     * Sets the language environment, so the webapp knows all information of the language.
     * @param editorEnvironment
     */
    setEditorEnvironment(editorEnvironment: FreEnvironment): void {
        WebappConfigurator.getInstance().editorEnvironment = editorEnvironment;
        LanguageInitializer.initialize();
    }
}
